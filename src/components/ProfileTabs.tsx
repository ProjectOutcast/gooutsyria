"use client";

import { useEffect, useState } from "react";

const TABS = [
  ["overview", "نظرة عامة"],
  ["menu", "القائمة"],
  ["reviews", "التقييمات"],
  ["info", "معلومات"],
] as const;

/** Sticky anchor tabs with scroll-spy (active section highlighted on scroll). */
export function ProfileTabs() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px" }
    );
    for (const [id] of TABS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-[67px] z-30 bg-page/95 backdrop-blur border-b border-hairline -mx-7 px-7">
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className={`px-4 py-3 text-[15px] font-semibold whitespace-nowrap border-b-[3px] -mb-px transition-colors ${
              active === id
                ? "text-primary-500 border-primary-500"
                : "text-ink2 border-transparent hover:text-primary-500"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
