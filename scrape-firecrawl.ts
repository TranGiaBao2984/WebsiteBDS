import FirecrawlApp from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';
import type { Property } from './lib/types';

// Khởi tạo SDK Firecrawl
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Schema định nghĩa các trường dữ liệu
const propertyExtractSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Tên hoặc tiêu đề căn nhà' },
    price: {
      type: 'number',
      description: 'Giá bán quy đổi ra số Yên thuần túy (Ví dụ 1500万 -> 15000000)',
    },
    location: { type: 'string', description: 'Địa chỉ đầy đủ hoặc Tỉnh/Thành' },
    building_size: { type: 'string', description: 'Diện tích sàn xây dựng' },
    land_size: { type: 'string', description: 'Diện tích đất' },
    layout: { type: 'string', description: 'Cấu trúc phòng (1LDK, 3LDK...)' },
    structure: { type: 'string', description: 'Kết cấu nhà (Gỗ, RC...)' },
    year_built: { type: 'number', description: 'Năm xây dựng (chỉ lấy năm dạng số)' },
    current_status: { type: 'string', description: 'Trạng thái hiện tại' },
    description: { type: 'string', description: 'Mô tả tóm tắt căn nhà' },
    images: {
      type: 'array',
      items: { type: 'string' },
      description: 'Danh sách URL hình ảnh thực tế của căn nhà',
    },
  },
  required: ['title', 'price', 'location'],
};

async function scrapeSinglePropertyUrl(url: string) {
  console.log(`🌐 Đang bóc tách dữ liệu từ: ${url}`);

  try {
    const scrapeResult = await firecrawl.scrape(url, {
      formats: [
        {
          type: 'json',
          schema: propertyExtractSchema,
          prompt: 'Trích xuất thông tin bất động sản từ trang web này theo đúng schema.',
        },
      ],
    });

    // SỬA Ở ĐÂY: V2 không dùng .success nữa, chỉ cần kiểm tra !scrapeResult?.json
    if (!scrapeResult || !scrapeResult.json) {
      console.error(`❌ Không trích xuất được dữ liệu từ ${url}`);
      return;
    }

    const data = scrapeResult.json as Omit<Property, 'id' | 'created_at'>;

    // Bộ lọc bảo vệ: Chỉ chèn vào database nếu giá <= 2000 man (20.000.000 JPY)
    if (data.price && data.price <= 20000000) {
      const { error } = await supabase.from('properties').insert([
        {
          ...data,
          images: data.images?.length ? data.images : ['/placeholder.jpg'],
        },
      ]);

      if (error) {
        console.error('❌ Lỗi chèn Supabase:', error.message);
      } else {
        console.log(
          `✅ Đã thêm căn nhà thành công: ${data.title} (${data.price.toLocaleString()} JPY)`
        );
      }
    } else {
      console.log(
        `⚠️ Bỏ qua căn nhà "${data.title}" vì giá > 2000 man (${data.price} JPY).`
      );
    }
  } catch (err) {
    console.error('❌ Lỗi tiến trình Firecrawl:', err);
  }
}

async function main() {
  const sampleUrls = [
    // Điền link chi tiết căn nhà thực tế cần cào ở đây
    'https://www.athome.co.jp/kodate/chuko/',
  ];

  for (const url of sampleUrls) {
    await scrapeSinglePropertyUrl(url);
    await new Promise((res) => setTimeout(res, 1000));
  }
}

main();