import { z } from "zod";
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

/** Dedicated Higgsfield-generated cover photo per category. */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EheDHYPzspdioz8fQRTl2NIv7K/";
const CATEGORY_IMAGE: Record<EventCategorySlug, string> = {
  music: CDN + "hf_20260614_082401_12a24b47-97d0-41ff-bbc8-77ce56d86446.png",
  theatre: CDN + "hf_20260614_082402_611b3db6-69d9-4e77-a266-484295710821.png",
  festival: CDN + "hf_20260614_082404_9827d963-15fa-49dd-ac1b-ef62038c7302.png",
  expo: CDN + "hf_20260614_082405_b47a14e3-f323-4ae9-94a5-70bc2ee52e18.png",
  sports: CDN + "hf_20260614_082426_994ac909-8ecb-4ac1-9a82-1b8f857c314f.png",
  family: CDN + "hf_20260614_082428_d5bf8a59-9a81-459c-8f1b-44830ec67ff1.png",
  workshop: CDN + "hf_20260614_082429_e5c2d6d4-f640-4c6e-a265-93f8d604ff0e.png",
  culture: CDN + "hf_20260614_082440_3e230d6b-9561-46ef-848b-2d6fb5a0e789.png",
  market: CDN + "hf_20260614_082447_fc079466-a6aa-4b82-84b6-c69a3f585875.png",
};
export function categoryImage(slug: string): string {
  return CATEGORY_IMAGE[slug as EventCategorySlug] ?? CATEGORY_IMAGE.music;
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
    where: { status: "APPROVED", startsAt: { gte: from, lte: to } },
    orderBy: { startsAt: "asc" },
  });
}

/** Currently-promoted events for the top carousel. */
export async function getFeaturedEvents(now = new Date(), take = 5) {
  return db.event.findMany({
    where: {
      status: "APPROVED",
      featured: true,
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: new Date(now.getTime() - 86_400_000) } }],
    },
    orderBy: { startsAt: "asc" },
    take,
  });
}

export async function getEventBySlug(slug: string) {
  return db.event.findFirst({ where: { slug, status: "APPROVED" } });
}

/** All events owned by a user (any status) — for the owner dashboard. */
export async function getEventsByOwner(userId: string) {
  return db.event.findMany({ where: { ownerId: userId }, orderBy: { startsAt: "asc" } });
}

/** Up to `take` other events in the same category, soonest first. */
export async function getSimilarEvents(category: string, excludeId: string, now = new Date(), take = 4) {
  return db.event.findMany({
    where: {
      status: "APPROVED",
      category,
      id: { not: excludeId },
      OR: [{ endsAt: { gte: now } }, { endsAt: null, startsAt: { gte: new Date(now.getTime() - 86_400_000) } }],
    },
    orderBy: { startsAt: "asc" },
    take,
  });
}

// --- Event create/edit form parsing (shared by admin + owner actions) ---

const CATEGORY_SLUGS = EVENT_CATEGORIES.map((c) => c.slug) as [string, ...string[]];
const TONES = ["a", "b", "c", "d", "e", "f"];

/** Core event fields shared by every create/edit path. `organizer` is omitted
 * (left unchanged on update) when no organizer name is given. */
export type EventCoreData = {
  title: string;
  category: string;
  venue: string;
  area: string;
  summary: string | null;
  description: string | null;
  address: string | null;
  startsAt: Date;
  endsAt: Date | null;
  allDay: boolean;
  timeLabel: string | null;
  priceFrom: number | null;
  priceNote: string | null;
  tone: string;
  imageUrl: string | null;
  organizer?: { name: string; phone?: string };
};

const eventSchema = z.object({
  title: z.string().trim().min(2, "عنوان الفعالية مطلوب").max(160),
  category: z.enum(CATEGORY_SLUGS, "اختر فئة صحيحة"),
  venue: z.string().trim().min(2, "المكان مطلوب").max(160),
  area: z.string().trim().min(1, "المنطقة مطلوبة").max(120),
});

/** Parse + validate the event form. Returns the core data or a first error. */
export function parseEventForm(formData: FormData): { data: EventCoreData } | { error: string } {
  const base = eventSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    venue: formData.get("venue"),
    area: formData.get("area"),
  });
  if (!base.success) return { error: base.error.issues[0]?.message ?? "بيانات غير صالحة" };

  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  if (Number.isNaN(startsAt.getTime())) return { error: "تاريخ ووقت البداية مطلوب" };
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;
  if (endsAt && Number.isNaN(endsAt.getTime())) return { error: "تاريخ الانتهاء غير صالح" };
  if (endsAt && endsAt < startsAt) return { error: "تاريخ الانتهاء يجب أن يكون بعد البداية" };

  const priceRaw = String(formData.get("priceFrom") ?? "").trim();
  const priceFrom = priceRaw ? Number(priceRaw) : null;
  if (priceFrom !== null && (!Number.isInteger(priceFrom) || priceFrom < 0)) {
    return { error: "السعر يجب أن يكون رقماً صحيحاً" };
  }

  const toneRaw = String(formData.get("tone") ?? "a");
  const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;

  const orgName = String(formData.get("organizerName") ?? "").trim();
  const orgPhone = String(formData.get("organizerPhone") ?? "").trim();

  const data: EventCoreData = {
    title: base.data.title,
    category: base.data.category,
    venue: base.data.venue,
    area: base.data.area,
    summary: clean(formData.get("summary")),
    description: clean(formData.get("description")),
    address: clean(formData.get("address")),
    startsAt,
    endsAt,
    allDay: formData.get("allDay") === "on",
    timeLabel: clean(formData.get("timeLabel")),
    priceFrom,
    priceNote: clean(formData.get("priceNote")),
    tone: TONES.includes(toneRaw) ? toneRaw : "a",
    imageUrl: clean(formData.get("imageUrl")),
  };
  if (orgName) data.organizer = { name: orgName, ...(orgPhone ? { phone: orgPhone } : {}) };
  return { data };
}

/** Format an instant as a `datetime-local` value (UTC components, so it round-trips
 * with server-side `new Date(...)` parsing). */
export function toDatetimeLocal(d: Date | null | undefined): string {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
