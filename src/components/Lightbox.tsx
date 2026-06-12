"use client";

import { useCallback, useEffect } from "react";

export type LightboxImage = { url: string; alt?: string | null; label?: string | null };

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const prev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate]
  );
  const next = useCallback(
    () => onNavigate((index + 1) % images.length),
    [index, images.length, onNavigate]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      // RTL: arrow-left advances
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const img = images[index];
  if (!img) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-4 end-4 w-10 h-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
      >
        ✕
      </button>

      <span className="absolute top-5 start-5 text-white/70 text-sm">
        {index + 1} / {images.length}
        {img.label && <span className="ms-3 text-white font-semibold">{img.label}</span>}
      </span>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="السابق"
            className="absolute start-3 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="التالي"
            className="absolute end-3 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl"
          >
            ›
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- lightbox shows the original at full size */}
      <img
        src={img.url}
        alt={img.alt ?? ""}
        className="max-h-[88vh] max-w-[92vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
