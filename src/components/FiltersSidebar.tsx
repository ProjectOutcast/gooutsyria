"use client";

import { useState, Suspense, type ReactNode } from "react";
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
  ["4.5", "٤.٥ فأكثر"],
  ["4", "٤.٠ فأكثر"],
  ["3.5", "٣.٥ فأكثر"],
] as const;

function CollapsibleSection({
  title,
  defaultOpen = true,
  bordered = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  bordered?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={bordered ? "border-t border-hairline pt-4" : ""}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-[13px] font-semibold text-muted mb-1.5"
      >
        {title}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </section>
  );
}

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
  const [cuisineQuery, setCuisineQuery] = useState("");

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

  const openActive = sp.get("open") === "1";
  const cq = cuisineQuery.trim();
  const matchedCuisines = cq
    ? cuisines.filter((c) => c.nameAr.includes(cq))
    : cuisines;
  const visibleCuisines = cq
    ? matchedCuisines
    : showAllCuisines
      ? cuisines
      : cuisines.slice(0, 7);

  const hasFilters =
    current("features").length > 0 ||
    current("cuisine").length > 0 ||
    current("price").length > 0 ||
    openActive ||
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
        <button
          type="button"
          onClick={() => setSingle("open", "1")}
          aria-pressed={openActive}
          className="flex items-center justify-between w-full pb-4 border-b border-hairline"
        >
          <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <span className={`w-2 h-2 rounded-full ${openActive ? "bg-success" : "bg-muted2"}`} />
            مفتوح الآن
          </span>
          <span
            className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
              openActive ? "bg-success" : "bg-hairline2"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                openActive ? "ms-auto" : ""
              }`}
            />
          </span>
        </button>

        {!hideCuisines && (
          <CollapsibleSection title="نوع المطبخ" defaultOpen bordered={false}>
            {cuisines.length > 10 && (
              <div className="relative mb-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute top-1/2 -translate-y-1/2 end-2.5 text-muted2 pointer-events-none"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={cuisineQuery}
                  onChange={(e) => setCuisineQuery(e.target.value)}
                  placeholder="ابحث عن مطبخ…"
                  className="w-full rounded-lg border border-hairline2 bg-white ps-3 pe-8 py-1.5 text-[13px] text-ink placeholder:text-muted2 focus:border-primary-500 focus:outline-none"
                />
              </div>
            )}
            {visibleCuisines.map((c) => checkboxRow("cuisine", c))}
            {cq && matchedCuisines.length === 0 && (
              <p className="text-[13px] text-muted2 py-1.5">لا يوجد مطبخ بهذا الاسم</p>
            )}
            {!cq && cuisines.length > 7 && (
              <button
                type="button"
                onClick={() => setShowAllCuisines((v) => !v)}
                className="text-[13px] text-primary-500 font-semibold mt-1.5 hover:underline"
              >
                {showAllCuisines ? "عرض أقل −" : "عرض المزيد +"}
              </button>
            )}
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="مميزات"
          defaultOpen={current("features").length > 0}
          bordered={!hideCuisines}
        >
          {features.map((f) => checkboxRow("features", f))}
        </CollapsibleSection>

        <CollapsibleSection title="السعر" defaultOpen={current("price").length > 0}>
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
        </CollapsibleSection>

        <CollapsibleSection title="التقييم" defaultOpen={!!sp.get("rating")}>
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
        </CollapsibleSection>
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
