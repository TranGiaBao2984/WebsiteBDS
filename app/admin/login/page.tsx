import LoginForm from '@/app/front/admin/LoginForm';
export const instant = false;
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="font-serif text-lg font-bold uppercase tracking-[0.15em] text-[#2c2623]">MII SHINTANI</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8c827a]">Khu vực quản trị</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
