import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCity } from "@/lib/queries";
import { MapView } from "@/components/MapView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) return {};
  return {
    title: `خريطة مطاعم ${cityRow.nameAr}`,
    description: `كل مطاعم وكافيهات ${cityRow.nameAr} على خريطة تفاعلية واحدة.`,
    alternates: { canonical: `/${city}/map` },
  };
}

export default async function MapPage({ params }: Props) {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const restaurants = await db.restaurant.findMany({
    where: {
      status: "APPROVED",
      cityId: cityRow.id,
      lat: { not: null },
      lng: { not: null },
    },
    select: { slug: true, nameAr: true, lat: true, lng: true },
  });

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-7">
      <h1 className="text-[30px] font-bold mb-1">خريطة أماكن {cityRow.nameAr}</h1>
      <p className="text-ink2 text-[15px] mb-6">
        اضغط على أي نقطة لعرض اسم المكان والانتقال لصفحته.
      </p>
      <MapView
        autoload
        className="h-[70vh]"
        markers={restaurants.map((r) => ({
          lat: r.lat!,
          lng: r.lng!,
          name: r.nameAr,
          href: `/${city}/restaurant/${r.slug}`,
        }))}
      />
    </div>
  );
}
