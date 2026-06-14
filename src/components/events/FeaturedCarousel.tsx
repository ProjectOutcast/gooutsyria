"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EventIcon } from "./EventIcon";
import type { FeaturedSlideData } from "./types";

export function FeaturedCarousel({ slides }: { slides: FeaturedSlideData[] }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;
  const go = (i: number) => setSlide(((i % count) + count) % count);

  return (
    <section
      className="relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="فعاليات مميّزة"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        dir="ltr"
        className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(${-slide * 100}%)` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            dir="rtl"
            className="relative shrink-0 basis-full h-[440px] sm:h-[560px]"
            style={s.imageUrl ? undefined : { background: s.bg }}
          >
            {s.imageUrl && (
              <Image src={s.imageUrl} alt={s.title} fill sizes="100vw" className="object-cover" priority />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,13,11,.85)_0%,rgba(20,13,11,.5)_52%,rgba(20,13,11,.15)_100%)]" />
            <div className="absolute inset-0">
              <div className="max-w-[1240px] mx-auto h-full px-5 sm:px-7 flex flex-col justify-end pb-14 sm:pb-20">
                <div className="max-w-[640px]">
                  <span className="inline-flex w-fit items-center gap-1.5 bg-primary-500 text-white text-[12px] sm:text-[13px] font-bold rounded-full px-3.5 py-1.5">
                    <EventIcon name={s.icon} size={14} strokeWidth={2.4} />
                    {s.kicker}
                  </span>
                  <h2 className="mt-4 text-white font-bold text-[26px] sm:text-[44px] leading-[1.15] text-balance [text-shadow:0_2px_22px_rgba(0,0,0,.4)]">
                    {s.title}
                  </h2>
                  {s.desc && (
                    <p className="hidden sm:block mt-3 text-[16px] leading-[1.6] text-[#EBDDD6] max-w-[540px] line-clamp-2">
                      {s.desc}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-5">
                    <span className="inline-flex items-center gap-1.5 text-white text-[13px] sm:text-[15px] font-semibold">
                      <span className="text-[#FFB4A6]"><EventIcon name="calendar" size={16} /></span>
                      {s.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-white text-[13px] sm:text-[15px] font-semibold">
                      <span className="text-[#FFB4A6]"><EventIcon name="map-pin" size={16} /></span>
                      {s.venue}
                    </span>
                    <Link
                      href={s.href}
                      className="inline-flex items-center gap-1.5 bg-white text-ink rounded-xl px-5 py-3 text-[14px] font-bold hover:bg-white/90 transition-colors shadow-lg"
                    >
                      التفاصيل ومكان الشراء
                      <EventIcon name="arrow-left" size={16} strokeWidth={2.4} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advertising-space label */}
      <div className="pointer-events-none absolute top-0 inset-x-0 z-10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-7 flex justify-end pt-4">
          <span className="bg-white/[.16] border border-white/[.28] text-white/[.92] text-[10px] font-bold tracking-wide rounded-[7px] px-2.5 py-1 backdrop-blur">
            مساحة إعلانية
          </span>
        </div>
      </div>

      {count > 1 && (
        <>
          {/* Overlaid prev / next (desktop) */}
          <button
            type="button"
            onClick={() => go(slide - 1)}
            aria-label="السابق"
            className="hidden sm:grid place-items-center absolute top-1/2 -translate-y-1/2 start-5 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition-colors"
          >
            <EventIcon name="chevron-right" size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(slide + 1)}
            aria-label="التالي"
            className="hidden sm:grid place-items-center absolute top-1/2 -translate-y-1/2 end-5 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur transition-colors"
          >
            <EventIcon name="chevron-left" size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`الشريحة ${i + 1}`}
                aria-current={i === slide}
                className={`h-2 rounded-full transition-all ${i === slide ? "w-[26px] bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
