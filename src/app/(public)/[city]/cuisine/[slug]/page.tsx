import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chevron } from "@/components/Chevron";
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
  const filters = { ...parseFilters(raw), cuisines: [slug] };

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-7">
      <nav className="text-[13px] text-muted mb-3" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
        <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
        <Link href={`/${city}/restaurants`} className="hover:text-primary-500">{cityRow.nameAr}</Link>
        <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
        <span className="text-ink font-semibold">{cuisine.nameAr}</span>
      </nav>

      <h1 className="text-[30px] font-bold">
        {cuisine.icon} أفضل مطاعم {cuisine.nameAr} في {cityRow.nameAr}
      </h1>
      <p className="text-ink2 text-[15px] mt-1 mb-7">
        مرتّبة حسب تقييمات الزوار الحقيقية — اكتشف القوائم والأسعار قبل ما تطلع.
      </p>

      <RestaurantListing
        citySlug={city}
        filters={filters}
        rawParams={raw}
        basePath={`/${city}/cuisine/${slug}`}
        hideCuisines
      />
    </div>
  );
}
