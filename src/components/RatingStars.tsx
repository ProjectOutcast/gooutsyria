export function RatingStars({
  value,
  size = "text-sm",
}: {
  value: number;
  size?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span className={`${size} text-amber-500 leading-none`} aria-hidden>
      {"★".repeat(rounded)}
      <span className="text-stone-300">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export function RatingBadge({
  value,
  count,
}: {
  value: number;
  count: number;
}) {
  if (count === 0) {
    return <span className="text-xs text-stone-500">لا تقييمات بعد</span>;
  }
  const color =
    value >= 4 ? "bg-green-700" : value >= 3 ? "bg-amber-600" : "bg-primary-700";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`${color} text-white text-xs font-bold rounded-md px-1.5 py-0.5 ltr-nums`}
      >
        {value.toFixed(1)} ★
      </span>
      <span className="text-xs text-stone-500">({count})</span>
    </span>
  );
}
