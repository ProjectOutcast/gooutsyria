"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EventIcon } from "./EventIcon";
import type { FeaturedSlideData } from "./types";

export function FeaturedCarousel({ slides }: { slides: FeaturedSlideData[] }) {
  const [slide, setSlide] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const go = (i: number) => setSlide(((i % count) + count) % count);

  return (
    <section className="pt-7 sm:pt-[30px]">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="flex items-center gap-2 text-[17px] sm:text-[24px] font-bold">
          <span className="text-primary-500">
            <EventIcon name="sparkles" size={22} strokeWidth={2.2} />
          </span>
          فعاليات مميّزة هذا الأسبوع
        </h2>
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => go(slide - 1)}
            aria-label="السابق"
            className="grid place-items-center w-10 h-10 rounded-full bg-white border border-[#EADBD2] text-ink hover:border-primary-300 transition-colors"
          >
            <EventIcon name="chevron-right" size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(slide + 1)}
            aria-label="التالي"
            className="grid place-items-center w-10 h-10 rounded-full bg-white border border-[#EADBD2] text-ink hover:border-primary-300 transition-colors"
          >
            <EventIcon name="chevron-left" size={20} />
          </button>
        </div>
      </div>

      <div className="relative rounded-[20px] sm:rounded-[24px] border border-[#F0E6E0] overflow-hidden shadow-[0_24px_60px_-30px_rgba(28,22,20,.4)]">
        <span className="absolute top-3.5 end-3.5 z-10 bg-white/[.16] text-white/85 text-[10px] font-bold rounded-full px-2.5 py-1 backdrop-blur">
          مساحة إعلانية
        </span>

        <div
          dir="ltr"
          className="flex transition-transform duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: `translateX(${slide * 100}%)` }}
        >
          {slides.map((s) => (
            <div
              key={s.id}
              className="relative shrink-0 basis-full h-[248px] sm:h-[380px]"
              style={s.imageUrl ? undefined : { background: s.bg }}
            >
              {s.imageUrl && (
                <Image src={s.imageUrl} alt={s.title} fill sizes="(max-width:1240px) 100vw, 1240px" className="object-cover" priority />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,13,11,.82)_0%,rgba(20,13,11,.42)_56%,rgba(20,13,11,.1)_100%)]" />
              <div dir="rtl" className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 max-w-[600px]">
                <span className="inline-flex w-fit items-center gap-1.5 bg-primary-500 text-white text-[12px] font-bold rounded-full px-3 py-1">
                  <EventIcon name={s.icon} size={13} strokeWidth={2.4} />
                  {s.kicker}
                </span>
                <h3 className="mt-3 text-white font-bold text-[21px] sm:text-[33px] leading-[1.2] text-balance [text-shadow:0_2px_18px_rgba(0,0,0,.35)]">
                  {s.title}
                </h3>
                <p className="hidden sm:block mt-2 text-[15.5px] text-[#EBDDD6] max-w-[500px] line-clamp-2">
                  {s.desc}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-white text-[13px] sm:text-[14px] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#FFB4A6]"><EventIcon name="calendar" size={15} /></span>
                    {s.dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-[#FFB4A6]"><EventIcon name="map-pin" size={15} /></span>
                    {s.venue}
                  </span>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 bg-white text-ink rounded-[11px] px-4 py-2 text-[13px] sm:text-[14px] font-bold hover:bg-white/90 transition-colors"
                  >
                    التفاصيل ومكان الشراء
                    <EventIcon name="arrow-left" size={16} strokeWidth={2.4} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 start-4 sm:start-12 z-10 flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`الشريحة ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === slide ? "w-[26px] bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
