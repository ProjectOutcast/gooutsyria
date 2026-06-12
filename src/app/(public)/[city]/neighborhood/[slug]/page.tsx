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

async function getData(city: string, slug: string) {
  const cityRow = await getCity(city);
  if (!cityRow) return null;
  const neighborhood = await db.neighborhood.findUnique({
    where: { cityId_slug: { cityId: cityRow.id, slug } },
  });
  if (!neighborhood) return null;
  return { cityRow, neighborhood };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const data = await getData(city, slug);
  if (!data) return {};
  return {
    title: `مطاعم ${data.neighborhood.nameAr} — ${data.cityRow.nameAr}`,
    description: `كل مطاعم وكافيهات منطقة ${data.neighborhood.nameAr} في ${data.cityRow.nameAr} مع التقييمات وقوائم الطعام والعروض.`,
    alternates: { canonical: `/${city}/neighborhood/${slug}` },
  };
}

export default async function NeighborhoodPage({ params, searchParams }: Props) {
  const { city, slug } = await params;
  const data = await getData(city, slug);
  if (!data) notFound();

  const raw = await searchParams;
  const filters = { ...parseFilters(raw), neighborhood: slug };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">
        مطاعم {data.neighborhood.nameAr} في {data.cityRow.nameAr}
      </h1>
      <p className="text-stone-500 text-sm mt-1 mb-5">
        اكتشف أماكن منطقة {data.neighborhood.nameAr} — تقييمات حقيقية وقوائم
        طعام كاملة
      </p>
      <RestaurantListing
        citySlug={city}
        filters={filters}
        rawParams={raw}
        basePath={`/${city}/neighborhood/${slug}`}
        hideNeighborhood
      />
    </div>
  );
}
