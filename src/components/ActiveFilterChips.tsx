import Link from "next/link";
import type { RawSearchParams } from "@/lib/searchParams";

type Chip = { label: string; key: string; value: string };

export function ActiveFilterChips({
  basePath,
  rawParams,
  labels,
}: {
  basePath: string;
  rawParams: RawSearchParams;
  labels: { features: Map<string, string>; cuisines: Map<string, string> };
}) {
  const chips: Chip[] = [];
  const multi = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v : v ? [v] : [];

  for (const slug of multi(rawParams.features)) {
    chips.push({ label: labels.features.get(slug) ?? slug, key: "features", value: slug });
  }
  for (const slug of multi(rawParams.cuisine)) {
    chips.push({ label: labels.cuisines.get(slug) ?? slug, key: "cuisine", value: slug });
  }
  for (const p of multi(rawParams.price)) {
    const symbols: Record<string, string> = { CHEAP: "$", MODERATE: "$$", EXPENSIVE: "$$$", LUXURY: "$$$$" };
    chips.push({ label: symbols[p] ?? p, key: "price", value: p });
  }
  if (typeof rawParams.rating === "string") {
    chips.push({ label: `★ ${rawParams.rating}+`, key: "rating", value: rawParams.rating });
  }
  if (rawParams.open === "1") {
    chips.push({ label: "مفتوح الآن", key: "open", value: "1" });
  }

  if (chips.length === 0) return null;

  const removeHref = (chip: Chip) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(rawParams)) {
      if (v === undefined || k === "page") continue;
      const values = Array.isArray(v) ? v : [v];
      for (const value of values) {
        if (k === chip.key && value === chip.value) continue;
        params.append(k, value);
      }
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Link
          key={`${chip.key}-${chip.value}`}
          href={removeHref(chip)}
          className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full ps-3 pe-2 py-1 text-[13px] font-semibold hover:border-primary-500"
        >
          {chip.label}
          <span className="text-primary-500 font-bold">✕</span>
        </Link>
      ))}
    </div>
  );
}
