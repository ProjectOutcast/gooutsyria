import Link from "next/link";
import Image from "next/image";
import { formatNum } from "@/lib/format";
import { Chevron } from "./Chevron";

// maps a cuisine slug to one of the committed placeholder photos
const CATEGORY_IMAGE: Record<string, string> = {
  shami: "p1",
  mashawi: "p3",
  italian: "p4",
  "fast-food": "p13",
  cafe: "p5",
  desserts: "p6",
  seafood: "p7",
  asian: "p8",
  breakfast: "p9",
  pastries: "p10",
  international: "p12",
  juices: "p11",
  aleppan: "p1",
  shawarma: "p2",
  falafel: "p15",
  broast: "p13",
  "ice-cream": "p16",
  lebanese: "p1",
  turkish: "p3",
  indian: "p8",
};

export function CategoryCard({
  slug,
  nameAr,
  count,
  href,
}: {
  slug: string;
  nameAr: string;
  count: number;
  href: string;
}) {
  const img = `/placeholders/${CATEGORY_IMAGE[slug] ?? "p1"}.jpg`;
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-chipbg"
    >
      <Image
        src={img}
        alt={nameAr}
        fill
        sizes="(max-width: 640px) 50vw, 280px"
        className="object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-4">
        <h3 className="text-white font-bold text-[19px] leading-tight drop-shadow-sm">
          {nameAr}
        </h3>
        <span className="mt-1 inline-flex items-center gap-1 text-white/85 text-[13px] font-medium">
          {formatNum(count)} مكان
          <Chevron dir="left" size={13} />
        </span>
      </div>
    </Link>
  );
}
