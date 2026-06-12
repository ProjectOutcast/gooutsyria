import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import {
  getFeaturedRestaurants,
  getActiveOffers,
  getPublishedCollections,
  getActiveSponsor,
  RESTAURANT_CARD_INCLUDE,
} from "@/lib/queries";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/SearchBar";
import { formatDateAr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cuisines, featured, topRated, collections, offers, sponsor] =
    await Promise.all([
      db.cuisine.findMany({ orderBy: { nameAr: "asc" } }),
      getFeaturedRestaurants("HOME", { take: 4 }),
      db.restaurant.findMany({
        where: { status: "APPROVED", ratingCount: { gt: 0 } },
        orderBy: [{ avgRating: "desc" }, { ratingCount: "desc" }],
        include: RESTAURANT_CARD_INCLUDE,
        take: 8,
      }),
      getPublishedCollections("damascus", 3),
      getActiveOffers("damascus", 4),
      getActiveSponsor("HOME_BANNER"),
    ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-snug">
            وين طلعتك اليوم؟
          </h1>
          <p className="mt-3 text-primary-100 sm:text-lg">
            اكتشف أفضل مطاعم وكافيهات دمشق — قوائم طعام، أسعار، تقييمات حقيقية
            وعروض حصرية
          </p>
          <div className="max-w-xl mx-auto mt-7">
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {cuisines.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/damascus/cuisine/${c.slug}`}
                className="bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 text-sm"
              >
                {c.icon} {c.nameAr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* Sponsor banner */}
        {sponsor && (
          <a
            href={sponsor.linkUrl ?? "#"}
            target="_blank"
            rel="noopener sponsored"
            className="block mt-6 relative rounded-2xl overflow-hidden bg-stone-200"
          >
            {sponsor.imageUrl ? (
              <Image
                src={sponsor.imageUrl}
                alt={sponsor.name}
                width={1152}
                height={160}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="h-24 flex items-center justify-center font-bold text-stone-600">
                {sponsor.name}
              </div>
            )}
            <span className="absolute top-2 start-2 bg-stone-900/70 text-white text-[11px] rounded-full px-2 py-0.5">
              إعلان
            </span>
          </a>
        )}

        {/* Cuisines */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">تصفّح حسب المطبخ</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cuisines.map((c) => (
              <Link
                key={c.id}
                href={`/damascus/cuisine/${c.slug}`}
                className="bg-white border border-stone-200 rounded-xl p-3 text-center hover:border-primary-400 hover:shadow-sm transition"
              >
                <div className="text-2xl">{c.icon}</div>
                <div className="text-sm font-semibold mt-1">{c.nameAr}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured (sponsored) */}
        {featured.length > 0 && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold">مختارات مميزة</h2>
              <span className="text-xs text-stone-400">إعلانات مموَّلة</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} sponsored />
              ))}
            </div>
          </section>
        )}

        {/* Top rated */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold">الأعلى تقييماً في دمشق</h2>
            <Link
              href="/damascus/restaurants"
              className="text-sm text-primary-700 font-semibold hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topRated.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>

        {/* Collections */}
        {collections.length > 0 && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold">قوائم مختارة بعناية</h2>
              <Link
                href="/damascus/collections"
                className="text-sm text-primary-700 font-semibold hover:underline"
              >
                كل القوائم ←
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/damascus/collections/${col.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[16/9] bg-stone-800"
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
                    <h3 className="font-bold">{col.titleAr}</h3>
                    <p className="text-xs text-stone-300 mt-1">
                      {col._count.items} أماكن
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold">🔥 عروض سارية الآن</h2>
              <Link
                href="/damascus/offers"
                className="text-sm text-primary-700 font-semibold hover:underline"
              >
                كل العروض ←
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((o) => (
                <Link
                  key={o.id}
                  href={`/damascus/restaurant/${o.restaurant.slug}`}
                  className="bg-white border border-accent-500/40 rounded-2xl p-4 hover:shadow-md transition"
                >
                  <div className="text-accent-600 font-bold text-sm">
                    {o.titleAr}
                  </div>
                  <div className="font-semibold mt-1">{o.restaurant.nameAr}</div>
                  <div className="text-xs text-stone-500 mt-2">
                    حتى {formatDateAr(o.endsAt)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Owner CTA */}
        <section className="mt-14 mb-4 bg-stone-900 text-white rounded-3xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold">عندك مطعم أو كافيه؟</h2>
          <p className="text-stone-300 mt-2 max-w-xl mx-auto">
            أضف منشأتك مجاناً، حدّث قائمة الطعام، رد على التقييمات، وتابع
            الزيارات والاتصالات من لوحة تحكم خاصة بك.
          </p>
          <Link
            href="/for-restaurants"
            className="inline-block mt-5 bg-accent-600 hover:bg-accent-700 rounded-xl px-6 py-2.5 font-bold"
          >
            سجّل مطعمك الآن
          </Link>
        </section>
      </div>
    </div>
  );
}
