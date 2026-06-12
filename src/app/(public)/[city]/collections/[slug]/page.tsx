import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { RESTAURANT_CARD_INCLUDE } from "@/lib/queries";
import { RestaurantCard } from "@/components/RestaurantCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string; slug: string }> };

async function getCollection(citySlug: string, slug: string) {
  return db.collection.findFirst({
    where: { slug, published: true, city: { slug: citySlug } },
    include: {
      city: true,
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          restaurant: { include: RESTAURANT_CARD_INCLUDE },
        },
      },
      sponsors: {
        where: {
          active: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
        take: 1,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const col = await getCollection(city, slug);
  if (!col) return {};
  return {
    title: col.titleAr,
    description:
      col.descAr ??
      `${col.titleAr} — قائمة مختارة من Go Out Syria لأفضل الأماكن في ${col.city.nameAr}.`,
    alternates: { canonical: `/${city}/collections/${slug}` },
    openGraph: col.coverImage ? { images: [col.coverImage] } : undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { city, slug } = await params;
  const col = await getCollection(city, slug);
  if (!col) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: col.titleAr,
    itemListElement: col.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.restaurant.nameAr,
      url: `${siteUrl}/${city}/restaurant/${item.restaurant.slug}`,
    })),
  };

  const sponsor = col.sponsors[0];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <div className="relative bg-stone-900 text-white">
        {col.coverImage && (
          <Image
            src={col.coverImage}
            alt={col.titleAr}
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
        )}
        <div className="relative max-w-6xl mx-auto px-4 py-14">
          <h1 className="text-3xl font-bold">{col.titleAr}</h1>
          {col.descAr && (
            <p className="text-stone-300 mt-2 max-w-2xl">{col.descAr}</p>
          )}
          {sponsor && (
            <p className="mt-4 text-xs text-stone-400">
              برعاية{" "}
              {sponsor.linkUrl ? (
                <a
                  href={sponsor.linkUrl}
                  target="_blank"
                  rel="noopener sponsored"
                  className="text-accent-100 font-semibold hover:underline"
                >
                  {sponsor.name}
                </a>
              ) : (
                <span className="text-accent-100 font-semibold">
                  {sponsor.name}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {col.items.map((item, i) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="text-3xl font-bold text-stone-300 w-10 shrink-0 text-center ltr-nums">
              {i + 1}
            </div>
            <div className="flex-1 grid sm:grid-cols-[280px_1fr] gap-4">
              <RestaurantCard restaurant={item.restaurant} />
              {item.blurbAr && (
                <p className="text-stone-600 text-sm leading-relaxed pt-1">
                  {item.blurbAr}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
