import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  formatSyp,
  formatDateAr,
  formatRating,
  isOpenNow,
  DAY_NAMES_AR,
  PRICE_BAND_LABELS,
  PRICE_BAND_SYMBOLS,
  type OpeningHours,
} from "@/lib/format";
import { RatingBadge, RatingStars } from "@/components/RatingStars";
import { TrackedAction } from "@/components/TrackedAction";
import { MapView } from "@/components/MapView";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string; slug: string }> };

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

function buildJsonLd(r: NonNullable<Awaited<ReturnType<typeof getRestaurant>>>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
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
    aggregateRating:
      r.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: formatRating(r.avgRating),
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

  const open = isOpenNow(r.openingHours as OpeningHours | null);
  const hours = r.openingHours as OpeningHours | null;
  const userReview = session?.user?.id
    ? await db.review.findUnique({
        where: {
          restaurantId_userId: { restaurantId: r.id, userId: session.user.id },
        },
      })
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(r)) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-4" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-700">الرئيسية</Link>
        {" / "}
        <Link href={`/${r.city.slug}/restaurants`} className="hover:text-primary-700">
          مطاعم {r.city.nameAr}
        </Link>
        {r.neighborhood && (
          <>
            {" / "}
            <Link
              href={`/${r.city.slug}/neighborhood/${r.neighborhood.slug}`}
              className="hover:text-primary-700"
            >
              {r.neighborhood.nameAr}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-stone-700">{r.nameAr}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {r.nameAr}
            {r.verified && (
              <span className="text-green-700 text-sm font-semibold bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                ✓ موثَّق
              </span>
            )}
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            {r.cuisines.map((c, i) => (
              <span key={c.cuisineId}>
                {i > 0 && " · "}
                <Link
                  href={`/${r.city.slug}/cuisine/${c.cuisine.slug}`}
                  className="hover:text-primary-700"
                >
                  {c.cuisine.nameAr}
                </Link>
              </span>
            ))}
            {r.neighborhood && <> — {r.neighborhood.nameAr}</>}
            <span className="mx-2 ltr-nums">{PRICE_BAND_SYMBOLS[r.priceBand]}</span>
            <span className="text-stone-400">({PRICE_BAND_LABELS[r.priceBand]})</span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <RatingBadge value={r.avgRating} count={r.ratingCount} />
            {open !== null && (
              <span
                className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                  open
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-stone-100 text-stone-500 border border-stone-200"
                }`}
              >
                {open ? "مفتوح الآن" : "مغلق الآن"}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {r.phone && (
            <TrackedAction
              restaurantId={r.id}
              kind="call"
              href={`tel:${r.phone}`}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-2 text-sm font-bold"
            >
              📞 اتصال
            </TrackedAction>
          )}
          {r.whatsapp && (
            <TrackedAction
              restaurantId={r.id}
              kind="whatsapp"
              href={`https://wa.me/${r.whatsapp.replace(/[^0-9]/g, "")}`}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-bold"
            >
              واتساب
            </TrackedAction>
          )}
          {r.lat && r.lng && (
            <TrackedAction
              restaurantId={r.id}
              kind="direction"
              href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}
              className="bg-white border border-stone-300 hover:border-primary-500 text-stone-800 rounded-xl px-4 py-2 text-sm font-bold"
            >
              🧭 الاتجاهات
            </TrackedAction>
          )}
        </div>
      </div>

      {/* Photos */}
      {r.photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
          {r.photos.slice(0, 8).map((p, i) => (
            <div
              key={p.id}
              className={`relative rounded-xl overflow-hidden bg-stone-100 ${
                i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={p.url}
                alt={p.alt ?? r.nameAr}
                fill
                sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Offers */}
      {r.offers.length > 0 && (
        <div className="mt-6 space-y-2">
          {r.offers.map((o) => (
            <div
              key={o.id}
              className="bg-accent-100/60 border border-accent-500/40 rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-accent-700">🔥 {o.titleAr}</div>
                {o.descAr && (
                  <div className="text-sm text-stone-600 mt-0.5">{o.descAr}</div>
                )}
              </div>
              <div className="text-xs text-stone-500 shrink-0">
                حتى {formatDateAr(o.endsAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-10">
          {r.description && (
            <section>
              <h2 className="text-lg font-bold mb-2">عن المكان</h2>
              <p className="text-stone-700 leading-relaxed">{r.description}</p>
            </section>
          )}

          {/* Menu */}
          {r.menuSections.length > 0 && (
            <section id="menu">
              <h2 className="text-lg font-bold mb-3">قائمة الطعام</h2>
              <div className="space-y-6">
                {r.menuSections.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-bold text-primary-700 border-b border-stone-200 pb-1.5 mb-3">
                      {section.nameAr}
                    </h3>
                    <ul className="space-y-2.5">
                      {section.items.map((item) => (
                        <li key={item.id} className="flex items-baseline gap-2">
                          <div>
                            <span className="font-semibold">
                              {item.nameAr}
                              {item.popular && (
                                <span className="ms-2 text-[11px] bg-amber-100 text-amber-800 rounded-full px-1.5 py-0.5">
                                  الأكثر طلباً
                                </span>
                              )}
                            </span>
                            {item.descAr && (
                              <p className="text-xs text-stone-500">{item.descAr}</p>
                            )}
                          </div>
                          <span className="flex-1 border-b border-dotted border-stone-300 mx-1" />
                          <span className="text-sm font-bold text-stone-700 shrink-0 ltr-nums">
                            {formatSyp(item.priceSyp)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section id="reviews">
            <h2 className="text-lg font-bold mb-3">
              التقييمات ({r.ratingCount})
            </h2>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6">
              {session?.user ? (
                userReview ? (
                  <p className="text-sm text-stone-600">
                    قيّمت هذا المكان سابقاً — يمكنك إرسال تقييم جديد ليحل محل
                    تقييمك السابق بعد المراجعة.
                  </p>
                ) : null
              ) : (
                <p className="text-sm text-stone-600 mb-3">
                  <Link href="/login" className="text-primary-700 font-semibold hover:underline">
                    سجّل الدخول
                  </Link>{" "}
                  لمشاركة تجربتك مع الآخرين
                </p>
              )}
              {session?.user && <ReviewForm restaurantId={r.id} />}
            </div>

            <div className="space-y-4">
              {r.reviews.length === 0 && (
                <p className="text-sm text-stone-500">
                  كن أول من يقيّم هذا المكان!
                </p>
              )}
              {r.reviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-white border border-stone-200 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{review.user.name}</div>
                    <div className="text-xs text-stone-400">
                      {formatDateAr(review.createdAt)}
                    </div>
                  </div>
                  <div className="mt-1">
                    <RatingStars value={review.rating} />
                  </div>
                  <p className="text-sm text-stone-700 mt-2 leading-relaxed">
                    {review.text}
                  </p>
                  {review.ownerReply && (
                    <div className="mt-3 bg-stone-50 border-s-4 border-primary-300 rounded-lg p-3">
                      <div className="text-xs font-bold text-stone-600 mb-1">
                        رد صاحب المكان
                      </div>
                      <p className="text-sm text-stone-700">{review.ownerReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Side column */}
        <aside className="space-y-6">
          {r.lat && r.lng && <MapView lat={r.lat} lng={r.lng} name={r.nameAr} />}

          <div className="bg-white border border-stone-200 rounded-2xl p-4 text-sm space-y-2">
            <h3 className="font-bold mb-2">معلومات</h3>
            {r.address && <p className="text-stone-600">📍 {r.address}</p>}
            {r.phone && (
              <p className="text-stone-600 ltr-nums" dir="ltr">
                ☎ {r.phone}
              </p>
            )}
            {r.website && (
              <a
                href={r.website}
                target="_blank"
                rel="noopener"
                className="block text-primary-700 hover:underline truncate"
              >
                الموقع الإلكتروني
              </a>
            )}
            {r.instagram && (
              <a
                href={r.instagram}
                target="_blank"
                rel="noopener"
                className="block text-primary-700 hover:underline"
              >
                إنستغرام
              </a>
            )}
            {r.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {r.features.map((f) => (
                  <span
                    key={f.featureId}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-full px-2 py-0.5"
                  >
                    {f.feature.icon} {f.feature.nameAr}
                  </span>
                ))}
              </div>
            )}
          </div>

          {hours && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-sm">
              <h3 className="font-bold mb-2">أوقات الدوام</h3>
              <table className="w-full">
                <tbody>
                  {DAY_NAMES_AR.map((day, i) => {
                    const h = hours[String(i)];
                    return (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        <td className="py-1.5 text-stone-600">{day}</td>
                        <td className="py-1.5 text-end ltr-nums">
                          {h ? `${h.open} – ${h.close}` : "مغلق"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
