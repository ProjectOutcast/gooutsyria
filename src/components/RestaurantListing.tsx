import { auth } from "@/lib/auth";
import {
  searchRestaurants,
  getFeaturedRestaurants,
  getFacets,
  getSavedIds,
  getActiveSponsor,
  PAGE_SIZE,
  type SearchFilters,
} from "@/lib/queries";
import { formatNum } from "@/lib/format";
import { RestaurantCard } from "./RestaurantCard";
import { FiltersSidebar } from "./FiltersSidebar";
import { SortSelect } from "./SortSelect";
import { ActiveFilterChips } from "./ActiveFilterChips";
import { Pagination } from "./Pagination";
import type { RawSearchParams } from "@/lib/searchParams";

/** Shared listing block: sticky filter sidebar + results grid with sponsored slots. */
export async function RestaurantListing({
  citySlug,
  filters,
  rawParams,
  basePath,
  hideCuisines = false,
}: {
  citySlug: string;
  filters: SearchFilters;
  rawParams: RawSearchParams;
  basePath: string;
  hideCuisines?: boolean;
}) {
  const session = await auth();
  const [facets, result, sponsored, inlineSponsor] = await Promise.all([
    getFacets(),
    searchRestaurants(citySlug, filters),
    (filters.page ?? 1) === 1
      ? getFeaturedRestaurants(filters.cuisines?.length === 1 ? "CUISINE" : "SEARCH", {
          cuisineSlug: filters.cuisines?.length === 1 ? filters.cuisines[0] : undefined,
          take: 1,
        })
      : Promise.resolve([]),
    getActiveSponsor("SEARCH_BANNER"),
  ]);

  const sponsoredIds = new Set(sponsored.map((r) => r.id));
  const organic = result.restaurants.filter((r) => !sponsoredIds.has(r.id));
  const allCards = [...sponsored.map((r) => ({ r, sp: true })), ...organic.map((r) => ({ r, sp: false }))];
  const savedIds = await getSavedIds(
    session?.user?.id,
    allCards.map((c) => c.r.id)
  );

  const firstHalf = allCards.slice(0, 6);
  const secondHalf = allCards.slice(6);

  return (
    <div className="grid lg:grid-cols-[288px_1fr] gap-[26px] items-start">
      <FiltersSidebar
        features={facets.features.map((f) => ({
          slug: f.slug,
          nameAr: f.nameAr,
          icon: f.icon,
          count: f._count.restaurants,
        }))}
        cuisines={facets.cuisines.map((c) => ({
          slug: c.slug,
          nameAr: c.nameAr,
          icon: c.icon,
          count: c._count.restaurants,
        }))}
        hideCuisines={hideCuisines}
      />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-ink2">
            <strong className="text-ink font-bold">{formatNum(result.total)}</strong> نتيجة
          </p>
          <SortSelect />
        </div>

        <div className="mb-4">
          <ActiveFilterChips
            basePath={basePath}
            rawParams={rawParams}
            labels={{
              features: new Map(facets.features.map((f) => [f.slug, f.nameAr])),
              cuisines: new Map(facets.cuisines.map((c) => [c.slug, c.nameAr])),
            }}
          />
        </div>

        {result.total === 0 && (
          <p className="bg-white border border-hairline rounded-2xl p-8 text-center text-ink2">
            لا توجد نتائج مطابقة — جرّب تعديل الفلاتر أو البحث بكلمات أخرى.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {firstHalf.map(({ r, sp }) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              sponsored={sp}
              saved={savedIds.has(r.id)}
            />
          ))}
        </div>

        {inlineSponsor && secondHalf.length > 0 && (
          <a
            href={inlineSponsor.linkUrl ?? "#"}
            target="_blank"
            rel="noopener sponsored"
            className="relative block my-4 rounded-2xl bg-gradient-to-l from-ink to-primary-900 text-white p-6"
          >
            <span className="absolute top-3 start-3 bg-white/15 text-white/80 text-[11px] rounded-full px-2.5 py-0.5">
              إعلان
            </span>
            <span className="block pt-3 font-bold text-lg">{inlineSponsor.name}</span>
          </a>
        )}

        {secondHalf.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4">
            {secondHalf.map(({ r, sp }) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                sponsored={sp}
                saved={savedIds.has(r.id)}
              />
            ))}
          </div>
        )}

        <Pagination
          page={result.page}
          total={result.total}
          pageSize={PAGE_SIZE}
          basePath={basePath}
          searchParams={rawParams}
        />
      </div>
    </div>
  );
}
