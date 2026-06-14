"use client";

import { useMemo, useState } from "react";
import { EventIcon } from "./EventIcon";
import { EventGridCard } from "./EventGridCard";
import type { CategoryData, DayMetaData, EventCardData } from "./types";

export function EventsCalendar({
  days,
  monthAr,
  events,
  categories,
}: {
  days: DayMetaData[];
  monthAr: string;
  events: EventCardData[];
  categories: CategoryData[];
}) {
  const [day, setDay] = useState(0);
  const [cat, setCat] = useState("all");

  const countByDay = useMemo(() => {
    const m = new Map<number, number>();
    for (const e of events) m.set(e.dayIndex, (m.get(e.dayIndex) ?? 0) + 1);
    return m;
  }, [events]);

  const dayEvents = useMemo(
    () => events.filter((e) => e.dayIndex === day && (cat === "all" || e.category === cat)),
    [events, day, cat]
  );

  const selected = days[day];
  const dayLabel = selected.index === 0 ? "اليوم" : `${selected.dowAr} ${selected.dayNum}`;
  const dayTotal = countByDay.get(day) ?? 0;

  return (
    <>
      {/* Sticky day-strip calendar */}
      <div
        id="calendar"
        className="sticky top-[67px] z-30 -mx-4 sm:-mx-7 px-4 sm:px-7 py-4 bg-page/90 backdrop-blur border-b border-[#EEE2DB]"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary-500">
            <EventIcon name="calendar-range" size={18} strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-bold">اختر اليوم</span>
          <span className="text-[13px] text-[#9A887F]">— {monthAr}</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none">
          {days.map((d) => {
            const active = d.index === day;
            const n = countByDay.get(d.index) ?? 0;
            return (
              <button
                key={d.index}
                type="button"
                onClick={() => setDay(d.index)}
                className={`shrink-0 w-[62px] sm:w-[76px] rounded-[13px] sm:rounded-[15px] py-2.5 sm:py-3 px-1.5 flex flex-col items-center gap-0.5 border transition-colors ${
                  active
                    ? "bg-primary-500 text-white border-primary-500 shadow-[0_8px_18px_rgba(225,68,52,.35)]"
                    : "bg-white text-ink border-[#EADBD2] hover:border-primary-300"
                }`}
              >
                <span className="text-[12px] font-semibold">{d.dowAr}</span>
                <span className="text-[21px] sm:text-[24px] font-bold leading-none">{d.dayNum}</span>
                <span className={`text-[9px] sm:text-[10.5px] font-semibold ${active ? "text-white/85" : "text-[#A6948B]"}`}>
                  {n} فعالية
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day events */}
      <section className="pt-6">
        <h2 className="text-[20px] sm:text-[26px] font-bold">فعاليات {dayLabel}</h2>
        <p className="text-[14px] text-[#8C7B72] mt-0.5">{dayTotal} فعالية — كلها بمكان واحد</p>

        <div className="flex gap-2 overflow-x-auto sm:flex-wrap scrollbar-none mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <CatChip active={cat === "all"} onClick={() => setCat("all")} icon="layout-grid" label="الكل" />
          {categories.map((c) => (
            <CatChip
              key={c.slug}
              active={cat === c.slug}
              onClick={() => setCat(c.slug)}
              icon={c.icon}
              label={c.nameAr}
            />
          ))}
        </div>

        {dayEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {dayEvents.map((e) => (
              <EventGridCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="mt-6 bg-white border border-[#F0E6E0] rounded-2xl p-10 text-center">
            <span className="inline-grid place-items-center w-12 h-12 rounded-full bg-[#FFF0E9] text-primary-500 mb-3">
              <EventIcon name="calendar-x" size={24} />
            </span>
            <p className="font-semibold text-ink">لا توجد فعاليات بهذا التصنيف في هذا اليوم</p>
            <p className="text-sm text-[#8C7B72] mt-1">جرّب يوماً آخر أو تصنيفاً مختلفاً</p>
          </div>
        )}
      </section>
    </>
  );
}

function CatChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] sm:text-[14px] font-semibold border transition-colors ${
        active ? "bg-primary-500 text-white border-primary-500" : "bg-white text-[#4A3F39] border-[#EADBD2] hover:border-primary-300"
      }`}
    >
      <EventIcon name={icon} size={15} strokeWidth={2.2} />
      {label}
    </button>
  );
}
