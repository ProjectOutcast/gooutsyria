import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCity } from "@/lib/queries";
import { parseFilters, type RawSearchParams } from "@/lib/searchParams";
import { RestaurantListing } from "@/components/RestaurantListing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string; slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const [cityRow, cuisine] = await Promise.all([
    getCity(city),
    db.cuisine.findUnique({ where: { slug } }),
  ]);
  if (!cityRow || !cuisine) return {};
  return {
    title: `أفضل مطاعم ${cuisine.nameAr} في ${cityRow.nameAr}`,
    description: `قائمة أفضل مطاعم ${cuisine.nameAr} في ${cityRow.nameAr} مرتبة حسب تقييمات الزوار — مع قوائم الطعام والأسعار والعروض.`,
    alternates: { canonical: `/${city}/cuisine/${slug}` },
  };
}

export default async function CuisinePage({ params, searchParams }: Props) {
  const { city, slug } = await params;
  const [cityRow, cuisine] = await Promise.all([
    getCity(city),
    db.cuisine.findUnique({ where: { slug } }),
  ]);
  if (!cityRow || !cuisine) notFound();

  const raw = await searchParams;
  const filters = { ...parseFilters(raw), cuisine: slug };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">
        {cuisine.icon} أفضل مطاعم {cuisine.nameAr} في {cityRow.nameAr}
      </h1>
      <p className="text-stone-500 text-sm mt-1 mb-5">
        مرتبة حسب تقييمات الزوار الحقيقية — اكتشف القوائم والأسعار قبل ما تطلع
      </p>
      <RestaurantListing
        citySlug={city}
        filters={filters}
        rawParams={raw}
        basePath={`/${city}/cuisine/${slug}`}
        hideCuisine
      />
    </div>
  );
}
