import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCity } from "@/lib/queries";
import { parseFilters, type RawSearchParams } from "@/lib/searchParams";
import { RestaurantListing } from "@/components/RestaurantListing";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) return {};
  return {
    title: `مطاعم ${cityRow.nameAr} — ابحث وقارن واكتشف`,
    description: `تصفّح كل مطاعم وكافيهات ${cityRow.nameAr} حسب المطبخ والحي والسعر والتقييم. قوائم طعام كاملة وتقييمات حقيقية وعروض حصرية.`,
    alternates: { canonical: `/${city}/restaurants` },
  };
}

export default async function RestaurantsPage({ params, searchParams }: Props) {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const raw = await searchParams;
  const filters = parseFilters(raw);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">مطاعم {cityRow.nameAr}</h1>
      <p className="text-stone-500 text-sm mt-1 mb-5">
        دليلك الكامل لمطاعم وكافيهات {cityRow.nameAr} — ابحث، قارن، واختر طلعتك
        القادمة
      </p>
      <div className="max-w-xl mb-5">
        <SearchBar defaultValue={filters.q ?? ""} />
      </div>
      <RestaurantListing
        citySlug={city}
        filters={filters}
        rawParams={raw}
        basePath={`/${city}/restaurants`}
      />
    </div>
  );
}
