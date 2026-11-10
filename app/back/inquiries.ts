'use server';

import { supabase } from '@/lib/supabase';
import type { Inquiry } from '@/lib/types';
import {
  buildCustomerEmail,
  buildOwnerEmail,
  toLang,
  type EmailLead,
  type Lang,
} from './emails';
import { Client } from '@notionhq/client';

// Làm sạch dữ liệu đầu vào
const clean = (v: string | null | undefined, max: number) =>
  (v ?? '').trim().slice(0, max);

// Lấy tên bất động sản từ Supabase
async function getPropertyTitle(
  id: string | null
): Promise<string | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Lỗi lấy tên bất động sản:', error.message);
      return null;
    }

    return typeof data?.title === 'string' ? data.title : null;
  } catch (error) {
    console.error('Không thể truy vấn bất động sản:', error);
    return null;
  }
}

// Gửi lead sang Notion CRM
async function sendToNotion(
  lead: EmailLead,
  propertyTitle: string | null
): Promise<void> {
  const apiKey = process.env.NOTION_API_KEY;
  const dbId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !dbId) {
    console.warn(
      'Thiếu NOTION_API_KEY hoặc NOTION_DATABASE_ID. Bỏ qua đồng bộ Notion.'
    );
    return;
  }

  // Chỉ khởi tạo Client khi đã có API key
  const notion = new Client({ auth: apiKey });

  try {
    await notion.pages.create({
      parent: {
        database_id: dbId,
      },
      properties: {
        'Họ tên': {
          title: [
            {
              text: {
                content: lead.full_name,
              },
            },
          ],
        },

        Email: {
          email: lead.email,
        },

        'Số điện thoại': {
          phone_number: lead.phone || null,
        },

        'Bất động sản quan tâm': {
          rich_text: [
            {
              text: {
                content: propertyTitle || 'Tư vấn chung',
              },
            },
          ],
        },

        'Lời nhắn': {
          rich_text: [
            {
              text: {
                content: lead.message || 'Không có lời nhắn',
              },
            },
          ],
        },

        'Trạng thái': {
          select: {
            name: 'New Lead',
          },
        },
      },
    });

    console.log('Đã đồng bộ lead sang Notion thành công!');
  } catch (error) {
    console.error('Lỗi đồng bộ dữ liệu lên Notion:', error);
  }
}

// Gửi email qua Resend
async function send(
  apiKey: string,
  body: Record<string, unknown>
): Promise<void> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(
        'Resend lỗi:',
        res.status,
        await res.text()
      );
    }
  } catch (error) {
    console.error('Gửi email qua Resend thất bại:', error);
  }
}

// Gửi email thông báo cho chủ website và email xác nhận cho khách
async function sendEmails(
  lead: EmailLead,
  lang: Lang,
  propertyTitle: string | null
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const owner = process.env.NOTIFY_EMAIL;

  if (!apiKey || !owner) {
    console.warn(
      'Thiếu RESEND_API_KEY hoặc NOTIFY_EMAIL. Bỏ qua gửi email.'
    );
    return;
  }

  // Email gửi đi phải thuộc domain đã xác minh trên Resend
  const fromAddress = process.env.EMAIL_FROM_ADDRESS;

  // Ví dụ: https://ten-mien.com
  const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '');

  const propertyUrl =
    lead.property_id && /^https?:\/\//.test(siteUrl)
      ? `${siteUrl}/properties/${encodeURIComponent(
          lead.property_id
        )}`
      : null;

  const ctx = {
    propertyTitle,
    propertyUrl,
  };

  // Email thông báo lead mới cho chủ website
  const jobs: Promise<void>[] = [
    send(apiKey, {
      from: `Website <${
        fromAddress ?? 'onboarding@resend.dev'
      }>`,
      to: [owner],
      reply_to: lead.email,
      ...buildOwnerEmail(lead, ctx),
    }),
  ];

  // Chỉ gửi email xác nhận cho khách khi đã cấu hình EMAIL_FROM_ADDRESS
  if (fromAddress) {
    jobs.push(
      send(apiKey, {
        from: `Mii Shintani <${fromAddress}>`,
        to: [lead.email],
        reply_to: owner,
        ...buildCustomerEmail(lang, lead, ctx),
      })
    );
  }

  await Promise.all(jobs);
}

// Tạo inquiry từ form liên hệ
export async function createInquiry(
  payload: Inquiry,
  lang?: string
): Promise<{ success: boolean; error?: string }> {
  // Chuẩn hóa dữ liệu
  const data: EmailLead = {
    property_id: payload.property_id ?? null,
    full_name: clean(payload.full_name, 100),
    email: clean(payload.email, 200),
    phone: clean(payload.phone, 40),
    message: clean(payload.message, 2000),
  };

  // Kiểm tra dữ liệu đầu vào
  if (
    !data.full_name ||
    !/^\S+@\S+\.\S+$/.test(data.email)
  ) {
    return {
      success: false,
      error: 'Invalid input',
    };
  }

  // Bước 1: Lưu lead vào Supabase
  const { error } = await supabase
    .from('inquiries')
    .insert([data]);

  if (error) {
    console.error(
      'Lỗi tạo inquiry trong Supabase:',
      error.message
    );

    return {
      success: false,
      error: 'Could not save your request.',
    };
  }

  // Bước 2: Lấy tên bất động sản một lần
  const propertyTitle = await getPropertyTitle(
    data.property_id
  );

  // Bước 3: Gửi email và đồng bộ Notion song song
  // Lỗi tại hai dịch vụ này không làm mất lead đã lưu
  await Promise.all([
    sendEmails(data, toLang(lang), propertyTitle),
    sendToNotion(data, propertyTitle),
  ]);

  // Bước 4: Trả kết quả thành công
  return {
    success: true,
  };
}