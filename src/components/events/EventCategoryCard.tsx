import Link from "next/link";
import Image from "next/image";
import { formatNum } from "@/lib/format";

/** Image card for the events "browse by category" rail: cover photo with a
 * dark scrim and the category name + event count (in brackets) overlaid. */
export function EventCategoryCard({
  nameAr,
  count,
  imageUrl,
  href,
}: {
  nameAr: string;
  count: number;
  imageUrl: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-chipbg"
    >
      <Image
        src={imageUrl}
        alt={nameAr}
        fill
        sizes="(max-width: 640px) 45vw, 220px"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-4">
        <h3 className="text-white font-bold text-[18px] leading-tight drop-shadow-sm">
          {nameAr}{" "}
          <span className="text-[13px] font-normal text-white/70">({formatNum(count)})</span>
        </h3>
      </div>
    </Link>
  );
}
