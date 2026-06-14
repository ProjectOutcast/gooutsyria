"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatRating } from "@/lib/format";

type Neighborhood = { slug: string; nameAr: string };

type Suggestion = {
  slug: string;
  citySlug: string;
  nameAr: string;
  cuisineAr: string | null;
  neighborhoodAr: string | null;
  photoUrl: string | null;
  avgRating: number;
  ratingCount: number;
};

export function SearchBar({
  citySlug,
  defaultValue = "",
  defaultNeighborhood = "",
  neighborhoods = [],
  size = "md",
}: {
  citySlug: string;
  defaultValue?: string;
  defaultNeighborhood?: string;
  neighborhoods?: Neighborhood[];
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipFetch = useRef(true); // don't fetch/open on initial mount (prefilled q)

  // debounced typeahead
  useEffect(() => {
    if (skipFetch.current) {
      skipFetch.current = false;
      return;
    }
    const term = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (term.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      try {
        const res = await fetch(
          `/api/search?city=${encodeURIComponent(citySlug)}&q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(-1);
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, citySlug]);

  // close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (s: Suggestion) => {
    setOpen(false);
    router.push(`/${s.citySlug}/restaurant/${s.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <form action={`/${citySlug}/restaurants`} method="GET" className="w-full">
      <div ref={boxRef} className="relative">
        <div
          className={`flex items-stretch bg-white overflow-hidden ${
            lg
              ? "rounded-[18px] shadow-search p-2 gap-2"
              : "rounded-xl border border-hairline p-1.5 gap-1.5"
          }`}
        >
          <div className="flex items-center flex-1 min-w-0 ps-3 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              placeholder="ابحث عن مطعم، مطبخ، أو طبق…"
              className={`w-full bg-transparent focus:outline-none text-ink placeholder:text-muted2 ${
                lg ? "py-2.5 text-base" : "py-1.5 text-sm"
              }`}
            />
          </div>

          {neighborhoods.length > 0 && (
            <div className="hidden sm:flex items-center border-s border-hairline ps-3 pe-1 gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                name="neighborhood"
                defaultValue={defaultNeighborhood}
                className={`bg-transparent focus:outline-none text-ink cursor-pointer ${lg ? "text-[15px]" : "text-sm"}`}
              >
                <option value="">كل المناطق</option>
                {neighborhoods.map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className={`shrink-0 inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-700 text-white font-bold transition ${
              lg ? "rounded-[12px] px-6 text-base" : "rounded-lg px-4 text-sm"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            ابحث
          </button>
        </div>

        {open && results.length > 0 && (
          <ul
            id="search-suggestions"
            role="listbox"
            className="absolute z-50 top-full inset-x-0 mt-2 bg-white rounded-2xl border border-hairline shadow-search overflow-hidden py-1 text-start"
          >
            {results.map((s, i) => (
              <li key={s.slug} role="option" aria-selected={active === i}>
                <a
                  href={`/${s.citySlug}/restaurant/${s.slug}`}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 ${active === i ? "bg-primary-50" : "hover:bg-chipbg"}`}
                >
                  <span className="relative w-11 h-11 rounded-lg overflow-hidden bg-chipbg shrink-0">
                    {s.photoUrl && <Image src={s.photoUrl} alt="" fill sizes="44px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink text-[14px] leading-tight line-clamp-1">{s.nameAr}</span>
                    <span className="block text-[12px] text-muted line-clamp-1">
                      {[s.cuisineAr, s.neighborhoodAr].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {s.ratingCount > 0 && (
                    <span className="text-[12.5px] font-bold text-ink shrink-0">
                      <span className="text-star">★</span> {formatRating(s.avgRating)}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
