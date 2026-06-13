"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal scroll carousel: native finger-swipe on mobile, arrow buttons on
 * desktop (shown only when content overflows). RTL-aware. Each item is wrapped
 * with `itemClassName` (set its width to control how many show per view).
 */
export function Carousel({
  items,
  itemClassName,
  arrowTopClass = "top-1/2 -translate-y-1/2",
}: {
  items: React.ReactNode[];
  itemClassName: string;
  arrowTopClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canFwd, setCanFwd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL: scrollLeft is negative
    setCanBack(pos > 2);
    setCanFwd(max - pos > 2);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function scroll(forward: boolean) {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    // RTL: moving toward the end (more content) decreases scrollLeft
    el.scrollBy({ left: forward ? -amount : amount, behavior: "smooth" });
  }

  const arrowBase = `hidden sm:grid place-items-center absolute ${arrowTopClass} z-10 w-10 h-10 rounded-full bg-white border border-hairline shadow-card text-ink hover:text-primary-500 disabled:opacity-0 disabled:pointer-events-none transition`;

  // SVG chevrons — not subject to RTL bidi mirroring like the ‹ › glyphs are
  const chevron = (dir: "left" | "right") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x scroll-smooth pb-1"
      >
        {items.map((node, i) => (
          <div key={i} className={`snap-start shrink-0 ${itemClassName}`}>
            {node}
          </div>
        ))}
      </div>

      {/* forward (more): later items are to the LEFT in RTL — left edge, points left */}
      <button
        type="button"
        onClick={() => scroll(true)}
        disabled={!canFwd}
        aria-label="عرض المزيد"
        className={`${arrowBase} end-0 -translate-x-2`}
      >
        {chevron("left")}
      </button>
      {/* back: earlier items are to the RIGHT in RTL — right edge, points right */}
      <button
        type="button"
        onClick={() => scroll(false)}
        disabled={!canBack}
        aria-label="السابق"
        className={`${arrowBase} start-0 translate-x-2`}
      >
        {chevron("right")}
      </button>
    </div>
  );
}
