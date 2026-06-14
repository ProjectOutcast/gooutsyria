import { db } from "./db";
import { formatNum } from "./format";

export type EventCategorySlug =
  | "music"
  | "theatre"
  | "festival"
  | "expo"
  | "sports"
  | "family"
  | "workshop"
  | "culture"
  | "market";

/** Fixed category set with its lucide icon name (order = chip order after "الكل"). */
export const EVENT_CATEGORIES: { slug: EventCategorySlug; nameAr: string; icon: string }[] = [
  { slug: "music", nameAr: "موسيقى", icon: "music" },
  { slug: "theatre", nameAr: "مسرح", icon: "drama" },
  { slug: "festival", nameAr: "مهرجانات", icon: "party-popper" },
  { slug: "expo", nameAr: "معارض", icon: "book" },
  { slug: "sports", nameAr: "رياضة", icon: "trophy" },
  { slug: "family", nameAr: "عائلي", icon: "users" },
  { slug: "workshop", nameAr: "ورش", icon: "pen-tool" },
  { slug: "culture", nameAr: "ثقافة", icon: "book-open" },
  { slug: "market", nameAr: "أسواق", icon: "shopping-bag" },
];

const CAT_MAP = new Map(EVENT_CATEGORIES.map((c) => [c.slug, c]));

export function categoryAr(slug: string): string {
  return CAT_MAP.get(slug as EventCategorySlug)?.nameAr ?? slug;
}
export function categoryIcon(slug: string): string {
  return CAT_MAP.get(slug as EventCategorySlug)?.icon ?? "calendar-days";
}

/** Diagonal-striped gradient placeholder per `tone` (a–f). Used as CSS `background`. */
const TONE_GRADIENTS: Record<string, string> = {
  a: "linear-gradient(135deg,#F8D3BC,#ECAE8E)",
  b: "linear-gradient(135deg,#D8C4E8,#B79BD6)",
  c: "linear-gradient(135deg,#BCD6E8,#8EB3D1)",
  d: "linear-gradient(135deg,#F6C9C0,#E69287)",
  e: "linear-gradient(135deg,#CBE3CC,#9CC79E)",
  f: "linear-gradient(135deg,#F2DDB0,#E0C079)",
};
export function toneBackground(tone: string): string {
  const g = TONE_GRADIENTS[tone] ?? TONE_GRADIENTS.a;
  return `repeating-linear-gradient(45deg, rgba(255,255,255,.22) 0 2px, transparent 2px 13px), ${g}`;
}

export function eventPriceLabel(e: {
  priceFrom: number | null;
  priceNote: string | null;
}): { label: string; free: boolean } {
  if (e.priceFrom != null) return { label: `من ${formatNum(e.priceFrom)} ل.س`, free: false };
  return { label: e.priceNote ?? "مجاني", free: true };
}

const TZ = "Asia/Damascus";

/** Calendar date key "YYYY-MM-DD" for a Date in Damascus time. */
export function damascusDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function eventTimeLabel(e: {
  allDay: boolean;
  timeLabel: string | null;
  startsAt: Date;
}): string {
  if (e.timeLabel) return e.timeLabel;
  if (e.allDay) return "طوال اليوم";
  return new Intl.DateTimeFormat("ar-SY", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(e.startsAt);
}

export type DayMeta = {
  index: number;
  key: string; // YYYY-MM-DD (Damascus)
  dowAr: string; // weekday name, or "اليوم" for index 0
  dayNum: string; // Arabic-Indic day-of-month
};

/** The next `count` days starting today (Damascus), for the day-strip calendar. */
export function buildDayWindow(now = new Date(), count = 8): DayMeta[] {
  const days: DayMeta[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() + i * 86_400_000);
    days.push({
      index: i,
      key: damascusDateKey(d),
      dowAr:
        i === 0
          ? "اليوم"
          : new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, weekday: "long" }).format(d),
      dayNum: new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, day: "numeric" }).format(d),
    });
  }
  return days;
}

/** Display date for an event — a range ("١٦–٢١ حزيران") or single day ("الإثنين ١٥ حزيران"). */
export function formatEventDate(startsAt: Date, endsAt: Date | null): string {
  const month = new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, month: "long" }).format(startsAt);
  const dStart = new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, day: "numeric" }).format(startsAt);
  if (endsAt && damascusDateKey(endsAt) !== damascusDateKey(startsAt)) {
    const dEnd = new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, day: "numeric" }).format(endsAt);
    return `${dStart}–${dEnd} ${month}`;
  }
  const wd = new Intl.DateTimeFormat("ar-SY", { timeZone: TZ, weekday: "long" }).format(startsAt);
  return `${wd} ${dStart} ${month}`;
}

/** Arabic month + year label for the day-strip header, e.g. "حزيران ٢٠٢٦". */
export function monthLabel(now = new Date()): string {
  return new Intl.DateTimeFormat("ar-SY", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(now);
}

/** Events within the day-strip window (today … today+days). */
export async function getEventsInWindow(now = new Date(), days = 8) {
  const from = new Date(now.getTime() - 2 * 86_400_000);
  const to = new Date(now.getTime() + (days + 1) * 86_400_000);
  return db.event.findMany({
    where: { startsAt: { gte: from, lte: to } },
    orderBy: { startsAt: "asc" },
  });
}

/** Currently-promoted events for the top carousel. */
export async function getFeaturedEvents(now = new Date(), take = 5) {
  return db.event.findMany({
    where: {
      featured: true,
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: new Date(now.getTime() - 86_400_000) } }],
    },
    orderBy: { startsAt: "asc" },
    take,
  });
}

export async function getEventBySlug(slug: string) {
  return db.event.findUnique({ where: { slug } });
}

/** Up to `take` other events in the same category, soonest first. */
export async function getSimilarEvents(category: string, excludeId: string, now = new Date(), take = 4) {
  return db.event.findMany({
    where: {
      category,
      id: { not: excludeId },
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: new Date(now.getTime() - 86_400_000) } }],
    },
    orderBy: { startsAt: "asc" },
    take,
  });
}
