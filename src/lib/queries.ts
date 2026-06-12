import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import type { PriceBand, SponsorPlacement } from "@/generated/prisma/enums";
import { isOpenNow, type OpeningHours } from "./format";

export const RESTAURANT_CARD_INCLUDE = {
  photos: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  cuisines: { include: { cuisine: true } },
  features: { include: { feature: true }, take: 3 },
  neighborhood: true,
  city: true,
  offers: {
    where: {
      active: true,
      startsAt: { lte: new Date() },
      endsAt: { gte: new Date() },
    },
    orderBy: { endsAt: "asc" as const },
    take: 1,
  },
} satisfies Prisma.RestaurantInclude;

export type RestaurantCardData = Prisma.RestaurantGetPayload<{
  include: typeof RESTAURANT_CARD_INCLUDE;
}>;

export type SearchFilters = {
  q?: string;
  cuisines?: string[];
  neighborhood?: string;
  prices?: PriceBand[];
  features?: string[];
  minRating?: number;
  open?: boolean;
  sort?: "relevance" | "rating" | "newest" | "popular";
  page?: number;
};

export const PAGE_SIZE = 12;

function buildWhere(citySlug: string, f: SearchFilters): Prisma.RestaurantWhereInput {
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
  if (f.cuisines?.length) {
    where.cuisines = { some: { cuisine: { slug: { in: f.cuisines } } } };
  }
  if (f.neighborhood) where.neighborhood = { slug: f.neighborhood };
  if (f.prices?.length) where.priceBand = { in: f.prices };
  if (f.minRating) where.avgRating = { gte: f.minRating };
  if (f.features?.length) {
    where.AND = f.features.map((slug) => ({
      features: { some: { feature: { slug } } },
    }));
  }
  return where;
}

export async function searchRestaurants(citySlug: string, f: SearchFilters) {
  const where = buildWhere(citySlug, f);

  const orderBy: Prisma.RestaurantOrderByWithRelationInput[] =
    f.sort === "newest"
      ? [{ createdAt: "desc" }]
      : f.sort === "popular"
        ? [{ viewCount: "desc" }]
        : [{ avgRating: "desc" }, { ratingCount: "desc" }];

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

export async function getFacets() {
  const [features, cuisines] = await Promise.all([
    db.feature.findMany({
      orderBy: { nameAr: "asc" },
      include: {
        _count: {
          select: {
            restaurants: { where: { restaurant: { status: "APPROVED" } } },
          },
        },
      },
    }),
    db.cuisine.findMany({
      orderBy: { nameAr: "asc" },
      include: {
        _count: {
          select: {
            restaurants: { where: { restaurant: { status: "APPROVED" } } },
          },
        },
      },
    }),
  ]);
  return { features, cuisines };
}

export async function getSavedIds(
  userId: string | undefined,
  restaurantIds: string[]
): Promise<Set<string>> {
  if (!userId || restaurantIds.length === 0) return new Set();
  const rows = await db.savedPlace.findMany({
    where: { userId, restaurantId: { in: restaurantIds } },
    select: { restaurantId: true },
  });
  return new Set(rows.map((r) => r.restaurantId));
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

export async function getActiveSponsor(placement: SponsorPlacement) {
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
