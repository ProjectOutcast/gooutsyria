import type { PriceBand } from "@/generated/prisma/enums";
import type { SearchFilters } from "./queries";

const PRICE_BANDS = ["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"];
const SORTS = ["relevance", "rating", "newest", "popular"];
const RATINGS = ["4.5", "4", "3.5"];

export type RawSearchParams = Record<string, string | string[] | undefined>;

function multi(v: string | string[] | undefined): string[] | undefined {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v) return [v];
  return undefined;
}

export function parseFilters(sp: RawSearchParams): SearchFilters {
  const str = (k: string) =>
    typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined;

  const prices = multi(sp.price)?.filter((p): p is PriceBand =>
    PRICE_BANDS.includes(p)
  );
  const rating = str("rating");
  const sort = str("sort");
  const page = parseInt(str("page") ?? "1", 10);

  return {
    q: str("q"),
    cuisines: multi(sp.cuisine),
    neighborhood: str("neighborhood"),
    prices: prices?.length ? prices : undefined,
    features: multi(sp.features),
    minRating: rating && RATINGS.includes(rating) ? Number(rating) : undefined,
    open: str("open") === "1",
    sort: sort && SORTS.includes(sort) ? (sort as SearchFilters["sort"]) : "relevance",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}
