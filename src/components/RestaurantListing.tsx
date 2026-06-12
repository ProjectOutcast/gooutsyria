import { db } from "@/lib/db";
import {
  searchRestaurants,
  getFeaturedRestaurants,
  PAGE_SIZE,
  type SearchFilters,
} from "@/lib/queries";
import { RestaurantCard } from "./RestaurantCard";
import { FilterBar } from "./FilterBar";
import { Pagination } from "./Pagination";
import type { RawSearchParams } from "@/lib/searchParams";

/** Shared listing block used by the restaurants page and the cuisine/neighborhood landing pages. */
export async function RestaurantListing({
  citySlug,
  filters,
  rawParams,
  basePath,
  hideCuisine = false,
  hideNeighborhood = false,
  showSearchSponsored = true,
}: {
  citySlug: string;
  filters: SearchFilters;
  rawParams: RawSearchParams;
  basePath: string;
  hideCuisine?: boolean;
  hideNeighborhood?: boolean;
  showSearchSponsored?: boolean;
}) {
  const [cuisines, neighborhoods, features, result, sponsored] =
    await Promise.all([
      db.cuisine.findMany({ orderBy: { nameAr: "asc" } }),
      db.neighborhood.findMany({
        where: { city: { slug: citySlug } },
        orderBy: { nameAr: "asc" },
      }),
      db.feature.findMany({ orderBy: { nameAr: "asc" } }),
      searchRestaurants(citySlug, filters),
      showSearchSponsored && (filters.page ?? 1) === 1
        ? getFeaturedRestaurants(filters.cuisine ? "CUISINE" : "SEARCH", {
            cuisineSlug: filters.cuisine,
            take: 2,
          })
        : Promise.resolve([]),
    ]);

  const sponsoredIds = new Set(sponsored.map((r) => r.id));
  const organic = result.restaurants.filter((r) => !sponsoredIds.has(r.id));

  return (
    <div className="space-y-5">
      <FilterBar
        basePath={basePath}
        cuisines={cuisines}
        neighborhoods={neighborhoods}
        features={features}
        current={rawParams}
        hideCuisine={hideCuisine}
        hideNeighborhood={hideNeighborhood}
      />

      <p className="text-sm text-stone-500">
        {result.total === 0
          ? "لا توجد نتائج مطابقة — جرّب تعديل خيارات البحث"
          : `${result.total} نتيجة`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sponsored.map((r) => (
          <RestaurantCard key={`s-${r.id}`} restaurant={r} sponsored />
        ))}
        {organic.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>

      <Pagination
        page={result.page}
        total={result.total}
        pageSize={PAGE_SIZE}
        basePath={basePath}
        searchParams={rawParams}
      />
    </div>
  );
}
