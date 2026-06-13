"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { Carousel } from "./Carousel";

/** Photographed menu pages — 3 visible, scroll/swipe for more; click to open lightbox. */
export function MenuPages({ pages }: { pages: LightboxImage[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = pages.map((p, i) => (
    <button
      key={p.url + i}
      type="button"
      onClick={() => setLightbox(i)}
      className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-hairline bg-[#FDFBF8] hover:shadow-card transition"
    >
      <Image
        src={p.url}
        alt={p.label ?? p.alt ?? "صفحة قائمة الطعام"}
        fill
        sizes="(max-width: 640px) 70vw, 33vw"
        className="object-cover"
      />
      <span className="absolute top-2 start-2 w-7 h-7 grid place-items-center rounded-lg bg-white/90 text-ink2 opacity-80 group-hover:opacity-100">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </span>
      {p.label && (
        <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-ink/80 to-transparent text-white text-[13px] font-semibold p-2.5 pt-6 text-start">
          {p.label}
        </span>
      )}
    </button>
  ));

  return (
    <>
      <Carousel
        items={items}
        itemClassName="w-[70%] sm:w-[calc((100%-2*0.875rem)/3)]"
      />
      {lightbox !== null && (
        <Lightbox
          images={pages}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </>
  );
}
