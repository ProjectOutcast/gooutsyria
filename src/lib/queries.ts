import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import type { PriceBand } from "@/generated/prisma/enums";
import { isOpenNow, type OpeningHours } from "./format";

export const RESTAURANT_CARD_INCLUDE = {
  photos: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  cuisines: { include: { cuisine: true } },
  neighborhood: true,
  city: true,
} satisfies Prisma.RestaurantInclude;

export type RestaurantCardData = Prisma.RestaurantGetPayload<{
  include: typeof RESTAURANT_CARD_INCLUDE;
}>;

export type SearchFilters = {
  q?: string;
  cuisine?: string;
  neighborhood?: string;
  price?: PriceBand;
  features?: string[];
  open?: boolean;
  sort?: "rating" | "newest" | "popular";
  page?: number;
};

export const PAGE_SIZE = 12;

export async function searchRestaurants(citySlug: string, f: SearchFilters) {
  const where: Prisma.RestaurantWhereInput = {
    status: "APPROVED",
    city: { slug: citySlug },
  };
  if (f.q) {
    where.OR = [
      { nameAr: { contains: f.q, mode: "insensitive" } },
      { nameEn: { contains: f.q, mode: "insensitive" } },
      { description: { contains: f.q, mode: "insensitive" } },
    ];
  }
  if (f.cuisine) where.cuisines = { some: { cuisine: { slug: f.cuisine } } };
  if (f.neighborhood) where.neighborhood = { slug: f.neighborhood };
  if (f.price) where.priceBand = f.price;
  if (f.features?.length) {
    where.AND = f.features.map((slug) => ({
      features: { some: { feature: { slug } } },
    }));
  }

  const orderBy: Prisma.RestaurantOrderByWithRelationInput =
    f.sort === "newest"
      ? { createdAt: "desc" }
      : f.sort === "popular"
        ? { viewCount: "desc" }
        : { avgRating: "desc" };

  const page = Math.max(1, f.page ?? 1);

  if (f.open) {
    // open-now depends on JSON opening hours — filter in JS over a bounded set
    const rows = await db.restaurant.findMany({
      where,
      orderBy,
      include: RESTAURANT_CARD_INCLUDE,
      take: 200,
    });
    const openRows = rows.filter((r) =>
      isOpenNow(r.openingHours as OpeningHours | null)
    );
    return {
      restaurants: openRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      total: openRows.length,
      page,
    };
  }

  const [restaurants, total] = await Promise.all([
    db.restaurant.findMany({
      where,
      orderBy,
      include: RESTAURANT_CARD_INCLUDE,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.restaurant.count({ where }),
  ]);
  return { restaurants, total, page };
}

export async function getFeaturedRestaurants(
  slot: "HOME" | "SEARCH" | "CUISINE",
  opts: { cuisineSlug?: string; take?: number } = {}
) {
  const now = new Date();
  const placements = await db.featuredPlacement.findMany({
    where: {
      slot,
      startsAt: { lte: now },
      endsAt: { gte: now },
      restaurant: { status: "APPROVED" },
      ...(opts.cuisineSlug ? { cuisine: { slug: opts.cuisineSlug } } : {}),
    },
    include: { restaurant: { include: RESTAURANT_CARD_INCLUDE } },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 8,
  });
  // de-dupe restaurants that have multiple active placements
  const seen = new Set<string>();
  return placements
    .filter((p) => {
      if (seen.has(p.restaurantId)) return false;
      seen.add(p.restaurantId);
      return true;
    })
    .map((p) => p.restaurant);
}

export async function getActiveOffers(citySlug: string, take = 12) {
  const now = new Date();
  return db.offer.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
      restaurant: { status: "APPROVED", city: { slug: citySlug } },
    },
    include: { restaurant: { include: RESTAURANT_CARD_INCLUDE } },
    orderBy: { endsAt: "asc" },
    take,
  });
}

export async function getPublishedCollections(citySlug: string, take?: number) {
  return db.collection.findMany({
    where: { published: true, city: { slug: citySlug } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { items: true } } },
    ...(take ? { take } : {}),
  });
}

export async function getActiveSponsor(
  placement: "HOME_BANNER" | "SEARCH_BANNER",
) {
  const now = new Date();
  return db.sponsorSlot.findFirst({
    where: {
      placement,
      active: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCity(slug: string) {
  return db.city.findUnique({ where: { slug } });
}
