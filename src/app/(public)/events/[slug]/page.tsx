import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Chevron } from "@/components/Chevron";
import { formatNum } from "@/lib/format";
import {
  categoryAr,
  categoryIcon,
  eventPriceLabel,
  eventTimeLabel,
  toneBackground,
  formatEventDate,
  getEventBySlug,
  getSimilarEvents,
} from "@/lib/events";
import { EventIcon } from "@/components/events/EventIcon";
import { EventHeroActions } from "@/components/events/EventHeroActions";

export const dynamic = "force-dynamic";

const TZ = "Asia/Damascus";

type Props = { params: Promise<{ slug: string }> };

type Outlet = { icon?: string; name: string; note?: string; phone: string };
type ProgramRow = { date?: string; title: string; detail?: string; time?: string };
type Organizer = { name: string; note?: string; phone?: string; website?: string; verified?: boolean };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return {};
  return {
    title: `${e.title} — وين نروح؟`,
    description: e.summary ?? undefined,
    alternates: { canonical: `/events/${slug}` },
  };
}

function progDay(dateISO?: string) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  return {
    num: new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, month: "long" }).format(d),
  };
}

export default async function EventDetail({ params }: Props) {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) notFound();

  const now = new Date();
  const similar = await getSimilarEvents(e.category, e.id, now, 4);

  const price = eventPriceLabel(e);
  const dateLabel = formatEventDate(e.startsAt, e.endsAt);
  const timeLabel = eventTimeLabel(e);
  const catAr = categoryAr(e.category);
  const outlets = (e.outlets as unknown as Outlet[] | null) ?? [];
  const program = (e.program as unknown as ProgramRow[] | null) ?? [];
  const organizer = e.organizer as unknown as Organizer | null;
  const paras = (e.description ?? "").split("\n\n").filter(Boolean);
  const barPrice = e.priceFrom != null ? `${formatNum(e.priceFrom)} ل.س` : price.label;

  const facts = [
    { icon: "calendar", label: "التاريخ", value: dateLabel },
    { icon: "clock", label: "الوقت", value: timeLabel },
    { icon: "map-pin", label: "المكان", value: e.venue },
    { icon: "wallet", label: "الأسعار", value: price.label },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-7 pb-28 lg:pb-16">
      {/* Breadcrumb (desktop) */}
      <nav className="hidden sm:flex items-center gap-1.5 text-[13.5px] text-[#9A887F] pt-5" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
        <Chevron dir="left" size={13} />
        <Link href="/events" className="hover:text-primary-500">الفعاليات</Link>
        <Chevron dir="left" size={13} />
        <Link href="/events#calendar" className="hover:text-primary-500">{catAr}</Link>
        <Chevron dir="left" size={13} />
        <span className="text-ink font-semibold line-clamp-1">{e.title}</span>
      </nav>

      {/* Hero */}
      <div
        className="relative h-[330px] sm:h-[420px] rounded-[22px] overflow-hidden mt-3"
        style={e.imageUrl ? undefined : { background: toneBackground(e.tone) }}
      >
        {e.imageUrl && (
          <Image src={e.imageUrl} alt={e.title} fill sizes="(max-width:1180px) 100vw, 1180px" className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,13,11,.85),rgba(20,13,11,.4)_40%,rgba(20,13,11,.05))]" />

        <Link
          href="/events"
          aria-label="رجوع"
          className="sm:hidden absolute top-12 start-4 grid place-items-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur"
        >
          <EventIcon name="arrow-right" size={20} />
        </Link>
        <div className="absolute top-12 sm:top-4 end-4">
          <EventHeroActions title={e.title} />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
          <span className="inline-flex items-center gap-1.5 bg-primary-500 text-white text-[12px] font-bold rounded-full px-3 py-1">
            <EventIcon name={categoryIcon(e.category)} size={13} strokeWidth={2.4} />
            {catAr}
          </span>
          <h1 className="mt-2.5 text-white font-bold text-[24px] sm:text-[42px] leading-[1.15] text-balance [text-shadow:0_2px_18px_rgba(0,0,0,.35)]">
            {e.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-white text-[13px] sm:text-[14px] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#FF9180]"><EventIcon name="calendar" size={15} /></span>
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#FF9180]"><EventIcon name="clock" size={15} /></span>
              {timeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#FF9180]"><EventIcon name="map-pin" size={15} /></span>
              {e.venue} · {e.area}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-[34px] items-start mt-8">
        <div className="space-y-9 min-w-0">
          {/* Quick facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="bg-white border border-[#F0E6E0] rounded-2xl p-3.5">
                <span className="flex items-center gap-1.5 text-[12px] text-[#9A887F]">
                  <span className="text-primary-500"><EventIcon name={f.icon} size={14} /></span>
                  {f.label}
                </span>
                <span className="block text-[15px] font-bold mt-1 leading-snug">{f.value}</span>
              </div>
            ))}
          </div>

          {/* About */}
          {paras.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2.5 text-[23px] font-bold mb-3">
                <span className="w-[5px] h-[22px] rounded bg-primary-500 inline-block" />
                عن الفعالية
              </h2>
              <div className="space-y-3">
                {paras.map((p, i) => (
                  <p key={i} className="text-[16px] text-[#4A3F39] leading-[1.85]">{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* Program */}
          {program.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2.5 text-[23px] font-bold mb-3">
                <span className="w-[5px] h-[22px] rounded bg-primary-500 inline-block" />
                برنامج الأيام
              </h2>
              <div className="bg-white border border-[#F0E6E0] rounded-2xl divide-y divide-[#F4ECE6]">
                {program.map((p, i) => {
                  const d = progDay(p.date);
                  return (
                    <div key={i} className="flex items-center gap-4 p-4">
                      {d && (
                        <div className="text-center shrink-0 w-12">
                          <div className="text-[20px] font-bold text-[#B5392C] leading-none">{d.num}</div>
                          <div className="text-[11px] text-[#8C7B72] mt-0.5">{d.month}</div>
                        </div>
                      )}
                      <div className="w-px self-stretch bg-[#F4ECE6]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[16px] font-bold">{p.title}</div>
                        {p.detail && <div className="text-[13.5px] text-[#8C7B72] mt-0.5">{p.detail}</div>}
                      </div>
                      {p.time && <div className="text-[13px] font-semibold text-[#8C7B72] shrink-0">{p.time}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Location (address card — no embedded map) */}
          <section>
            <h2 className="flex items-center gap-2.5 text-[23px] font-bold mb-3">
              <span className="w-[5px] h-[22px] rounded bg-primary-500 inline-block" />
              الموقع
            </h2>
            <div className="bg-white border border-[#F0E6E0] rounded-2xl p-5 flex items-start gap-3.5">
              <span className="grid place-items-center w-11 h-11 rounded-[13px] bg-[#FFF0E9] text-primary-500 shrink-0">
                <EventIcon name="map-pin" size={20} />
              </span>
              <div>
                <div className="text-[16px] font-bold">{e.venue}</div>
                <div className="text-[14px] text-[#8C7B72] mt-0.5">{e.address ?? e.area}</div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          {/* Where to buy — the key block */}
          <div id="outlets" className="scroll-mt-24 bg-white border border-[#F0E6E0] rounded-2xl overflow-hidden">
            <div className="bg-[#FFF0E9] px-5 py-4">
              <div className="flex items-center gap-2 text-[#B5392C]">
                <EventIcon name="ticket" size={18} />
                <span className="text-[17px] font-bold">أماكن شراء التذاكر</span>
              </div>
              <p className="text-[12.5px] text-[#8C7B72] mt-1">
                {e.priceFrom != null ? `تبدأ من ${formatNum(e.priceFrom)} ل.س` : price.label}
              </p>
            </div>
            <div className="divide-y divide-[#F4ECE6]">
              {outlets.map((o, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid place-items-center w-10 h-10 rounded-[11px] bg-[#FFF0E9] text-primary-500 shrink-0">
                    <EventIcon name={o.icon ?? "building"} size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-bold leading-snug">{o.name}</div>
                    {o.note && <div className="text-[12.5px] text-[#8C7B72] mt-0.5">{o.note}</div>}
                  </div>
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} dir="ltr" className="text-[13px] font-semibold text-[#B5392C] whitespace-nowrap">
                    {o.phone}
                  </a>
                </div>
              ))}
              {outlets.length === 0 && (
                <p className="px-5 py-4 text-[13.5px] text-[#8C7B72]">سيُعلن عن أماكن البيع قريباً.</p>
              )}
            </div>
            <div className="bg-[#FBF6F2] px-5 py-3.5 flex items-start gap-2 text-[12.5px] text-[#8C7B72]">
              <span className="text-[#B5392C] shrink-0 mt-0.5"><EventIcon name="info" size={15} /></span>
              <p>
                «وين نروح؟» منصّة ترويجية للفعاليات — لا نبيع التذاكر ولا نتقاضى رسوماً. يتم الشراء مباشرةً من أماكن البيع المعتمدة أعلاه.
              </p>
            </div>
          </div>

          {/* Organizer */}
          {organizer && (
            <div className="bg-white border border-[#F0E6E0] rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-[#F3E9E4] text-ink font-bold shrink-0">
                  {organizer.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-bold leading-snug">{organizer.name}</div>
                  {organizer.note && <div className="text-[12.5px] text-[#8C7B72] mt-0.5">{organizer.note}</div>}
                </div>
              </div>
              {(organizer.phone || organizer.website) && (
                <div className="flex gap-2 mt-4">
                  {organizer.phone && (
                    <a href={`tel:${organizer.phone.replace(/\s/g, "")}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-ink text-white rounded-xl px-4 py-2.5 text-[14px] font-bold">
                      <EventIcon name="phone" size={15} /> اتصل
                    </a>
                  )}
                  {organizer.website && (
                    <a href={organizer.website} target="_blank" rel="noopener" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#F3E9E4] text-ink rounded-xl px-4 py-2.5 text-[14px] font-bold">
                      <EventIcon name="globe" size={15} /> الموقع
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Promote-your-event card */}
          <Link
            href="/contact"
            className="block rounded-2xl bg-[linear-gradient(120deg,#1C1614,#7A2418)] text-white p-5"
          >
            <span className="text-[11px] font-bold text-white/60">إعلان</span>
            <div className="text-[16px] font-bold mt-1">روّج فعاليتك على «وين نروح؟»</div>
            <p className="text-[13px] text-white/75 mt-1">وصّل فعاليتك لآلاف الزوّار.</p>
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-primary-300 mt-3">
              اعرف أكثر <EventIcon name="arrow-left" size={14} strokeWidth={2.4} />
            </span>
          </Link>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] sm:text-[24px] font-bold mb-5">فعاليات مشابهة قد تعجبك</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/events/${s.slug}`}
                className="group bg-white border border-[#F0E6E0] rounded-2xl overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-[0_18px_34px_-16px_rgba(28,22,20,.25)]"
              >
                <div className="relative h-[140px]" style={s.imageUrl ? undefined : { background: toneBackground(s.tone) }}>
                  {s.imageUrl && <Image src={s.imageUrl} alt={s.title} fill sizes="(max-width:1180px) 50vw, 280px" className="object-cover" />}
                  <span className="absolute top-2.5 end-2.5 inline-flex items-center gap-1 bg-white/[.94] text-ink text-[11px] font-bold rounded-full px-2.5 py-1">
                    <span className="text-primary-500"><EventIcon name={categoryIcon(s.category)} size={12} strokeWidth={2.4} /></span>
                    {categoryAr(s.category)}
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="text-[16px] font-bold leading-snug line-clamp-2">{s.title}</h3>
                  <p className="text-[12.5px] text-[#8C7B72] mt-1.5">{formatEventDate(s.startsAt, s.endsAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-page/95 backdrop-blur border-t border-[#EEE2DB] px-4 pt-3 pb-7 flex items-center justify-between gap-3">
        <div className="leading-tight">
          {e.priceFrom != null && <div className="text-[11px] text-[#8C7B72]">تبدأ من</div>}
          <div className="text-[17px] font-bold text-[#B5392C]">{barPrice}</div>
        </div>
        <a
          href="#outlets"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 text-white rounded-xl px-5 py-3 font-bold shadow-[0_8px_20px_rgba(225,68,52,.4)]"
        >
          <EventIcon name="ticket" size={18} />
          أين أشتري التذكرة؟
        </a>
      </div>
    </div>
  );
}
