import type { Cuisine, Feature, Neighborhood } from "@/generated/prisma/client";
import { PRICE_BAND_LABELS } from "@/lib/format";

export function FilterBar({
  basePath,
  cuisines,
  neighborhoods,
  features,
  current,
  hideCuisine = false,
  hideNeighborhood = false,
}: {
  basePath: string;
  cuisines: Cuisine[];
  neighborhoods: Neighborhood[];
  features: Feature[];
  current: Record<string, string | string[] | undefined>;
  hideCuisine?: boolean;
  hideNeighborhood?: boolean;
}) {
  const cur = (k: string) =>
    typeof current[k] === "string" ? (current[k] as string) : "";
  const curFeatures = Array.isArray(current.features)
    ? (current.features as string[])
    : current.features
      ? [current.features as string]
      : [];

  return (
    <form
      action={basePath}
      method="GET"
      className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3"
    >
      {cur("q") && <input type="hidden" name="q" value={cur("q")} />}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {!hideCuisine && (
          <select
            name="cuisine"
            defaultValue={cur("cuisine")}
            className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            <option value="">كل المطابخ</option>
            {cuisines.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.nameAr}
              </option>
            ))}
          </select>
        )}
        {!hideNeighborhood && (
          <select
            name="neighborhood"
            defaultValue={cur("neighborhood")}
            className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            <option value="">كل الأحياء</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.slug}>
                {n.nameAr}
              </option>
            ))}
          </select>
        )}
        <select
          name="price"
          defaultValue={cur("price")}
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          <option value="">كل الأسعار</option>
          {Object.entries(PRICE_BAND_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={cur("sort")}
          className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          <option value="rating">الأعلى تقييماً</option>
          <option value="popular">الأكثر زيارة</option>
          <option value="newest">الأحدث</option>
        </select>
        <label className="flex items-center gap-2 text-sm border border-stone-300 rounded-lg px-2 py-1.5">
          <input
            type="checkbox"
            name="open"
            value="1"
            defaultChecked={cur("open") === "1"}
            className="accent-primary-600"
          />
          مفتوح الآن
        </label>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {features.map((f) => (
          <label
            key={f.id}
            className="flex items-center gap-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full px-2.5 py-1 cursor-pointer has-checked:bg-primary-50 has-checked:border-primary-400"
          >
            <input
              type="checkbox"
              name="features"
              value={f.slug}
              defaultChecked={curFeatures.includes(f.slug)}
              className="accent-primary-600"
            />
            {f.icon} {f.nameAr}
          </label>
        ))}
        <button
          type="submit"
          className="ms-auto bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold"
        >
          تطبيق
        </button>
      </div>
    </form>
  );
}
