/** Cities that are live (have data and are switchable). Keep in sync with the
 * seeded City rows. Edge-safe: pure constants only, no DB/server imports — so
 * this can be imported from middleware. */
export const ACTIVE_CITIES = [
  { slug: "damascus", nameAr: "دمشق" },
  { slug: "aleppo", nameAr: "حلب" },
] as const;

/** Cities shown in the switcher as "coming soon" (no data yet). */
export const COMING_SOON_CITIES = [
  { nameAr: "حمص" },
  { nameAr: "اللاذقية" },
] as const;

export const DEFAULT_CITY = "damascus";

export const ACTIVE_CITY_SLUGS: string[] = ACTIVE_CITIES.map((c) => c.slug);

export function isActiveCity(slug: string | undefined | null): slug is string {
  return !!slug && ACTIVE_CITY_SLUGS.includes(slug);
}

export function cityNameAr(slug: string): string {
  return ACTIVE_CITIES.find((c) => c.slug === slug)?.nameAr ?? slug;
}
