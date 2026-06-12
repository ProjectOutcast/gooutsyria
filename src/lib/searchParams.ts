import type { PriceBand } from "@/generated/prisma/enums";
import type { SearchFilters } from "./queries";

const PRICE_BANDS = ["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"];
const SORTS = ["rating", "newest", "popular"];

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseFilters(sp: RawSearchParams): SearchFilters {
  const str = (k: string) =>
    typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined;
  const features = Array.isArray(sp.features)
    ? (sp.features as string[])
    : sp.features
      ? [sp.features as string]
      : undefined;
  const price = str("price");
  const sort = str("sort");
  const page = parseInt(str("page") ?? "1", 10);

  return {
    q: str("q"),
    cuisine: str("cuisine"),
    neighborhood: str("neighborhood"),
    price: price && PRICE_BANDS.includes(price) ? (price as PriceBand) : undefined,
    features,
    open: str("open") === "1",
    sort: sort && SORTS.includes(sort) ? (sort as SearchFilters["sort"]) : "rating",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}
