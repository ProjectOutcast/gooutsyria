import type { Metadata } from "next";
import Link from "next/link";
import { Chevron } from "@/components/Chevron";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCity } from "@/lib/queries";
import { parseFilters, type RawSearchParams } from "@/lib/searchParams";
import { RestaurantListing } from "@/components/RestaurantListing";
import { SearchBar } from "@/components/SearchBar";
import { formatNum } from "@/lib/format";

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
  const [neighborhoods, total] = await Promise.all([
    db.neighborhood.findMany({
      where: { cityId: cityRow.id },
      orderBy: { nameAr: "asc" },
      select: { slug: true, nameAr: true },
    }),
    db.restaurant.count({ where: { status: "APPROVED", cityId: cityRow.id } }),
  ]);

  return (
    <div>
      {/* compact search strip */}
      <div className="bg-white border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-7 py-3">
          <SearchBar
            citySlug={city}
            defaultValue={filters.q ?? ""}
            defaultNeighborhood={filters.neighborhood ?? ""}
            neighborhoods={neighborhoods}
          />
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-7 py-7">
        <nav className="text-[13px] text-muted mb-3" aria-label="مسار التنقل">
          <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
          <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
          <Link href={`/${city}/restaurants`} className="hover:text-primary-500">{cityRow.nameAr}</Link>
          <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
          <span className="text-ink font-semibold">المطاعم</span>
        </nav>

        <h1 className="text-[30px] font-bold">مطاعم في {cityRow.nameAr}</h1>
        <p className="text-ink2 text-[15px] mt-1 mb-7">
          {formatNum(total)} مكان — مرتّبة حسب الأكثر صلة. مشاوي، مأكولات شامية،
          كافيهات وأكثر.
        </p>

        <RestaurantListing
          citySlug={city}
          filters={filters}
          rawParams={raw}
          basePath={`/${city}/restaurants`}
        />
      </div>
    </div>
  );
}
