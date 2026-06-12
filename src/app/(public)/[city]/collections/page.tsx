import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCity, getPublishedCollections } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) return {};
  return {
    title: `قوائم مختارة — أفضل أماكن ${cityRow.nameAr}`,
    description: `قوائم مُنتقاة بعناية لأفضل مطاعم وكافيهات ${cityRow.nameAr}: للعائلات، للسهرات، للفطور، ولكل المناسبات.`,
    alternates: { canonical: `/${city}/collections` },
  };
}

export default async function CollectionsPage({ params }: Props) {
  const { city } = await params;
  const cityRow = await getCity(city);
  if (!cityRow) notFound();

  const collections = await getPublishedCollections(city);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">قوائم مختارة في {cityRow.nameAr}</h1>
      <p className="text-stone-500 text-sm mt-1 mb-6">
        اختيارات فريقنا لأفضل الأماكن حسب المناسبة والمزاج
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/${city}/collections/${col.slug}`}
            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-stone-800"
          >
            {col.coverImage && (
              <Image
                src={col.coverImage}
                alt={col.titleAr}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover opacity-70 group-hover:opacity-60 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
            <div className="absolute bottom-0 p-4 text-white">
              <h2 className="font-bold text-lg">{col.titleAr}</h2>
              {col.descAr && (
                <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                  {col.descAr}
                </p>
              )}
              <p className="text-xs text-accent-100 mt-1.5">
                {col._count.items} أماكن
              </p>
            </div>
          </Link>
        ))}
      </div>
      {collections.length === 0 && (
        <p className="text-stone-500">لا توجد قوائم منشورة بعد.</p>
      )}
    </div>
  );
}
