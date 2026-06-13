import Image from "next/image";
import Link from "next/link";
import type { RestaurantCardData } from "@/lib/queries";
import {
  PRICE_BAND_SYMBOLS,
  formatNum,
  isOpenNow,
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
  variant = "full",
}: {
  restaurant: RestaurantCardData;
  sponsored?: boolean;
  featured?: boolean;
  saved?: boolean;
  dark?: boolean;
  /** "full" = listing card (tag chips + status meta row); "compact" = homepage/similar (status pill on image). */
  variant?: "full" | "compact";
}) {
  const photo = restaurant.photos[0];
  const offer = restaurant.offers[0];
  const hours = restaurant.openingHours as OpeningHours | null;
  const open = isOpenNow(hours);
  const href = `/${restaurant.city.slug}/restaurant/${restaurant.slug}`;
  const compact = variant === "compact";

  return (
    <article
      className={`group flex flex-col h-full rounded-2xl overflow-hidden border transition duration-150 hover:-translate-y-1 hover:shadow-card ${
        dark
          ? "bg-white/5 border-white/10"
          : "bg-white border-hairline hover:border-hairline2"
      }`}
    >
      <Link href={href} className="flex flex-col h-full">
        <div className={`relative ${compact ? "aspect-[15/8]" : "aspect-[3/2]"} bg-chipbg`}>
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

          {compact && open !== null && (
            <span
              className={`absolute bottom-2.5 start-2.5 text-[11px] font-bold rounded-full px-2.5 py-0.5 ${
                open ? "bg-success-tint text-success" : "bg-white/90 text-warn"
              }`}
            >
              {open ? "مفتوح" : "مغلق"}
            </span>
          )}

          {!compact && offer && (
            <span className="absolute bottom-2.5 start-2.5 max-w-[72%] inline-flex items-center gap-1.5 bg-primary-600 text-white text-[12px] font-bold rounded-full ps-2.5 pe-3 py-1 shadow-accent">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82Z" />
                <path d="M7 7h.01" />
              </svg>
              <span className="line-clamp-1">{offer.titleAr}</span>
            </span>
          )}
        </div>

        <div className="p-3.5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-[17px] leading-snug line-clamp-1 group-hover:text-primary-500 transition-colors ${
                dark ? "text-white" : "text-ink"
              }`}
            >
              {restaurant.nameAr}
            </h3>
            <span className="inline-flex items-center gap-1 shrink-0">
              <RatingPill value={restaurant.avgRating} count={restaurant.ratingCount} />
              {!compact && restaurant.ratingCount > 0 && (
                <span className={`text-[12px] ${dark ? "text-white/50" : "text-muted2"}`}>
                  ({formatNum(restaurant.ratingCount)})
                </span>
              )}
            </span>
          </div>

          <p className={`flex items-center gap-x-1.5 text-[13px] mt-0.5 ${dark ? "text-white/60" : "text-muted"}`}>
            <span className="truncate min-w-0">
              {restaurant.cuisines.map((c) => c.cuisine.nameAr).join(" · ")}
            </span>
            <span className="shrink-0" aria-hidden>·</span>
            <span className="ltr-nums shrink-0" dir="ltr">
              {PRICE_BAND_SYMBOLS[restaurant.priceBand]}
            </span>
            {!compact && (
              <>
                <span className="shrink-0" aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5 shrink-0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {restaurant.neighborhood?.nameAr ?? restaurant.city.nameAr}
                </span>
              </>
            )}
          </p>

          {!compact && restaurant.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {restaurant.features.slice(0, 3).map((f) => (
                <span
                  key={f.featureId}
                  className={`text-[12px] rounded-full px-2.5 py-0.5 ${
                    dark ? "bg-white/10 text-white/70" : "bg-chipbg text-ink2"
                  }`}
                >
                  {f.feature.nameAr}
                </span>
              ))}
            </div>
          )}

          {compact && (
            <div className={`flex items-center justify-between gap-2 mt-auto pt-2 text-[12px] ${dark ? "text-white/50" : "text-muted2"}`}>
              <span className="inline-flex items-center gap-1 line-clamp-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {restaurant.neighborhood?.nameAr ?? restaurant.city.nameAr}
              </span>
              {restaurant.ratingCount > 0 && (
                <span className="whitespace-nowrap">
                  {formatNum(restaurant.ratingCount)} تقييم
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
