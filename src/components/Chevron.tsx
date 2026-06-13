/**
 * Directional chevron rendered as an SVG so it never flips with RTL bidi
 * mirroring (unlike the ‹ › glyphs). In this RTL UI, forward/next reads to
 * the "left" and back/previous to the "right".
 */
export function Chevron({
  dir,
  size = 18,
  className,
}: {
  dir: "left" | "right";
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
