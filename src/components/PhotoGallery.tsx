"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox, type LightboxImage } from "./Lightbox";
import { BookmarkButton } from "./BookmarkButton";

export function PhotoGallery({
  photos,
  name,
  restaurantId,
  saved,
}: {
  photos: LightboxImage[];
  name: string;
  restaurantId: string;
  saved: boolean;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = { title: name, url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-[20px] bg-chipbg h-56 grid place-items-center text-5xl opacity-40">
        🍽
      </div>
    );
  }

  // adapt the grid to the photo count so sparse galleries don't leave holes:
  // 5+ → design grid (1 large + 4 small); 3-4 → 1 large + 2 small; 2 → 1+1; 1 → full-width
  const total = photos.length;
  const smallCount = total >= 5 ? 4 : total === 1 ? 0 : total >= 3 ? 2 : 1;
  const small = photos.slice(1, 1 + smallCount);
  const extra = total - 1 - smallCount;
  const gridCols =
    smallCount === 4
      ? "sm:grid-cols-[2fr_1fr_1fr] grid-rows-2"
      : smallCount >= 1
        ? "sm:grid-cols-[2fr_1fr] grid-rows-2"
        : "grid-rows-1";

  return (
    <div className="relative">
      <div className="absolute top-3.5 start-3.5 z-10 flex gap-2">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-ink text-[13px] font-semibold rounded-full px-3.5 py-1.5 shadow-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
          </svg>
          {copied ? "تم نسخ الرابط ✓" : "مشاركة"}
        </button>
        <span className="inline-flex items-center gap-1.5 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
          <BookmarkButton restaurantId={restaurantId} initialSaved={saved} />
          <span className="text-[13px] font-semibold text-ink pe-1.5">حفظ</span>
        </span>
      </div>

      <div className={`grid grid-cols-2 ${gridCols} gap-2 h-[280px] sm:h-[392px] rounded-[20px] overflow-hidden`}>
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className={`relative col-span-2 sm:col-span-1 bg-chipbg ${smallCount >= 1 ? "row-span-2" : ""}`}
        >
          <Image
            src={photos[0].url}
            alt={photos[0].alt ?? name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover hover:opacity-95 transition-opacity"
            priority
          />
        </button>
        {small.map((p, i) => {
          // a 2-photo gallery gets one tall tile
          const span = smallCount === 1 ? "row-span-2" : "";
          const isLast = i === small.length - 1 && extra > 0;
          return (
            <button
              key={p.url + i}
              type="button"
              onClick={() => setLightbox(i + 1)}
              className={`relative bg-chipbg hidden sm:block ${span}`}
            >
              <Image
                src={p.url}
                alt={p.alt ?? name}
                fill
                sizes="25vw"
                className="object-cover hover:opacity-95 transition-opacity"
              />
              {isLast && (
                <span className="absolute inset-0 bg-ink/60 grid place-items-center text-white font-bold text-lg">
                  +{extra} صورة
                </span>
              )}
            </button>
          );
        })}
      </div>

      {lightbox !== null && (
        <Lightbox
          images={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </div>
  );
}
