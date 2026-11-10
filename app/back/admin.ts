'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';
import { isAdminUser } from '@/lib/admin-auth';
import { parsePropertyInput, type FieldErrors } from '@/lib/property-schema';
import { IMAGE_BUCKET, storagePathFromUrl } from '@/lib/storage';

export type SaveResult = { ok: false; error: string; fieldErrors?: FieldErrors };

const SESSION_EXPIRED = 'Phiên đăng nhập đã hết hạn. Hãy tải lại trang và đăng nhập lại.';

/** Mỗi action đều tự kiểm tra quyền, không dựa vào việc trang đã chặn hay chưa. */
async function getAdminClient() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminUser(user) ? supabase : null;
}

/** Xoá file ảnh trong Storage. Chỉ đụng tới ảnh nằm trong bucket của mình, bỏ qua ảnh dán link ngoài. */
async function removeStorageFiles(supabase: SupabaseClient, urls: Array<string | null | undefined>) {
  const paths = urls
    .map((u) => (u ? storagePathFromUrl(u) : null))
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  if (error) console.error('Không xoá được file ảnh:', error.message);
}

/* ------------------------------------------------------------------ */
/* Đăng nhập / đăng xuất                                               */
/* ------------------------------------------------------------------ */

export async function signIn(email: string, password: string): Promise<{ error: string }> {
  const e = typeof email === 'string' ? email.trim().slice(0, 200) : '';
  const p = typeof password === 'string' ? password.slice(0, 200) : '';
  if (!e || !p) return { error: 'Vui lòng nhập email và mật khẩu.' };

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });

  // Thông báo chung chung, không tiết lộ email có tồn tại hay không
  if (error || !data.user) return { error: 'Email hoặc mật khẩu không đúng.' };

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return { error: 'Tài khoản này không có quyền quản trị.' };
  }

  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/* ------------------------------------------------------------------ */
/* Thêm / sửa / xoá bất động sản                                       */
/* ------------------------------------------------------------------ */

/** id = null: thêm mới. id có giá trị: cập nhật. Thành công thì chuyển về /admin. */
export async function saveProperty(id: string | null, input: unknown): Promise<SaveResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  if (id !== null && (typeof id !== 'string' || !id)) {
    return { ok: false, error: 'Mã bất động sản không hợp lệ.' };
  }

  const parsed = parsePropertyInput(input);
  if (!parsed.ok) {
    return { ok: false, error: 'Vui lòng kiểm tra lại các mục báo đỏ.', fieldErrors: parsed.errors };
  }
  const { row } = parsed;

  if (id) {
    const { data: old } = await supabase
      .from('properties')
      .select('images, floor_plan')
      .eq('id', id)
      .maybeSingle();

    const { data, error } = await supabase.from('properties').update(row).eq('id', id).select('id');
    if (error) return { ok: false, error: `Không lưu được: ${error.message}` };
    if (!data || data.length === 0) {
      return { ok: false, error: 'Không tìm thấy bất động sản này, hoặc tài khoản không có quyền sửa.' };
    }

    // Dọn các ảnh đã bị gỡ khỏi bài viết
    const kept = new Set<string>([...row.images, ...(row.floor_plan ? [row.floor_plan] : [])]);
    const previous: string[] = [...(old?.images ?? []), ...(old?.floor_plan ? [old.floor_plan] : [])];
    await removeStorageFiles(
      supabase,
      previous.filter((u) => !kept.has(u))
    );
  } else {
    const { error } = await supabase.from('properties').insert(row);
    if (error) return { ok: false, error: `Không lưu được: ${error.message}` };
  }

  updateTag('properties'); // làm mới ngay các trang công khai đang được cache
  redirect('/admin');
}

export async function deleteProperty(id: string): Promise<{ error?: string }> {
  const supabase = await getAdminClient();
  if (!supabase) return { error: SESSION_EXPIRED };
  if (typeof id !== 'string' || !id) return { error: 'Mã bất động sản không hợp lệ.' };

  const { data: old } = await supabase
    .from('properties')
    .select('images, floor_plan')
    .eq('id', id)
    .maybeSingle();

  const { data, error } = await supabase.from('properties').delete().eq('id', id).select('id');
  if (error) return { error: `Không xoá được: ${error.message}` };
  if (!data || data.length === 0) {
    return { error: 'Không xoá được: không tìm thấy bất động sản, hoặc tài khoản không có quyền.' };
  }

  await removeStorageFiles(supabase, [...(old?.images ?? []), old?.floor_plan]);

  updateTag('properties');
  revalidatePath('/admin');
  return {};
}
