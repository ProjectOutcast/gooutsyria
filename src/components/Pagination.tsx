import Link from "next/link";
import { formatNum } from "@/lib/format";
import { Chevron } from "./Chevron";

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  searchParams,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v === undefined) continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // design pattern: window around current + ellipsis + last page
  const windowStart = Math.max(1, Math.min(page - 1, pages - 3));
  const numbers: (number | "…")[] = [];
  for (let n = windowStart; n <= Math.min(windowStart + 3, pages); n++) {
    numbers.push(n);
  }
  if ((numbers[numbers.length - 1] as number) < pages) {
    if ((numbers[numbers.length - 1] as number) < pages - 1) numbers.push("…");
    numbers.push(pages);
  }
  if (numbers[0] !== 1) {
    if (numbers[0] !== "…" && (numbers[0] as number) > 2) numbers.unshift("…");
    numbers.unshift(1);
  }

  const navBtn =
    "w-9 h-9 grid place-items-center rounded-xl border border-hairline bg-white text-ink2 hover:border-primary-500 hover:text-primary-500 transition";

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="الصفحات">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={navBtn} aria-label="السابق">
          <Chevron dir="right" />
        </Link>
      )}
      {numbers.map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="w-9 h-9 grid place-items-center text-muted2">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildHref(n)}
            aria-current={n === page ? "page" : undefined}
            className={`w-9 h-9 grid place-items-center rounded-xl text-sm font-bold transition ${
              n === page
                ? "bg-primary-500 text-white shadow-accent"
                : "bg-white border border-hairline text-ink2 hover:border-primary-500"
            }`}
          >
            {formatNum(n)}
          </Link>
        )
      )}
      {page < pages && (
        <Link href={buildHref(page + 1)} className={navBtn} aria-label="التالي">
          <Chevron dir="left" />
        </Link>
      )}
    </nav>
  );
}
