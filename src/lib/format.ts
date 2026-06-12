import type { PriceBand } from "@/generated/prisma/enums";

const nf = new Intl.NumberFormat("ar-SY-u-nu-latn");

export function formatSyp(amount: number): string {
  return `${nf.format(amount)} ل.س`;
}

export const PRICE_BAND_LABELS: Record<PriceBand, string> = {
  CHEAP: "اقتصادي",
  MODERATE: "متوسط",
  EXPENSIVE: "مرتفع",
  LUXURY: "فاخر",
};

export const PRICE_BAND_SYMBOLS: Record<PriceBand, string> = {
  CHEAP: "$",
  MODERATE: "$$",
  EXPENSIVE: "$$$",
  LUXURY: "$$$$",
};

export const DAY_NAMES_AR = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export type OpeningHours = Record<
  string,
  { open: string; close: string } | null
>;

/** Current day index (0=Sunday) and minutes-since-midnight in Damascus time. */
function nowInDamascus(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Damascus",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    get("weekday")
  );
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  return { day: dayIdx, minutes: hour * 60 + minute };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Whether the venue is open right now (Damascus time). Handles past-midnight closing. */
export function isOpenNow(hours: OpeningHours | null | undefined): boolean | null {
  if (!hours) return null;
  const { day, minutes } = nowInDamascus();
  const today = hours[String(day)];
  const yesterday = hours[String((day + 6) % 7)];

  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (close > open) {
      if (minutes >= open && minutes < close) return true;
    } else if (minutes >= open) {
      // closes after midnight
      return true;
    }
  }
  // still open from yesterday's past-midnight closing
  if (yesterday) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close < open && minutes < close) return true;
  }
  return false;
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}

export function formatDateAr(date: Date): string {
  return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
