"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["relevance", "الأكثر صلة"],
  ["rating", "الأعلى تقييماً"],
  ["popular", "الأكثر زيارة"],
  ["newest", "الأحدث"],
] as const;

function SortInner() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <label className="inline-flex items-center gap-2 bg-white border border-hairline rounded-xl px-3.5 py-1.5 text-sm text-ink2">
      الترتيب:
      <select
        value={sp.get("sort") ?? "relevance"}
        onChange={(e) => {
          const params = new URLSearchParams(sp.toString());
          params.delete("page");
          if (e.target.value === "relevance") params.delete("sort");
          else params.set("sort", e.target.value);
          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
      >
        {OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SortSelect() {
  return (
    <Suspense fallback={<span className="h-9" />}>
      <SortInner />
    </Suspense>
  );
}
