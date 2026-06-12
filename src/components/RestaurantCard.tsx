import Image from "next/image";
import Link from "next/link";
import type { RestaurantCardData } from "@/lib/queries";
import { PRICE_BAND_SYMBOLS } from "@/lib/format";
import { RatingBadge } from "./RatingStars";

export function RestaurantCard({
  restaurant,
  sponsored = false,
}: {
  restaurant: RestaurantCardData;
  sponsored?: boolean;
}) {
  const photo = restaurant.photos[0];
  const href = `/${restaurant.city.slug}/restaurant/${restaurant.slug}`;
  return (
    <Link
      href={href}
      className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-stone-100">
        {photo ? (
          <Image
            src={photo.url}
            alt={photo.alt ?? restaurant.nameAr}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-stone-300">
            🍽
          </div>
        )}
        {sponsored && (
          <span className="absolute top-2 start-2 bg-stone-900/75 text-white text-[11px] rounded-full px-2 py-0.5">
            مُموَّل
          </span>
        )}
        {restaurant.verified && (
          <span
            className="absolute top-2 end-2 bg-white/90 text-green-700 text-[11px] font-semibold rounded-full px-2 py-0.5"
            title="منشأة موثَّقة"
          >
            ✓ موثَّق
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-stone-900 group-hover:text-primary-700 transition-colors line-clamp-1">
            {restaurant.nameAr}
          </h3>
          <span className="text-xs text-stone-500 shrink-0 ltr-nums">
            {PRICE_BAND_SYMBOLS[restaurant.priceBand]}
          </span>
        </div>
        <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
          {restaurant.cuisines.map((c) => c.cuisine.nameAr).join(" · ")}
          {restaurant.neighborhood ? ` — ${restaurant.neighborhood.nameAr}` : ""}
        </p>
        <div className="mt-2">
          <RatingBadge value={restaurant.avgRating} count={restaurant.ratingCount} />
        </div>
      </div>
    </Link>
  );
}
