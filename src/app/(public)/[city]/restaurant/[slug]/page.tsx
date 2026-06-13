import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { RESTAURANT_CARD_INCLUDE, getSavedIds, getActiveSponsor } from "@/lib/queries";
import {
  formatSyp,
  formatNum,
  formatDateAr,
  formatRelativeAr,
  formatTime,
  formatRating,
  isOpenNow,
  todayHours,
  todayIndex,
  DAY_NAMES_AR,
  PRICE_BAND_LABELS,
  PRICE_BAND_SYMBOLS,
  type OpeningHours,
} from "@/lib/format";
import { RatingPill, RatingStars, OpenStatus } from "@/components/RatingStars";
import { RestaurantCard } from "@/components/RestaurantCard";
import { TrackedAction } from "@/components/TrackedAction";
import { MapView } from "@/components/MapView";
import { ReviewForm } from "@/components/ReviewForm";
import { PhotoGallery } from "@/components/PhotoGallery";
import { MenuPages } from "@/components/MenuPages";
import { ProfileTabs } from "@/components/ProfileTabs";
import { Carousel } from "@/components/Carousel";

const DISH_TINTS = ["#FFE3D6", "#E3F0D5", "#F3E4D8", "#FCEEDA"];

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string; slug: string }> };

const AVATAR_COLORS = ["#1FA36B", "#C2410C", "#1D9BF0", "#B5392C", "#7C5CBF", "#0E7490"];

async function getRestaurant(citySlug: string, slug: string) {
  return db.restaurant.findFirst({
    where: { slug, city: { slug: citySlug }, status: "APPROVED" },
    include: {
      city: true,
      neighborhood: true,
      cuisines: { include: { cuisine: true } },
      features: { include: { feature: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      menuSections: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
      offers: {
        where: {
          active: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
        orderBy: { endsAt: "asc" },
      },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const r = await getRestaurant(city, slug);
  if (!r) return {};
  const cuisineNames = r.cuisines.map((c) => c.cuisine.nameAr).join("، ");
  return {
    title: `${r.nameAr} — ${r.neighborhood?.nameAr ?? r.city.nameAr} | قائمة الطعام والتقييمات`,
    description: `${r.nameAr} في ${r.neighborhood?.nameAr ?? r.city.nameAr}: ${cuisineNames}. قائمة الطعام بالأسعار، ${r.ratingCount} تقييم، صور، عروض، ومعلومات التواصل.`,
    alternates: { canonical: `/${city}/restaurant/${slug}` },
    openGraph: r.photos[0] ? { images: [r.photos[0].url] } : undefined,
  };
}

const SCHEMA_DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function buildJsonLd(r: NonNullable<Awaited<ReturnType<typeof getRestaurant>>>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const hours = r.openingHours as OpeningHours | null;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.nameAr,
    alternateName: r.nameEn ?? undefined,
    url: `${siteUrl}/${r.city.slug}/restaurant/${r.slug}`,
    image: r.photos.map((p) => `${siteUrl}${p.url}`),
    servesCuisine: r.cuisines.map((c) => c.cuisine.nameAr),
    priceRange: PRICE_BAND_SYMBOLS[r.priceBand],
    telephone: r.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: r.address ?? undefined,
      addressLocality: r.city.nameAr,
      addressCountry: "SY",
    },
    geo:
      r.lat && r.lng
        ? { "@type": "GeoCoordinates", latitude: r.lat, longitude: r.lng }
        : undefined,
    openingHoursSpecification: hours
      ? Object.entries(hours)
          .filter(([, h]) => h)
          .map(([day, h]) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: SCHEMA_DAYS[Number(day)],
            opens: h!.open,
            closes: h!.close,
          }))
      : undefined,
    aggregateRating:
      r.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (Math.round(r.avgRating * 10) / 10).toFixed(1),
            reviewCount: r.ratingCount,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { city, slug } = await params;
  const [r, session] = await Promise.all([getRestaurant(city, slug), auth()]);
  if (!r) notFound();

  // count the visit without blocking the response
  after(async () => {
    const today = new Date(new Date().toISOString().slice(0, 10));
    await Promise.all([
      db.restaurant.update({
        where: { id: r.id },
        data: { viewCount: { increment: 1 } },
      }),
      db.metricDaily.upsert({
        where: { restaurantId_date: { restaurantId: r.id, date: today } },
        update: { views: { increment: 1 } },
        create: { restaurantId: r.id, date: today, views: 1 },
      }),
    ]);
  });

  const hours = r.openingHours as OpeningHours | null;
  const open = isOpenNow(hours);
  const today = todayHours(hours);
  const todayIdx = todayIndex();

  const galleryPhotos = r.photos.filter((p) => p.kind !== "MENU");
  const menuPages = r.photos.filter((p) => p.kind === "MENU");
  const allItems = r.menuSections.flatMap((s) => s.items);
  const popularDishes = allItems.filter((i) => i.popular).slice(0, 12);
  // rough per-person estimate from the menu (a main + a side/drink)
  const perPerson =
    allItems.length >= 3
      ? Math.round(
          ((allItems.reduce((s, i) => s + i.priceSyp, 0) / allItems.length) * 1.8) / 5000
        ) * 5000
      : null;

  const [similar, savedSet, sidebarSponsor, userReview] = await Promise.all([
    db.restaurant.findMany({
      where: {
        status: "APPROVED",
        id: { not: r.id },
        cityId: r.cityId,
        cuisines: {
          some: { cuisineId: { in: r.cuisines.map((c) => c.cuisineId) } },
        },
      },
      include: RESTAURANT_CARD_INCLUDE,
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
    getSavedIds(session?.user?.id, [r.id]),
    getActiveSponsor("PROFILE_SIDEBAR"),
    session?.user?.id
      ? db.review.findUnique({
          where: {
            restaurantId_userId: { restaurantId: r.id, userId: session.user.id },
          },
        })
      : Promise.resolve(null),
  ]);
  const similarSaved = await getSavedIds(
    session?.user?.id,
    similar.map((s) => s.id)
  );

  // star distribution for the reviews summary
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: r.reviews.filter((rv) => rv.rating === star).length,
  }));
  const maxDist = Math.max(1, ...dist.map((d) => d.count));

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(r)) }}
      />

      {/* Breadcrumb */}
      <nav className="text-[13px] text-muted mb-4" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
        <span className="mx-1.5">‹</span>
        <Link href={`/${r.city.slug}/restaurants`} className="hover:text-primary-500">
          مطاعم {r.city.nameAr}
        </Link>
        {r.cuisines[0] && (
          <>
            <span className="mx-1.5">‹</span>
            <Link
              href={`/${r.city.slug}/cuisine/${r.cuisines[0].cuisine.slug}`}
              className="hover:text-primary-500"
            >
              {r.cuisines[0].cuisine.nameAr}
            </Link>
          </>
        )}
        <span className="mx-1.5">‹</span>
        <span className="text-ink font-semibold">{r.nameAr}</span>
      </nav>

      {/* Gallery */}
      <div id="photos" className="scroll-mt-32">
        <PhotoGallery
          photos={galleryPhotos.map((p) => ({ url: p.url, alt: p.alt }))}
          name={r.nameAr}
          restaurantId={r.id}
          saved={savedSet.has(r.id)}
        />
      </div>

      {/* Identity bar */}
      <div className="flex flex-wrap items-start justify-between gap-6 mt-6">
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold leading-snug flex items-center gap-2.5">
            {r.nameAr}
            {r.verified && (
              <svg width="26" height="26" viewBox="0 0 24 24" aria-label="منشأة موثَّقة">
                <path
                  d="M12 1l2.5 2.1 3.2-.7 1.1 3.1 3.1 1.1-.7 3.2L23.3 12l-2.1 2.5.7 3.2-3.1 1.1-1.1 3.1-3.2-.7L12 23.3l-2.5-2.1-3.2.7-1.1-3.1-3.1-1.1.7-3.2L.7 12l2.1-2.5-.7-3.2 3.1-1.1 1.1-3.1 3.2.7L12 1z"
                  fill="#1D9BF0"
                />
                <path d="m8.5 12.2 2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </h1>
          <p className="text-[15px] text-ink2 mt-1.5">
            {r.cuisines.map((c, i) => (
              <span key={c.cuisineId}>
                {i > 0 && " · "}
                <Link
                  href={`/${r.city.slug}/cuisine/${c.cuisine.slug}`}
                  className="hover:text-primary-500"
                >
                  {c.cuisine.nameAr}
                </Link>
              </span>
            ))}
            <span className="mx-2 text-hairline2">|</span>
            <span className="ltr-nums">{PRICE_BAND_SYMBOLS[r.priceBand]}</span>{" "}
            <span className="text-muted">
              ({PRICE_BAND_LABELS[r.priceBand]})
              {perPerson ? ` · للشخص ~${formatSyp(perPerson)}` : ""}
            </span>
            {r.neighborhood && (
              <>
                <span className="mx-2 text-hairline2">|</span>
                <Link
                  href={`/${r.city.slug}/neighborhood/${r.neighborhood.slug}`}
                  className="hover:text-primary-500"
                >
                  📍 {r.neighborhood.nameAr}
                </Link>
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <RatingPill value={r.avgRating} count={r.ratingCount} size="lg" showCount />
            <OpenStatus
              open={open}
              closeTime={open && today ? formatTime(today.close) : null}
            />
          </div>
        </div>

        {/* CTA column */}
        <div className="w-full sm:w-[280px] shrink-0 space-y-2.5">
          {r.phone && (
            <TrackedAction
              restaurantId={r.id}
              kind="call"
              href={`tel:${r.phone}`}
              className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-700 text-white rounded-xl py-3 font-bold shadow-accent transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              اتصل للحجز
            </TrackedAction>
          )}
          <div className="flex gap-2.5">
            {r.whatsapp && (
              <TrackedAction
                restaurantId={r.id}
                kind="whatsapp"
                href={`https://wa.me/${r.whatsapp.replace(/[^0-9]/g, "")}`}
                className="flex-1 text-center bg-white border border-hairline hover:border-success text-ink rounded-xl py-2.5 text-sm font-bold transition"
              >
                واتساب
              </TrackedAction>
            )}
            {r.lat && r.lng && (
              <TrackedAction
                restaurantId={r.id}
                kind="direction"
                href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}
                className="flex-1 text-center bg-white border border-hairline hover:border-primary-500 text-ink rounded-xl py-2.5 text-sm font-bold transition"
              >
                🧭 الاتجاهات
              </TrackedAction>
            )}
          </div>
        </div>
      </div>

      {/* Offers strip */}
      {r.offers.length > 0 && (
        <div className="mt-5 space-y-2">
          {r.offers.map((o) => (
            <div
              key={o.id}
              className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-primary-700">🔥 {o.titleAr}</div>
                {o.descAr && <div className="text-sm text-ink2 mt-0.5">{o.descAr}</div>}
              </div>
              <div className="text-[12px] text-muted shrink-0">
                حتى {formatDateAr(o.endsAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky tabs */}
      <div className="mt-6">
        <ProfileTabs />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-[30px] mt-7 items-start">
        {/* ===== Main column ===== */}
        <div className="space-y-7 min-w-0">
          {/* Overview */}
          <section id="overview" className="bg-white border border-hairline rounded-2xl p-6 scroll-mt-32">
            <h2 className="text-xl font-bold mb-3">نظرة عامة</h2>
            {r.description && (
              <p className="text-ink2 leading-relaxed">{r.description}</p>
            )}
            {r.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {r.features.map((f) => (
                  <span
                    key={f.featureId}
                    className="inline-flex items-center gap-1.5 bg-chipbg rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink2"
                  >
                    {f.feature.icon} {f.feature.nameAr}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Popular dishes — 4 per view, scroll/swipe for more */}
          {popularDishes.length > 0 && (
            <section className="bg-white border border-hairline rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">🔥 الأطباق الأكثر طلباً</h2>
              <Carousel
                arrowTopClass="top-[38%] -translate-y-1/2"
                itemClassName="w-[46%] sm:w-[calc((100%-3*0.875rem)/4)]"
                items={popularDishes.map((dish, i) => (
                  <div key={dish.id}>
                    <div
                      className="aspect-[4/3] rounded-2xl grid place-items-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${DISH_TINTS[i % DISH_TINTS.length]}, #fff)`,
                      }}
                    >
                      🍽
                    </div>
                    <div className="mt-2.5 px-0.5">
                      <div className="font-semibold text-[15px] leading-snug">
                        {dish.nameAr}
                      </div>
                      <div className="text-primary-700 font-bold text-sm mt-1 ltr-nums">
                        {formatSyp(dish.priceSyp)}
                      </div>
                    </div>
                  </div>
                ))}
              />
            </section>
          )}

          {/* Digital menu — photographed pages (3 per view, scroll for more) */}
          <section id="menu" className="bg-white border border-hairline rounded-2xl p-6 scroll-mt-32">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-xl font-bold">📖 القائمة الرقمية</h2>
              <span className="text-[12px] text-muted2">
                آخر تحديث: {formatRelativeAr(r.updatedAt)}
              </span>
            </div>

            {menuPages.length > 0 ? (
              <>
                <p className="text-[13px] text-muted mb-4">
                  صور القائمة الكاملة كما يقدّمها المطعم — اضغط على أي صفحة للتكبير
                </p>
                <MenuPages
                  pages={menuPages.map((p) => ({
                    url: p.url,
                    alt: p.alt,
                    label: p.alt !== r.nameAr ? p.alt : null,
                  }))}
                />
              </>
            ) : r.menuSections.length > 0 ? (
              <div className="space-y-6 mt-3">
                {r.menuSections.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-bold text-primary-700 border-b border-hairline pb-1.5 mb-3">
                      {section.nameAr}
                    </h3>
                    <ul className="space-y-2.5">
                      {section.items.map((item) => (
                        <li key={item.id} className="flex items-baseline gap-2">
                          <div>
                            <span className="font-semibold">
                              {item.nameAr}
                              {item.popular && (
                                <span className="ms-2 text-[11px] bg-ink text-featured rounded-full px-2 py-0.5">
                                  الأكثر طلباً
                                </span>
                              )}
                            </span>
                            {item.descAr && (
                              <p className="text-[13px] text-muted">{item.descAr}</p>
                            )}
                          </div>
                          <span className="flex-1 border-b border-dotted border-hairline2 mx-1" />
                          <span className="text-sm font-bold text-primary-700 shrink-0 ltr-nums">
                            {formatSyp(item.priceSyp)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted mt-2">لم تُضف القائمة بعد.</p>
            )}
          </section>

          {/* Reviews */}
          <section id="reviews" className="bg-white border border-hairline rounded-2xl p-6 scroll-mt-32">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">💬 التقييمات</h2>
              <a
                href="#write-review"
                className="bg-primary-500 hover:bg-primary-700 text-white rounded-xl px-4 py-2 text-sm font-bold transition"
              >
                اكتب تقييماً
              </a>
            </div>

            {/* Summary */}
            {r.ratingCount > 0 && (
              <div className="grid sm:grid-cols-[200px_1fr] gap-6 pb-6 border-b border-hairline mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-ink">{formatRating(r.avgRating)}</div>
                  <div className="mt-2">
                    <RatingStars value={r.avgRating} size="text-lg" />
                  </div>
                  <div className="text-[13px] text-muted mt-1">
                    {formatNum(r.ratingCount)} تقييم
                  </div>
                </div>
                <div className="space-y-2">
                  {dist.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3 text-[13px]">
                      <span className="w-8 text-muted whitespace-nowrap">
                        {formatNum(star)} <span className="text-star">★</span>
                      </span>
                      <span className="flex-1 h-2 bg-chipbg rounded-full overflow-hidden">
                        <span
                          className="block h-full bg-star rounded-full"
                          style={{ width: `${(count / maxDist) * 100}%` }}
                        />
                      </span>
                      <span className="w-8 text-muted2 text-end">{formatNum(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write review */}
            <div id="write-review" className="scroll-mt-40 mb-6">
              {session?.user ? (
                <>
                  {userReview && (
                    <p className="text-sm text-ink2 mb-3">
                      قيّمت هذا المكان سابقاً — إرسال تقييم جديد سيحل محل تقييمك
                      السابق بعد المراجعة.
                    </p>
                  )}
                  <ReviewForm restaurantId={r.id} />
                </>
              ) : (
                <p className="text-sm text-ink2 bg-chipbg/60 rounded-xl p-4">
                  <Link href="/login" className="text-primary-500 font-bold hover:underline">
                    سجّل الدخول
                  </Link>{" "}
                  لمشاركة تجربتك مع الآخرين.
                </p>
              )}
            </div>

            {/* List */}
            <div className="space-y-5">
              {r.reviews.length === 0 && (
                <p className="text-sm text-muted">كن أول من يقيّم هذا المكان!</p>
              )}
              {r.reviews.map((review) => {
                const initial = review.user.name?.trim()?.[0] ?? "؟";
                const color =
                  AVATAR_COLORS[
                    (review.user.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
                  ];
                return (
                  <article key={review.id} className="border-b border-hairline last:border-0 pb-5 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-full grid place-items-center text-white font-bold shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {initial}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{review.user.name}</div>
                        <div className="text-[12px] text-muted2">
                          {formatDateAr(review.createdAt)}
                        </div>
                      </div>
                      <RatingPill value={review.rating} count={1} />
                    </div>
                    <p className="text-[15px] text-ink2 leading-relaxed mt-3">
                      {review.text}
                    </p>
                    {review.ownerReply && (
                      <div className="mt-3 bg-page border-s-4 border-primary-300 rounded-lg p-3.5">
                        <div className="text-[12px] font-bold text-ink2 mb-1">
                          رد صاحب المكان
                        </div>
                        <p className="text-sm text-ink2">{review.ownerReply}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===== Sidebar ===== */}
        <aside id="info" className="space-y-5 lg:sticky lg:top-[130px] scroll-mt-32">
          {hours && (
            <div className="bg-white border border-hairline rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  أوقات العمل
                </h3>
                {open !== null && (
                  <span
                    className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${
                      open ? "bg-success-tint text-success" : "bg-chipbg text-warn"
                    }`}
                  >
                    {open ? "مفتوح الآن" : "مغلق"}
                  </span>
                )}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {DAY_NAMES_AR.map((day, i) => {
                    const h = hours[String(i)];
                    const isToday = i === todayIdx;
                    return (
                      <tr
                        key={i}
                        className={`border-b border-hairline/60 last:border-0 ${isToday ? "font-bold text-ink" : "text-ink2"}`}
                      >
                        <td className="py-1.5">{day}{isToday && " (اليوم)"}</td>
                        <td className="py-1.5 text-end">
                          {h ? `${formatTime(h.open)} – ${formatTime(h.close)}` : "مغلق"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {r.lat && r.lng && (
            <div className="bg-white border border-hairline rounded-2xl p-5">
              <h3 className="font-bold mb-3">الموقع</h3>
              <MapView markers={[{ lat: r.lat, lng: r.lng, name: r.nameAr }]} className="h-44" />
              {r.address && <p className="text-[13px] text-ink2 mt-3">📍 {r.address}</p>}
              <TrackedAction
                restaurantId={r.id}
                kind="direction"
                href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}
                className="block text-center mt-3 bg-chipbg hover:bg-hairline text-ink rounded-xl py-2 text-sm font-bold transition"
              >
                احصل على الاتجاهات
              </TrackedAction>
            </div>
          )}

          {(r.phone || r.website || r.instagram) && (
            <div className="bg-white border border-hairline rounded-2xl p-5 space-y-2.5 text-sm">
              <h3 className="font-bold mb-1">التواصل</h3>
              {r.phone && (
                <p className="text-ink2 ltr-nums" dir="ltr">☎ {r.phone}</p>
              )}
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener" className="block text-primary-500 hover:underline truncate ltr-nums" dir="ltr">
                  {r.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {r.instagram && (
                <a href={r.instagram} target="_blank" rel="noopener" className="block text-primary-500 hover:underline truncate ltr-nums" dir="ltr">
                  @{r.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")}
                </a>
              )}
            </div>
          )}

          {sidebarSponsor && (
            <a
              href={sidebarSponsor.linkUrl ?? "#"}
              target="_blank"
              rel="noopener sponsored"
              className="relative block rounded-2xl bg-gradient-to-bl from-ink to-primary-900 text-white p-5"
            >
              <span className="absolute top-3 start-3 bg-white/15 text-white/80 text-[10px] rounded-full px-2 py-0.5">
                إعلان
              </span>
              <span className="block pt-4 font-bold">{sidebarSponsor.name}</span>
              <span className="inline-block mt-3 bg-primary-500 rounded-lg px-4 py-1.5 text-sm font-bold">
                جرّب الآن
              </span>
            </a>
          )}
        </aside>
      </div>

      {/* Similar places */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[24px] font-bold mb-5">أماكن مشابهة قد تعجبك</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <RestaurantCard
                key={s.id}
                restaurant={s}
                variant="compact"
                saved={similarSaved.has(s.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
