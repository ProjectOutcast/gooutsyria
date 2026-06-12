"use client";

import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatNum } from "@/lib/format";

type Facet = { slug: string; nameAr: string; icon?: string | null; count: number };

const PRICES = [
  ["CHEAP", "$"],
  ["MODERATE", "$$"],
  ["EXPENSIVE", "$$$"],
  ["LUXURY", "$$$$"],
] as const;

const RATINGS = [
  ["4.5", "٤٫٥ فأكثر"],
  ["4", "٤٫٠ فأكثر"],
  ["3.5", "٣٫٥ فأكثر"],
] as const;

function SidebarInner({
  features,
  cuisines,
  hideCuisines,
}: {
  features: Facet[];
  cuisines: Facet[];
  hideCuisines?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  const current = (key: string) => sp.getAll(key);

  function toggleMulti(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    const values = params.getAll(key);
    params.delete(key);
    params.delete("page");
    const next = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    next.forEach((v) => params.append(key, v));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setSingle(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    params.delete("page");
    if (value === null || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    const params = new URLSearchParams();
    const q = sp.get("q");
    if (q) params.set("q", q);
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  const checkboxRow = (key: string, f: Facet) => {
    const checked = current(key).includes(f.slug);
    return (
      <label
        key={f.slug}
        className="flex items-center gap-2.5 py-1.5 cursor-pointer text-[14px] text-ink2 hover:text-ink"
      >
        <span
          className={`w-[18px] h-[18px] rounded-[5px] grid place-items-center border transition ${
            checked ? "bg-primary-500 border-primary-500" : "bg-white border-hairline2"
          }`}
        >
          {checked && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={() => toggleMulti(key, f.slug)}
        />
        <span className="flex-1">
          {f.icon && <span className="me-1">{f.icon}</span>}
          {f.nameAr}
        </span>
        <span className="text-[12px] text-muted2">{formatNum(f.count)}</span>
      </label>
    );
  };

  const visibleCuisines = showAllCuisines ? cuisines : cuisines.slice(0, 7);
  const hasFilters =
    current("features").length > 0 ||
    current("cuisine").length > 0 ||
    current("price").length > 0 ||
    sp.get("rating");

  return (
    <aside className="bg-white border border-hairline rounded-2xl p-5 lg:sticky lg:top-[88px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-ink flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M7 12h10M11 18h2" />
          </svg>
          الفلاتر
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[13px] text-primary-500 font-semibold hover:underline"
          >
            مسح الكل
          </button>
        )}
      </div>

      <div className="space-y-5">
        <section>
          <h3 className="text-[13px] font-semibold text-muted mb-1.5">مميزات</h3>
          {features.map((f) => checkboxRow("features", f))}
        </section>

        {!hideCuisines && (
          <section className="border-t border-hairline pt-4">
            <h3 className="text-[13px] font-semibold text-muted mb-1.5">نوع المطبخ</h3>
            {visibleCuisines.map((c) => checkboxRow("cuisine", c))}
            {cuisines.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllCuisines((v) => !v)}
                className="text-[13px] text-primary-500 font-semibold mt-1.5 hover:underline"
              >
                {showAllCuisines ? "عرض أقل −" : "عرض المزيد +"}
              </button>
            )}
          </section>
        )}

        <section className="border-t border-hairline pt-4">
          <h3 className="text-[13px] font-semibold text-muted mb-2.5">السعر</h3>
          <div className="grid grid-cols-4 gap-1.5" dir="ltr">
            {PRICES.map(([value, label]) => {
              const active = current("price").includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleMulti("price", value)}
                  className={`py-1.5 rounded-[10px] text-[13px] font-bold border transition ${
                    active
                      ? "bg-primary-50 text-primary-700 border-primary-500"
                      : "bg-white text-ink2 border-hairline2 hover:border-muted2"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-t border-hairline pt-4">
          <h3 className="text-[13px] font-semibold text-muted mb-1.5">التقييم</h3>
          {RATINGS.map(([value, label]) => {
            const active = sp.get("rating") === value;
            return (
              <label
                key={value}
                className="flex items-center gap-2.5 py-1.5 cursor-pointer text-[14px] text-ink2 hover:text-ink"
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border grid place-items-center transition ${
                    active ? "border-primary-500" : "border-hairline2"
                  }`}
                >
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                </span>
                <input
                  type="radio"
                  name="rating"
                  className="sr-only"
                  checked={active}
                  onChange={() => setSingle("rating", value)}
                />
                <span className="text-star me-0.5">★</span>
                {label}
              </label>
            );
          })}
        </section>
      </div>
    </aside>
  );
}

export function FiltersSidebar(props: {
  features: Facet[];
  cuisines: Facet[];
  hideCuisines?: boolean;
}) {
  return (
    <Suspense fallback={<aside className="bg-white border border-hairline rounded-2xl p-5 h-96" />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
