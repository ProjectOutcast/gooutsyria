import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Typeahead suggestions for the search bar: matching restaurants with a photo,
 * cuisine/neighborhood and rating. Scoped to a city when `city` is provided. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const city = (req.nextUrl.searchParams.get("city") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const rows = await db.restaurant.findMany({
    where: {
      status: "APPROVED",
      ...(city ? { city: { slug: city } } : {}),
      OR: [
        { nameAr: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
        { cuisines: { some: { cuisine: { nameAr: { contains: q } } } } },
      ],
    },
    select: {
      slug: true,
      nameAr: true,
      avgRating: true,
      ratingCount: true,
      city: { select: { slug: true } },
      neighborhood: { select: { nameAr: true } },
      cuisines: { select: { cuisine: { select: { nameAr: true } } }, take: 1 },
      photos: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: [{ avgRating: "desc" }, { ratingCount: "desc" }],
    take: 6,
  });

  const results = rows.map((r) => ({
    slug: r.slug,
    citySlug: r.city.slug,
    nameAr: r.nameAr,
    cuisineAr: r.cuisines[0]?.cuisine.nameAr ?? null,
    neighborhoodAr: r.neighborhood?.nameAr ?? null,
    photoUrl: r.photos[0]?.url ?? null,
    avgRating: r.avgRating,
    ratingCount: r.ratingCount,
  }));

  return NextResponse.json({ results });
}
