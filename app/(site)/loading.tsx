export default function SiteLoading() {
  return (
    <div className="w-full animate-pulse space-y-8 px-6 py-10 sm:px-10 lg:px-16 2xl:px-24">
      <div className="space-y-3 border-b border-[#E5DFD6] pb-6">
        <div className="h-3 w-40 rounded bg-[#E5DFD6]" />
        <div className="h-9 w-72 rounded-lg bg-[#E5DFD6]" />
        <div className="h-4 w-96 max-w-full rounded bg-[#F2EFE9]" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-[#E5DFD6] bg-white"
          >
            <div className="aspect-4/3 bg-[#F2EFE9]" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-28 rounded bg-[#F2EFE9]" />
              <div className="h-5 w-4/5 rounded bg-[#E5DFD6]" />
              <div className="border-t border-[#E5DFD6] pt-4">
                <div className="h-6 w-32 rounded bg-[#E5DFD6]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}