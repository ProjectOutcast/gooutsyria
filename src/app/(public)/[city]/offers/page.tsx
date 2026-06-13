import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Chevron } from "@/components/Chevron";
import Image from "next/image";
import { getCity, getActiveOffers } from "@/lib/queries";
import { formatDateAr } from "@/lib/format";
import { RatingPill } from "@/components/RatingStars";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) return {};
  return {
    title: `عروض مطاعم ${cityRow.nameAr} — خصومات سارية الآن`,
    description: `كل عروض وخصومات مطاعم وكافيهات ${cityRow.nameAr} في مكان واحد، محدثة يومياً.`,
    alternates: { canonical: `/${city}/offers` },
  };
}

export default async function OffersPage({ params }: Props) {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const offers = await getActiveOffers(city, 60);

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-7">
      <nav className="text-[13px] text-muted mb-3" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
        <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
        <span className="text-ink font-semibold">العروض</span>
      </nav>
      <h1 className="text-[30px] font-bold">🔥 عروض {cityRow.nameAr} الحالية</h1>
      <p className="text-ink2 text-[15px] mt-1 mb-7">
        خصومات وعروض سارية الآن — اتصل أو راسل المطعم مباشرة للاستفادة.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => {
          const photo = o.restaurant.photos[0];
          return (
            <Link
              key={o.id}
              href={`/${city}/restaurant/${o.restaurant.slug}`}
              className="group bg-white border border-hairline rounded-2xl overflow-hidden transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-[16/8] bg-chipbg">
                {photo && (
                  <Image
                    src={photo.url}
                    alt={o.restaurant.nameAr}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute top-2.5 start-2.5 bg-primary-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-accent">
                  {o.titleAr}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold group-hover:text-primary-500 transition-colors">
                  {o.restaurant.nameAr}
                </h2>
                {o.descAr && (
                  <p className="text-sm text-ink2 mt-1 line-clamp-2">{o.descAr}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <RatingPill
                    value={o.restaurant.avgRating}
                    count={o.restaurant.ratingCount}
                  />
                  <span className="text-[12px] text-muted">
                    حتى {formatDateAr(o.endsAt)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {offers.length === 0 && (
        <p className="text-ink2 bg-white border border-hairline rounded-2xl p-8 text-center">
          لا توجد عروض سارية حالياً — عُد قريباً!
        </p>
      )}
    </div>
  );
}
