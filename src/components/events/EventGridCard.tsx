import Link from "next/link";
import Image from "next/image";
import { EventIcon } from "./EventIcon";
import type { EventCardData } from "./types";

export function EventGridCard({ event }: { event: EventCardData }) {
  return (
    <Link
      href={event.href}
      className="group block bg-white border border-[#F0E6E0] rounded-[18px] overflow-hidden shadow-[0_4px_14px_-8px_rgba(28,22,20,.12)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_18px_34px_-16px_rgba(28,22,20,.25)]"
    >
      <div className="relative h-[168px]" style={event.imageUrl ? undefined : { background: event.bg }}>
        {event.imageUrl && (
          <Image src={event.imageUrl} alt={event.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        )}
        <span className="absolute top-2.5 end-2.5 inline-flex items-center gap-1 bg-white/[.94] text-ink text-[11px] font-bold rounded-full px-2.5 py-1 shadow-sm">
          <span className="text-primary-500">
            <EventIcon name={event.icon} size={12} strokeWidth={2.4} />
          </span>
          {event.categoryAr}
        </span>
        <span className="absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 bg-ink/[.86] text-white text-[11px] font-semibold rounded-full px-2.5 py-1">
          <EventIcon name="clock" size={11} strokeWidth={2.4} />
          {event.timeLabel}
        </span>
      </div>
      <div className="px-4 pt-[15px] pb-[17px]">
        <h3 className="text-[18px] font-semibold leading-[1.35] line-clamp-2">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-[13.5px] text-[#8C7B72] mt-1.5">
          <EventIcon name="map-pin" size={13} className="shrink-0 text-[#A6948B]" strokeWidth={2.2} />
          <span className="line-clamp-1">
            {event.venue} · {event.area}
          </span>
        </p>
        <div className="border-t border-dashed border-[#EEE2DB] mt-3 pt-3 flex items-center justify-between">
          <span className={`text-[13.5px] font-bold ${event.free ? "text-success" : "text-[#B5392C]"}`}>
            {event.priceLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-primary-500 text-[13px] font-bold group-hover:gap-1.5 transition-all">
            التفاصيل
            <EventIcon name="arrow-left" size={14} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
