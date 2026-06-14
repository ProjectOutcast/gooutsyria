import type { Metadata } from "next";
import Link from "next/link";
import {
  EVENT_CATEGORIES,
  buildDayWindow,
  monthLabel,
  damascusDateKey,
  categoryAr,
  categoryIcon,
  categoryImage,
  eventPriceLabel,
  eventTimeLabel,
  toneBackground,
  formatEventDate,
  getEventsInWindow,
  getFeaturedEvents,
} from "@/lib/events";
import { FeaturedCarousel } from "@/components/events/FeaturedCarousel";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventCategoryCard } from "@/components/events/EventCategoryCard";
import { Carousel } from "@/components/Carousel";
import type { EventCardData, FeaturedSlideData } from "@/components/events/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وين نروح؟ — فعاليات وحفلات دمشق",
  description:
    "دليل فعاليات دمشق: حفلات، مسرح، مهرجانات، معارض ورياضة — تصفّح حسب اليوم واعرف أماكن شراء التذاكر. منصّة ترويجية فقط، بدون شراء أونلاين.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const now = new Date();
  const [featured, windowed] = await Promise.all([
    getFeaturedEvents(now),
    getEventsInWindow(now, 8),
  ]);

  const window = buildDayWindow(now, 8);
  const keyToIndex = new Map(window.map((d) => [d.key, d.index]));

  const events: EventCardData[] = windowed
    .map((e): EventCardData | null => {
      const dayIndex = keyToIndex.get(damascusDateKey(e.startsAt));
      if (dayIndex === undefined) return null;
      const price = eventPriceLabel(e);
      return {
        id: e.id,
        slug: e.slug,
        href: `/events/${e.slug}`,
        title: e.title,
        category: e.category,
        categoryAr: categoryAr(e.category),
        icon: categoryIcon(e.category),
        venue: e.venue,
        area: e.area,
        timeLabel: eventTimeLabel(e),
        priceLabel: price.label,
        free: price.free,
        bg: toneBackground(e.tone),
        imageUrl: e.imageUrl,
        dayIndex,
      };
    })
    .filter((x): x is EventCardData => x !== null);

  const slides: FeaturedSlideData[] = featured.map((e) => ({
    id: e.id,
    href: `/events/${e.slug}`,
    kicker: e.featuredKicker ?? categoryAr(e.category),
    title: e.title,
    desc: e.summary ?? "",
    dateLabel: formatEventDate(e.startsAt, e.endsAt),
    venue: e.venue,
    icon: categoryIcon(e.category),
    bg: toneBackground(e.tone),
    imageUrl: e.imageUrl,
  }));

  const catCounts = new Map<string, number>();
  for (const e of events) catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1);

  return (
    <div className="pb-16">
      <h1 className="sr-only">وين نروح؟ — فعاليات وحفلات دمشق</h1>

      {/* Full-bleed immersive hero carousel */}
      <FeaturedCarousel slides={slides} />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-7 pt-6 sm:pt-8">
      <EventsCalendar
        days={window.map((d) => ({ index: d.index, dowAr: d.dowAr, dayNum: d.dayNum }))}
        monthAr={monthLabel(now)}
        events={events}
        categories={EVENT_CATEGORIES.map((c) => ({ slug: c.slug, nameAr: c.nameAr, icon: c.icon }))}
      />

      {/* Browse by category */}
      <section className="pt-11">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-[22px] sm:text-[24px] font-bold">تصفّح حسب الفئة</h2>
          <a href="#calendar" className="text-sm text-ink font-semibold underline">
            عرض الكل
          </a>
        </div>
        <Carousel
          items={EVENT_CATEGORIES.map((c) => (
            <EventCategoryCard
              key={c.slug}
              nameAr={c.nameAr}
              count={catCounts.get(c.slug) ?? 0}
              imageUrl={categoryImage(c.slug)}
              href="#calendar"
            />
          ))}
          itemClassName="w-[44%] sm:w-[216px]"
        />
      </section>

      {/* Add your event */}
      <section className="pt-10">
        <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#E14434,#C9503A)] text-white text-center p-8 sm:p-[46px]">
          <span className="pointer-events-none absolute -top-10 -start-10 w-40 h-40 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute -bottom-12 -end-8 w-48 h-48 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-[24px] sm:text-[30px] font-bold">تنظّم فعالية في دمشق؟</h2>
            <p className="mt-3 text-[15px] sm:text-[16px] text-[#FFE3DA] max-w-[540px] mx-auto">
              روّج لفعاليتك مجاناً ووصّلها لآلاف الزوّار. نحن منصّة ترويجية فقط — حجز التذاكر والدفع يتمّان مباشرةً معك كمنظّم.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 bg-white text-[#C9503A] rounded-xl px-7 py-3 font-bold hover:bg-white/90 transition-colors"
            >
              أضف فعاليتك مجاناً
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
