import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCity, getActiveOffers } from "@/lib/queries";
import { formatDateAr } from "@/lib/format";
import { RatingBadge } from "@/components/RatingStars";

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">🔥 عروض {cityRow.nameAr} الحالية</h1>
      <p className="text-stone-500 text-sm mt-1 mb-6">
        خصومات وعروض سارية الآن — اتصل أو راسل المطعم مباشرة للاستفادة
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => {
          const photo = o.restaurant.photos[0];
          return (
            <Link
              key={o.id}
              href={`/${city}/restaurant/${o.restaurant.slug}`}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative aspect-[16/8] bg-stone-100">
                {photo && (
                  <Image
                    src={photo.url}
                    alt={o.restaurant.nameAr}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                )}
                <span className="absolute top-2 start-2 bg-accent-600 text-white text-xs font-bold rounded-full px-2.5 py-1">
                  {o.titleAr}
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold group-hover:text-primary-700 transition-colors">
                  {o.restaurant.nameAr}
                </h2>
                {o.descAr && (
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                    {o.descAr}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <RatingBadge
                    value={o.restaurant.avgRating}
                    count={o.restaurant.ratingCount}
                  />
                  <span className="text-xs text-stone-500">
                    حتى {formatDateAr(o.endsAt)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {offers.length === 0 && (
        <p className="text-stone-500">لا توجد عروض سارية حالياً — عُد قريباً!</p>
      )}
    </div>
  );
}
