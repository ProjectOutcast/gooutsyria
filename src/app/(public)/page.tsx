import Link from "next/link";
import { Chevron } from "@/components/Chevron";
import Image from "next/image";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  getFeaturedRestaurants,
  getActiveOffers,
  getActiveSponsor,
  getSavedIds,
  RESTAURANT_CARD_INCLUDE,
} from "@/lib/queries";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/SearchBar";
import {
  formatNum,
  formatRating,
  formatDateAr,
  isOpenNow,
  type OpeningHours,
} from "@/lib/format";

export const dynamic = "force-dynamic";

const QUICK_CHIPS: [string, string, string][] = [
  ["🍽️", "مفتوح الآن", "/damascus/restaurants?open=1"],
  ["🌙", "يعمل ٢٤ ساعة", "/damascus/restaurants?features=24h"],
  ["🏷️", "عروض اليوم", "/damascus/offers"],
  ["💨", "أراكيل", "/damascus/restaurants?features=shisha"],
  ["💻", "مساحات عمل", "/damascus/restaurants?features=workspace"],
];

export default async function HomePage() {
  const session = await auth();
  const [
    cuisines,
    neighborhoods,
    totalPlaces,
    featured,
    topPool,
    offers,
    open24h,
    heroSponsor,
    bannerSponsor,
  ] = await Promise.all([
    db.cuisine.findMany({
      orderBy: { nameAr: "asc" },
      include: {
        _count: {
          select: { restaurants: { where: { restaurant: { status: "APPROVED" } } } },
        },
      },
    }),
    db.neighborhood.findMany({
      where: { city: { slug: "damascus" } },
      orderBy: { nameAr: "asc" },
      select: { slug: true, nameAr: true },
    }),
    db.restaurant.count({ where: { status: "APPROVED" } }),
    getFeaturedRestaurants("HOME", { take: 4 }),
    db.restaurant.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ avgRating: "desc" }, { ratingCount: "desc" }],
      include: RESTAURANT_CARD_INCLUDE,
      take: 60,
    }),
    getActiveOffers("damascus", 3),
    db.restaurant.findMany({
      where: {
        status: "APPROVED",
        features: { some: { feature: { slug: "24h" } } },
      },
      include: RESTAURANT_CARD_INCLUDE,
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
    getActiveSponsor("HERO"),
    getActiveSponsor("HOME_BANNER"),
  ]);

  const openNow = topPool
    .filter((r) => isOpenNow(r.openingHours as OpeningHours | null))
    .slice(0, 5);

  const allIds = [
    ...featured.map((r) => r.id),
    ...open24h.map((r) => r.id),
  ];
  const savedIds = await getSavedIds(session?.user?.id, allIds);

  return (
    <div>
      {/* ===== Hero (sellable background) ===== */}
      <section className="relative bg-ink text-white overflow-hidden">
        {heroSponsor?.imageUrl ? (
          <Image
            src={heroSponsor.imageUrl}
            alt={heroSponsor.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/hero-bg.svg)" }}
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,13,11,.72),rgba(20,13,11,.5)_45%,rgba(20,13,11,.8))]" />
        <span className="absolute top-4 start-4 z-10 bg-ink/60 text-white/70 text-[11px] rounded-full px-3 py-1">
          مساحة إعلانية
        </span>

        <div className="relative max-w-[1240px] mx-auto px-7 py-[72px] sm:py-[96px] text-center">
          <span className="inline-block bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
            أكثر من {formatNum(totalPlaces)} مكان في دمشق — محدّث يومياً
          </span>
          <h1 className="mt-6 text-4xl sm:text-[52px] font-bold leading-[1.3]">
            وين طلعتك اليوم؟{" "}
            <span className="text-primary-300">لقّيناهالك.</span>
          </h1>
          <p className="mt-4 text-[17px] sm:text-[19px] text-[#EBDDD6] max-w-2xl mx-auto">
            مطاعم، كافيهات ومساحات عمل في دمشق — تقييمات حقيقية، قوائم طعام،
            عروض اليوم، وكل المفتوح الآن في مكان واحد.
          </p>

          <div className="max-w-2xl mx-auto mt-8">
            <SearchBar size="lg" neighborhoods={neighborhoods} />
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mt-6">
            {QUICK_CHIPS.map(([icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 bg-white/12 hover:bg-white/22 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium transition"
              >
                <span className="text-primary-200">{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-7">
        {/* ===== Categories ===== */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-[24px] font-bold">تصفّح حسب التصنيف</h2>
            <Link href="/damascus/restaurants" className="text-sm text-primary-500 font-semibold hover:underline">
              كل التصنيفات
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {cuisines.map((c) => (
              <Link
                key={c.id}
                href={`/damascus/cuisine/${c.slug}`}
                className="bg-white border border-hairline rounded-2xl p-4 text-center transition duration-150 hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="mx-auto w-[54px] h-[54px] grid place-items-center rounded-2xl bg-primary-50 text-2xl">
                  {c.icon}
                </span>
                <span className="block font-semibold text-sm mt-2.5">{c.nameAr}</span>
                <span className="block text-[12px] text-muted2 mt-0.5">
                  {formatNum(c._count.restaurants)} مكان
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== Sponsored banner ===== */}
        {bannerSponsor && (
          <section className="mt-12">
            <a
              href={bannerSponsor.linkUrl ?? "#"}
              target="_blank"
              rel="noopener sponsored"
              className="relative block rounded-3xl overflow-hidden bg-gradient-to-l from-ink to-primary-900 text-white p-8 sm:p-10"
            >
              <span className="absolute top-4 start-4 bg-white/15 text-white/80 text-[11px] rounded-full px-3 py-1">
                إعلان مموّل
              </span>
              <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                <div className="max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                    {bannerSponsor.name}
                  </h2>
                  <span className="inline-block mt-5 bg-primary-500 hover:bg-primary-700 rounded-xl px-6 py-2.5 font-bold text-sm shadow-accent transition">
                    اكتشف المزيد
                  </span>
                </div>
                {bannerSponsor.imageUrl && (
                  <Image
                    src={bannerSponsor.imageUrl}
                    alt={bannerSponsor.name}
                    width={260}
                    height={170}
                    className="rounded-2xl object-cover"
                  />
                )}
              </div>
            </a>
          </section>
        )}

        {/* ===== Featured ===== */}
        {featured.length > 0 && (
          <section className="mt-14">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-[24px] font-bold">✦ مختارات مميّزة</h2>
              <span className="text-[12px] text-muted2">إعلانات مدفوعة</span>
            </div>
            <p className="text-sm text-muted mb-5">أماكن اختارت الظهور المميّز هذا الشهر</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} featured variant="compact" saved={savedIds.has(r.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ===== Open now + Offers ===== */}
        <section className="mt-14 grid lg:grid-cols-[1.55fr_1fr] gap-8 items-start">
          <div>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[24px] font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" />
                مفتوح الآن قربك
              </h2>
              <Link href="/damascus/restaurants?open=1" className="text-sm text-primary-500 font-semibold hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-3">
              {openNow.map((r) => (
                <Link
                  key={r.id}
                  href={`/damascus/restaurant/${r.slug}`}
                  className="flex items-center gap-4 bg-white border border-hairline rounded-2xl p-3 transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="relative w-[72px] h-[72px] rounded-xl overflow-hidden bg-chipbg shrink-0">
                    {r.photos[0] && (
                      <Image
                        src={r.photos[0].url}
                        alt={r.nameAr}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-ink line-clamp-1">{r.nameAr}</span>
                      <span className="bg-success-tint text-success text-[11px] font-bold rounded-full px-2 py-0.5 shrink-0">
                        مفتوح
                      </span>
                    </span>
                    <span className="block text-[13px] text-muted mt-0.5 line-clamp-1">
                      {r.cuisines.map((c) => c.cuisine.nameAr).join(" · ")} ·{" "}
                      {r.neighborhood?.nameAr}
                    </span>
                    <span className="block text-[13px] mt-1">
                      <span className="text-star">★</span>{" "}
                      <span className="font-bold text-ink">{formatRating(r.avgRating)}</span>
                      <span className="text-muted2"> · {formatNum(r.ratingCount)} تقييم</span>
                    </span>
                  </span>
                  <Chevron dir="left" size={18} className="text-muted2 shrink-0" />
                </Link>
              ))}
              {openNow.length === 0 && (
                <p className="text-sm text-muted bg-white border border-hairline rounded-2xl p-5">
                  لا توجد أماكن مفتوحة حالياً — تفقد القائمة الكاملة.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[24px] font-bold">🔥 أحدث العروض</h2>
              <Link href="/damascus/offers" className="text-sm text-primary-500 font-semibold hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-3">
              {offers.map((o) => (
                <Link
                  key={o.id}
                  href={`/damascus/restaurant/${o.restaurant.slug}`}
                  className="block rounded-2xl border border-primary-200 bg-gradient-to-bl from-primary-50 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="inline-block bg-primary-500 text-white text-[12px] font-bold rounded-full px-2.5 py-0.5">
                    {o.titleAr}
                  </span>
                  <span className="block font-semibold mt-2">{o.restaurant.nameAr}</span>
                  {o.descAr && (
                    <span className="block text-[13px] text-ink2 mt-1 line-clamp-2">{o.descAr}</span>
                  )}
                  <span className="flex items-center gap-1 text-[12px] text-muted mt-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    حتى {formatDateAr(o.endsAt)} · {o.restaurant.neighborhood?.nameAr}
                  </span>
                </Link>
              ))}
              {offers.length === 0 && (
                <p className="text-sm text-muted bg-white border border-hairline rounded-2xl p-5">
                  لا عروض سارية حالياً.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ===== Open 24h — dark band ===== */}
      {open24h.length > 0 && (
        <section className="bg-ink text-white mt-16 py-12">
          <div className="max-w-[1240px] mx-auto px-7">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-[24px] font-bold flex items-center gap-2.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-featured)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                يعمل ٢٤ ساعة
              </h2>
              <Link href="/damascus/restaurants?features=24h" className="text-sm text-primary-300 font-semibold hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {open24h.map((r) => (
                <Link
                  key={r.id}
                  href={`/damascus/restaurant/${r.slug}`}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 transition hover:bg-white/10"
                >
                  <span className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0">
                    {r.photos[0] && (
                      <Image
                        src={r.photos[0].url}
                        alt={r.nameAr}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-[15px] text-white line-clamp-1">
                      {r.nameAr}
                    </span>
                    <span className="block text-[12px] text-white/55 line-clamp-1">
                      {r.cuisines[0]?.cuisine.nameAr}
                      {r.ratingCount > 0 && (
                        <>
                          {" · "}
                          <span className="text-star">★</span>{" "}
                          {formatRating(r.avgRating)}
                        </>
                      )}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1240px] mx-auto px-7">
        {/* ===== Map teaser ===== */}
        <section className="mt-16 grid lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
          <div>
            <span className="inline-block bg-chipbg text-ink2 text-[12px] font-semibold rounded-full px-3 py-1 mb-3">
              استكشف الخريطة
            </span>
            <h2 className="text-[26px] font-bold leading-snug">
              شوف وين الأماكن على خريطة دمشق
            </h2>
            <p className="text-ink2 mt-3 leading-relaxed">
              فلتر حسب المنطقة، المطبخ، السعر، والمفتوح الآن — وكل مكان على
              بعد نقرة.
            </p>
            <Link
              href="/damascus/map"
              className="inline-flex items-center gap-2 mt-5 bg-primary-500 hover:bg-primary-700 text-white rounded-xl px-6 py-2.5 font-bold shadow-accent transition"
            >
              افتح الخريطة
            </Link>
          </div>
          <Link
            href="/damascus/map"
            className="relative block h-64 rounded-3xl border border-hairline overflow-hidden bg-[repeating-linear-gradient(0deg,#F7F0EB_0_39px,#EFE4DC_39px_40px),repeating-linear-gradient(90deg,#F7F0EB_0_39px,#EFE4DC_39px_40px)]"
          >
            {[["28%", "30%"], ["55%", "60%"], ["40%", "75%"]].map(([top, start], i) => (
              <span
                key={i}
                className="absolute w-8 h-8 grid place-items-center rounded-full bg-primary-500 text-white shadow-accent"
                style={{ top, insetInlineStart: start }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                </svg>
              </span>
            ))}
          </Link>
        </section>

        {/* ===== Add-restaurant CTA ===== */}
        <section className="mt-16 mb-2 rounded-3xl bg-gradient-to-l from-primary-500 to-primary-700 text-white p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            عندك مطعم أو كافيه في دمشق؟
          </h2>
          <p className="text-white/85 mt-3 max-w-xl mx-auto">
            أضف مكانك مجاناً خلال دقائق — اعرض قائمتك الرقمية، وتواصل مع آلاف
            الزبائن كل يوم.
          </p>
          <Link
            href="/for-restaurants"
            className="inline-block mt-6 bg-white text-primary-700 hover:bg-primary-50 rounded-xl px-8 py-3 font-bold transition"
          >
            أضف مطعمك مجاناً
          </Link>
        </section>
      </div>
    </div>
  );
}
