import { formatNum, formatRating } from "@/lib/format";

/** Amber stars — used ONLY inside reviews lists/breakdowns per the design. */
export function RatingStars({
  value,
  size = "text-sm",
}: {
  value: number;
  size?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={`${size} text-star leading-none`} aria-hidden>
      {"★".repeat(rounded)}
      <span className="text-hairline2">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

/** Green rating pill — the primary rating display everywhere else. */
export function RatingPill({
  value,
  count,
  showCount = false,
  size = "md",
}: {
  value: number;
  count: number;
  showCount?: boolean;
  size?: "md" | "lg";
}) {
  if (count === 0) {
    return <span className="text-xs text-muted whitespace-nowrap">جديد</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 bg-success text-white font-bold rounded-lg ${
          size === "lg" ? "text-base px-2.5 py-1" : "text-xs px-1.5 py-0.5"
        }`}
      >
        <svg
          width={size === "lg" ? 13 : 10}
          height={size === "lg" ? 13 : 10}
          viewBox="0 0 24 24"
          fill="#fff"
          stroke="none"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {formatRating(value)}
      </span>
      {showCount && (
        <span className="text-xs text-muted">{formatNum(count)} تقييم</span>
      )}
    </span>
  );
}

/** Clean inline rating: amber star + value (dot decimal) + bracketed count. */
export function RatingInline({
  value,
  count,
  showCount = true,
  dark = false,
}: {
  value: number;
  count: number;
  showCount?: boolean;
  dark?: boolean;
}) {
  if (count === 0) {
    return <span className={`text-xs ${dark ? "text-white/50" : "text-muted"}`}>جديد</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-star shrink-0" aria-hidden>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className={`text-[15px] font-bold leading-none ${dark ? "text-white" : "text-ink"}`}>
        {formatRating(value)}
      </span>
      {showCount && (
        <span className={`text-[13px] leading-none ${dark ? "text-white/50" : "text-muted2"}`}>
          ({formatNum(count)})
        </span>
      )}
    </span>
  );
}

export function OpenStatus({
  open,
  closeTime,
}: {
  open: boolean | null;
  closeTime?: string | null;
}) {
  if (open === null) return null;
  return open ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-success" />
      مفتوح الآن{closeTime ? ` · يغلق ${closeTime}` : ""}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warn whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-warn" />
      مغلق الآن
    </span>
  );
}
