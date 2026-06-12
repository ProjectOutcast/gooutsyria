import Link from "next/link";
import { formatNum } from "@/lib/format";

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

  // window of up to 5 page numbers centered on current
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const numbers = Array.from(
    { length: Math.min(5, pages) },
    (_, i) => start + i
  ).filter((n) => n <= pages);

  const navBtn =
    "w-9 h-9 grid place-items-center rounded-xl border border-hairline bg-white text-ink2 hover:border-primary-500 hover:text-primary-500 transition";

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="الصفحات">
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={navBtn} aria-label="السابق">
          ›
        </Link>
      )}
      {numbers.map((n) => (
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
      ))}
      {page < pages && (
        <Link href={buildHref(page + 1)} className={navBtn} aria-label="التالي">
          ‹
        </Link>
      )}
    </nav>
  );
}
