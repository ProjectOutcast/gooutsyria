import Link from "next/link";

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

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="الصفحات">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm hover:border-primary-500"
        >
          السابق
        </Link>
      )}
      <span className="text-sm text-stone-600 ltr-nums">
        {page} / {pages}
      </span>
      {page < pages && (
        <Link
          href={buildHref(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm hover:border-primary-500"
        >
          التالي
        </Link>
      )}
    </nav>
  );
}
