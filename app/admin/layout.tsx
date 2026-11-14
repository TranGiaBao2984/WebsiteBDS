export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F0FDFA] text-[#134E4A]">
      {children}
    </div>
  );
}