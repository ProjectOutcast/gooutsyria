import Image from "next/image";
import Link from "next/link";
import type { RestaurantCardData } from "@/lib/queries";
import {
  PRICE_BAND_SYMBOLS,
  formatNum,
  isOpenNow,
  nextOpening,
  type OpeningHours,
} from "@/lib/format";
import { RatingPill } from "./RatingStars";
import { BookmarkButton } from "./BookmarkButton";

export function RestaurantCard({
  restaurant,
  sponsored = false,
  featured = false,
  saved = false,
  dark = false,
}: {
  restaurant: RestaurantCardData;
  sponsored?: boolean;
  featured?: boolean;
  saved?: boolean;
  dark?: boolean;
}) {
  const photo = restaurant.photos[0];
  const offer = restaurant.offers[0];
  const hours = restaurant.openingHours as OpeningHours | null;
  const open = isOpenNow(hours);
  const opensAt = open === false ? nextOpening(hours) : null;
  const href = `/${restaurant.city.slug}/restaurant/${restaurant.slug}`;

  return (
    <article
      className={`group rounded-2xl overflow-hidden border transition duration-150 hover:-translate-y-1 hover:shadow-card ${
        dark
          ? "bg-white/5 border-white/10"
          : "bg-white border-hairline hover:border-hairline2"
      }`}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[15/8] bg-chipbg">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt ?? restaurant.nameAr}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-4xl opacity-30">
              🍽
            </div>
          )}

          {(featured || sponsored) && (
            <span
              className={`absolute top-2.5 start-2.5 text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                featured ? "bg-ink text-featured" : "bg-ink/80 text-white"
              }`}
            >
              {featured ? "✦ مميّز" : "مموّل"}
            </span>
          )}

          <span className="absolute bottom-2.5 end-2.5">
            <BookmarkButton restaurantId={restaurant.id} initialSaved={saved} />
          </span>
        </div>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-[17px] leading-snug line-clamp-1 group-hover:text-primary-500 transition-colors ${
                dark ? "text-white" : "text-ink"
              }`}
            >
              {restaurant.nameAr}
            </h3>
            <RatingPill value={restaurant.avgRating} count={restaurant.ratingCount} />
          </div>

          <p className={`text-[13px] mt-0.5 line-clamp-1 ${dark ? "text-white/60" : "text-muted"}`}>
            {restaurant.cuisines.map((c) => c.cuisine.nameAr).join(" · ")}
            <span className="ltr-nums mx-1">
              · {PRICE_BAND_SYMBOLS[restaurant.priceBand]}
            </span>
          </p>

          {(restaurant.features.length > 0 || offer) && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {restaurant.features.slice(0, offer ? 2 : 3).map((f) => (
                <span
                  key={f.featureId}
                  className={`text-[12px] rounded-full px-2.5 py-0.5 ${
                    dark ? "bg-white/10 text-white/70" : "bg-chipbg text-ink2"
                  }`}
                >
                  {f.feature.nameAr}
                </span>
              ))}
              {offer && (
                <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-[12px] font-semibold rounded-full px-2.5 py-0.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m15 9-6 6M9 9h.01M15 15h.01" />
                  </svg>
                  <span className="line-clamp-1">{offer.titleAr}</span>
                </span>
              )}
            </div>
          )}

          <div className={`mt-3 pt-2.5 border-t text-[12px] ${dark ? "border-white/10" : "border-hairline/70"}`}>
            <span className={`inline-flex items-center gap-1 ${dark ? "text-white/50" : "text-muted2"}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {restaurant.neighborhood?.nameAr ?? restaurant.city.nameAr}
            </span>
            <span className="flex items-center justify-between gap-2 mt-1">
              {open !== null ? (
                <span
                  className={`inline-flex items-center gap-1.5 font-bold whitespace-nowrap ${
                    open ? "text-success" : "text-warn"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-success" : "bg-warn"}`} />
                  {open ? "مفتوح الآن" : opensAt ? `يفتح ${opensAt}` : "مغلق الآن"}
                </span>
              ) : (
                <span />
              )}
              {restaurant.ratingCount > 0 && (
                <span className={`whitespace-nowrap ${dark ? "text-white/50" : "text-muted2"}`}>
                  {formatNum(restaurant.ratingCount)} تقييم
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
