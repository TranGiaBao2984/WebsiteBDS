import type { Language } from './index';

// Nhãn riêng của trang chi tiết BĐS (/properties/[id]).
// Kiểu Record<Language, ...> buộc cả 3 ngôn ngữ phải có đủ mọi khoá, thiếu khoá nào TypeScript báo ngay.
// Các nhãn dùng chung với phần khác của web (Home, Properties) vẫn lấy từ dictionaries trong index.ts.

export type DetailText = {
  noPhotos: string;
  houseNote: string;
  landNote: string;
  builtBadge: (year: number) => string;
  inquireCta: string;
  whatsappMsg: string; // Tiêu đề căn nhà và ID được nối vào phía sau
  mailSubject: string; // Tiêu đề căn nhà được nối vào phía sau
  gallery: string;
  photosCount: (n: number) => string;
  details: string;
  floorPlan: string;
  morePhotos: string;
  location: string;
  viewOnMap: string;
  similar: string;
  viewAll: string;
  fields: {
    price: string;
    buildingSize: string;
    landSize: string;
    layout: string;
    structure: string;
    yearBuilt: string;
    status: string;
    parking: string;
    landRights: string;
    zoning: string;
    access: string;
  };
};

export const detailText: Record<Language, DetailText> = {
  en: {
    noPhotos: 'No photos yet',
    houseNote: '(house)',
    landNote: '(land)',
    builtBadge: (y) => `Built ${y}`,
    inquireCta: 'INQUIRE ABOUT THIS PROPERTY →',
    whatsappMsg: 'Hello Mii, I am interested in this property: ',
    mailSubject: 'Inquiry: ',
    gallery: 'Gallery',
    photosCount: (n) => `${n} photos`,
    details: 'Property details',
    floorPlan: 'Floor plan',
    morePhotos: 'More photos',
    location: 'Location',
    viewOnMap: 'View on map ↗',
    similar: 'Similar properties',
    viewAll: 'View all →',
    fields: {
      price: 'Price',
      buildingSize: 'Building size',
      landSize: 'Land size',
      layout: 'Layout',
      structure: 'Structure',
      yearBuilt: 'Year built',
      status: 'Current status',
      parking: 'Parking',
      landRights: 'Land rights',
      zoning: 'Zoning',
      access: 'Access',
    },
  },
  ja: {
    noPhotos: '写真はまだありません',
    houseNote: '(建物)',
    landNote: '(土地)',
    builtBadge: (y) => `${y}年築`,
    inquireCta: 'この物件について問い合わせる →',
    whatsappMsg: 'Mii さん、こんにちは。こちらの物件に興味があります: ',
    mailSubject: 'お問い合わせ: ',
    gallery: 'ギャラリー',
    photosCount: (n) => `${n}枚`,
    details: '物件詳細',
    floorPlan: '間取り図',
    morePhotos: 'その他の写真',
    location: '所在地',
    viewOnMap: '地図で見る ↗',
    similar: '類似の物件',
    viewAll: 'すべて見る →',
    fields: {
      price: '価格',
      buildingSize: '建物面積',
      landSize: '土地面積',
      layout: '間取り',
      structure: '構造',
      yearBuilt: '築年',
      status: '現況',
      parking: '駐車場',
      landRights: '土地権利',
      zoning: '用途地域',
      access: '交通',
    },
  },
  vi: {
    noPhotos: 'Chưa có hình ảnh',
    houseNote: '(nhà)',
    landNote: '(đất)',
    builtBadge: (y) => `Xây năm ${y}`,
    inquireCta: 'TƯ VẤN VỀ BẤT ĐỘNG SẢN NÀY →',
    whatsappMsg: 'Xin chào Mii, tôi quan tâm BĐS: ',
    mailSubject: 'Tư vấn: ',
    gallery: 'Thư viện ảnh',
    photosCount: (n) => `${n} ảnh`,
    details: 'Thông tin chi tiết',
    floorPlan: 'Bản vẽ mặt bằng',
    morePhotos: 'Thêm hình ảnh',
    location: 'Vị trí',
    viewOnMap: 'Xem trên bản đồ ↗',
    similar: 'Bất động sản tương tự',
    viewAll: 'Xem tất cả →',
    fields: {
      price: 'Giá',
      buildingSize: 'Diện tích nhà',
      landSize: 'Diện tích đất',
      layout: 'Mặt bằng',
      structure: 'Kết cấu',
      yearBuilt: 'Năm xây',
      status: 'Tình trạng',
      parking: 'Chỗ đậu xe',
      landRights: 'Quyền đất',
      zoning: 'Quy hoạch',
      access: 'Giao thông',
    },
  },
};