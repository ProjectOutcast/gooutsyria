import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [restaurants, collections, cuisines, neighborhoods, cities] =
    await Promise.all([
      db.restaurant.findMany({
        where: { status: "APPROVED" },
        select: { slug: true, updatedAt: true, city: { select: { slug: true } } },
      }),
      db.collection.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, city: { select: { slug: true } } },
      }),
      db.cuisine.findMany({ select: { slug: true } }),
      db.neighborhood.findMany({
        select: { slug: true, city: { select: { slug: true } } },
      }),
      db.city.findMany({ where: { active: true }, select: { slug: true } }),
    ]);

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/for-restaurants`, changeFrequency: "monthly", priority: 0.5 },
    ...cities.flatMap((c) => [
      {
        url: `${siteUrl}/${c.slug}/restaurants`,
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${siteUrl}/${c.slug}/collections`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${siteUrl}/${c.slug}/offers`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]),
    ...cuisines.flatMap((cu) =>
      cities.map((c) => ({
        url: `${siteUrl}/${c.slug}/cuisine/${cu.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
    ),
    ...neighborhoods.map((n) => ({
      url: `${siteUrl}/${n.city.slug}/neighborhood/${n.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...restaurants.map((r) => ({
      url: `${siteUrl}/${r.city.slug}/restaurant/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...collections.map((col) => ({
      url: `${siteUrl}/${col.city.slug}/collections/${col.slug}`,
      lastModified: col.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
