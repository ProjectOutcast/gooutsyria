type Neighborhood = { slug: string; nameAr: string };

export function SearchBar({
  citySlug,
  defaultValue = "",
  defaultNeighborhood = "",
  neighborhoods = [],
  size = "md",
}: {
  citySlug: string;
  defaultValue?: string;
  defaultNeighborhood?: string;
  neighborhoods?: Neighborhood[];
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  return (
    <form action={`/${citySlug}/restaurants`} method="GET" className="w-full">
      <div
        className={`flex items-stretch bg-white overflow-hidden ${
          lg
            ? "rounded-[18px] shadow-search p-2 gap-2"
            : "rounded-xl border border-hairline p-1.5 gap-1.5"
        }`}
      >
        <div className="flex items-center flex-1 min-w-0 ps-3 gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={defaultValue}
            placeholder="ابحث عن مطعم، مطبخ، أو طبق…"
            className={`w-full bg-transparent focus:outline-none text-ink placeholder:text-muted2 ${
              lg ? "py-2.5 text-base" : "py-1.5 text-sm"
            }`}
          />
        </div>

        {neighborhoods.length > 0 && (
          <div className="hidden sm:flex items-center border-s border-hairline ps-3 pe-1 gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <select
              name="neighborhood"
              defaultValue={defaultNeighborhood}
              className={`bg-transparent focus:outline-none text-ink cursor-pointer ${lg ? "text-[15px]" : "text-sm"}`}
            >
              <option value="">كل المناطق</option>
              {neighborhoods.map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className={`shrink-0 inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-700 text-white font-bold transition ${
            lg
              ? "rounded-[12px] px-6 text-base shadow-accent"
              : "rounded-lg px-4 text-sm"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          ابحث
        </button>
      </div>
    </form>
  );
}
