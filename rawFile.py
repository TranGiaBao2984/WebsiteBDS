import datetime
import json
import re
import urllib.parse
import requests
from bs4 import BeautifulSoup
import pandas as pd

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8,vi;q=0.7",
}

# Ánh xạ từ khóa tiếng Nhật sang Tên trường tiêu chuẩn theo Schema
KEY_MAPPING = {
    "所在地": "location",
    "住所": "location",
    "建物面積": "building_size",
    "専有面積": "building_size",
    "延床面積": "building_size",
    "土地面積": "land_size",
    "敷地面積": "land_size",
    "間取り": "layout",
    "間取": "layout",
    "構造": "structure",
    "建物構造": "structure",
    "構造・工法": "structure",
    "現況": "current_status",
    "引渡可能時期": "current_status",
    "駐車場": "parking",
    "駐車": "parking",
    "土地権利": "land_rights",
    "土地の権利形態": "land_rights",
    "用途地域": "zoning",
    "交通": "access",
    "沿線・駅": "access",
    "備考": "description",
    "おすすめポイント": "description",
    "担当者より": "description",
    "その他概要・特記事項": "description",
    "物件の特徴": "description"
}

def clean_text(text):
    """Làm sạch khoảng trắng thừa và xóa các ký tự nút bấm giao diện web"""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    # Loại bỏ các cụm từ dính nút bấm như [ ■周辺環境 ], [ 乗り換え案内 ]
    text = re.sub(r'\[\s*■?.*?\]', '', text)
    return text.strip()

def parse_japanese_price(price_str):
    """Quy đổi giá tiền tiếng Nhật (425万円, 1億2000万円) về số nguyên JPY"""
    if not price_str:
        return None
    price_str = price_str.replace(',', '').strip()
    
    oku_match = re.search(r'(\d+(?:\.\d+)?)\s*億', price_str)
    man_match = re.search(r'(\d+(?:\.\d+)?)\s*万', price_str)
    
    total = 0
    if oku_match:
        total += float(oku_match.group(1)) * 100000000
    if man_match:
        total += float(man_match.group(1)) * 10000
        
    if not oku_match and not man_match:
        digits = re.search(r'\d+', price_str)
        if digits:
            total = float(digits.group(0))
            
    return int(total) if total > 0 else None

def parse_year_built(year_str):
    """Tách năm xây dựng về số nguyên Dương lịch (Integer)"""
    if not year_str:
        return None
    
    m = re.search(r'(19\d\d|20\d\d)', year_str)
    if m:
        return int(m.group(1))
    
    # Quy đổi các niên hiệu Nhật Bản
    reiwa = re.search(r'令和\s*(\d+|元)年', year_str)
    if reiwa:
        val = 1 if reiwa.group(1) == '元' else int(reiwa.group(1))
        return 2018 + val
        
    heisei = re.search(r'平成\s*(\d+|元)年', year_str)
    if heisei:
        val = 1 if heisei.group(1) == '元' else int(heisei.group(1))
        return 1988 + val

    showa = re.search(r'昭和\s*(\d+|元)年', year_str)
    if showa:
        val = 1 if showa.group(1) == '元' else int(showa.group(1))
        return 1925 + val

    return None

def extract_images(soup, base_url):
    """Lọc bỏ ảnh rác/icon hệ thống và tách riêng ảnh sơ đồ mặt bằng (floor_plan)"""
    images = []
    floor_plan = ""
    
    # Danh sách từ khóa ảnh giao diện/hệ thống cần bỏ qua
    ignore_keywords = [
        "logo", "icon", "banner", "btn_", "spacer", "common", "blank.gif",
        "pagetop", "mogecheck", "crrecruit", "txt_info", "assets", "static_app"
    ]
    ignore_exts = [".gif"]
    
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("rel")
        alt = clean_text(img.get("alt", ""))
        if not src:
            continue
            
        full_url = urllib.parse.urljoin(base_url, src)
        url_lower = full_url.lower()
        
        # Bỏ qua các ảnh giao diện
        if any(kw in url_lower for kw in ignore_keywords) or any(url_lower.endswith(ext) for ext in ignore_exts):
            continue
            
        # Nhận diện sơ đồ mặt bằng
        is_floor_plan = any(k in alt for k in ["間取り", "間取", "区画図", "区割図"]) or "madori" in url_lower
        if is_floor_plan and not floor_plan:
            floor_plan = full_url
        else:
            if full_url not in images:
                images.append(full_url)
                
    return images, floor_plan

def extract_table_pairs(soup):
    """Trích xuất linh hoạt các cặp thông tin từ Table và DL/DT/DD"""
    raw_dict = {}
    
    # Parse Table
    for row in soup.find_all("tr"):
        cells = row.find_all(["th", "td"])
        i = 0
        while i < len(cells):
            if cells[i].name == "th":
                key = clean_text(cells[i].text)
                if i + 1 < len(cells) and cells[i+1].name == "td":
                    val = clean_text(cells[i+1].text)
                    if key and val:
                        raw_dict[key] = val
                    i += 2
                else:
                    i += 1
            else:
                i += 1

    # Parse DL
    for dl in soup.find_all("dl"):
        dts = dl.find_all("dt")
        dds = dl.find_all("dd")
        if len(dts) == len(dds):
            for dt, dd in zip(dts, dds):
                key = clean_text(dt.text)
                val = clean_text(dd.text)
                if key and val:
                    raw_dict[key] = val

    return raw_dict

def scrape_property(url):
    print(f"[+] Đang cào dữ liệu từ: {url}")
    try:
        res = requests.get(url, headers=HEADERS, timeout=12)
        res.encoding = 'utf-8'
        if res.status_code != 200:
            print(f"[X] Lỗi truy cập status: {res.status_code}")
            return None
    except Exception as e:
        print(f"[X] Lỗi kết nối: {e}")
        return None

    soup = BeautifulSoup(res.text, "html.parser")
    
    item = {
        "title": "",
        "price": None,
        "location": "",
        "building_size": "",
        "land_size": "",
        "layout": "",
        "structure": "",
        "year_built": None,
        "current_status": "",
        "parking": "",
        "land_rights": "",
        "zoning": "",
        "access": "",
        "description": "",
        "images": [],
        "floor_plan": "",
        "url": url
    }

    # 1. Lấy Tiêu đề
    title_el = soup.find("h1") or soup.find("title")
    if title_el:
        item["title"] = clean_text(title_el.text)

    # 2. Cào các thuộc tính dạng bảng
    raw_dict = extract_table_pairs(soup)

    for raw_k, val in raw_dict.items():
        if "価格" in raw_k or "販売価格" in raw_k:
            if not item["price"]:
                item["price"] = parse_japanese_price(val)
        elif "築年月" in raw_k or "完成時期" in raw_k:
            if not item["year_built"]:
                item["year_built"] = parse_year_built(val)
        
        for jp_key, std_key in KEY_MAPPING.items():
            if jp_key in raw_k and not item[std_key]:
                item[std_key] = val

    # Backup lấy giá nếu bảng không chứa
    if not item["price"]:
        price_el = soup.select_one(".property_view_note-emphasis, .pdt-price, .main-price")
        if price_el:
            item["price"] = parse_japanese_price(price_el.text)

    # Backup lấy năm xây
    if not item["year_built"]:
        for text in soup.stripped_strings:
            if "築" in text and "年" in text:
                yb = parse_year_built(text)
                if yb:
                    item["year_built"] = yb
                    break

    # 3. Lọc danh sách ảnh & sơ đồ mặt bằng
    images, floor_plan = extract_images(soup, url)
    item["images"] = images
    item["floor_plan"] = floor_plan

    return item

def main():
    urls = [
        "https://www.athome.co.jp/kodate/6989724760/?DOWN=1&BKLISTID=001LPC&SEARCHDIV=1&sref=list_simple",
        "https://suumo.jp/chukoikkodate/niigata/sc_myoko/nc_21598718/"
    ]

    results = []
    for url in urls:
        data = scrape_property(url)
        if data:
            results.append(data)

    if results:
        # 1. Xuất file JSON sạch
        with open("danh_sach_bat_dong_san.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        # 2. Xuất file Excel
        excel_data = []
        for r in results:
            row = r.copy()
            row["images"] = "\n".join(r["images"])
            excel_data.append(row)

        df = pd.DataFrame(excel_data)

        target_columns = [
            "title", "price", "location", "building_size", "land_size",
            "layout", "structure", "year_built", "current_status", "parking",
            "land_rights", "zoning", "access", "description", "images",
            "floor_plan", "url"
        ]
        
        cols = [c for c in target_columns if c in df.columns]
        df = df[cols]

        # Tự động tạo file Excel có đuôi Timestamp để không bị đè/khóa file
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"danh_sach_bat_dong_san_{timestamp}.xlsx"
        
        try:
            df.to_excel(file_path, index=False, engine="openpyxl")
            print("\n" + "="*60)
            print(f"[✓] Đã xuất thành công {len(results)} bất động sản:")
            print(f"    - File Excel: {file_path}")
            print(f"    - File JSON:  danh_sach_bat_dong_san.json")
        except PermissionError:
            print(f"\n[X] Lỗi: Hãy đóng file Excel đang mở và chạy lại script!")
    else:
        print("Không cào được dữ liệu.")

if __name__ == "__main__":
    main()