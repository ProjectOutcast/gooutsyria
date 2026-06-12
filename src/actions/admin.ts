"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { uniqueSlug, slugify } from "@/lib/slug";
import { recomputeRating } from "./reviews";
import type {
  ListingStatus,
  PlanTier,
  Role,
  FeaturedSlot,
  SponsorPlacement,
} from "@/generated/prisma/enums";

// --- Restaurants ---

export async function setRestaurantStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ListingStatus;
  if (!["PENDING", "APPROVED", "REJECTED", "ARCHIVED"].includes(status)) return;

  const restaurant = await db.restaurant.update({
    where: { id },
    data: { status },
  });
  // first approval upgrades the submitting user to OWNER
  if (status === "APPROVED" && restaurant.ownerId) {
    await db.user.updateMany({
      where: { id: restaurant.ownerId, role: "USER" },
      data: { role: "OWNER" },
    });
  }
  revalidatePath("/admin/restaurants");
}

export async function toggleVerified(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const r = await db.restaurant.findUnique({ where: { id } });
  if (!r) return;
  await db.restaurant.update({ where: { id }, data: { verified: !r.verified } });
  revalidatePath("/admin/restaurants");
}

export async function setTier(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const tier = String(formData.get("tier") ?? "") as PlanTier;
  if (!["FREE", "PRO"].includes(tier)) return;
  await db.restaurant.update({ where: { id }, data: { tier } });
  revalidatePath("/admin/restaurants");
}

export async function deleteRestaurant(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.restaurant.delete({ where: { id } });
  revalidatePath("/admin/restaurants");
}

// --- Claims ---

export async function decideClaim(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.ownerClaim.findUnique({ where: { id } });
  if (!claim || claim.status !== "PENDING") return;

  await db.ownerClaim.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED", decidedAt: new Date() },
  });

  if (approve) {
    await db.restaurant.update({
      where: { id: claim.restaurantId },
      data: { ownerId: claim.userId },
    });
    await db.user.updateMany({
      where: { id: claim.userId, role: "USER" },
      data: { role: "OWNER" },
    });
    // close any other pending claims on the same restaurant
    await db.ownerClaim.updateMany({
      where: { restaurantId: claim.restaurantId, status: "PENDING" },
      data: { status: "REJECTED", decidedAt: new Date() },
    });
  }
  revalidatePath("/admin/claims");
}

// --- Reviews ---

export async function decideReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const review = await db.review.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });
  await recomputeRating(review.restaurantId);
  revalidatePath("/admin/reviews");
}

// --- Collections ---

export async function createCollection(formData: FormData) {
  await requireAdmin();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  if (titleAr.length < 3) return;
  const city = await db.city.findUnique({ where: { slug: "damascus" } });
  if (!city) return;

  const slug = await uniqueSlug(titleAr, async (s) =>
    Boolean(await db.collection.findUnique({ where: { slug: s } }))
  );
  await db.collection.create({
    data: {
      slug,
      titleAr,
      descAr: String(formData.get("descAr") ?? "").trim() || null,
      cityId: city.id,
    },
  });
  revalidatePath("/admin/collections");
}

export async function togglePublishCollection(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const col = await db.collection.findUnique({ where: { id } });
  if (!col) return;
  await db.collection.update({
    where: { id },
    data: { published: !col.published },
  });
  revalidatePath("/admin/collections");
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
}

export async function addCollectionItem(formData: FormData) {
  await requireAdmin();
  const collectionId = String(formData.get("collectionId") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  if (!collectionId || !restaurantId) return;
  const count = await db.collectionItem.count({ where: { collectionId } });
  try {
    await db.collectionItem.create({
      data: {
        collectionId,
        restaurantId,
        blurbAr: String(formData.get("blurbAr") ?? "").trim() || null,
        sortOrder: count,
      },
    });
  } catch {
    // duplicate — ignore
  }
  revalidatePath(`/admin/collections/${collectionId}`);
}

export async function removeCollectionItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const item = await db.collectionItem.delete({ where: { id } });
  revalidatePath(`/admin/collections/${item.collectionId}`);
}

// --- Featured placements ---

export async function createFeatured(formData: FormData) {
  await requireAdmin();
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const slot = String(formData.get("slot") ?? "") as FeaturedSlot;
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const endsAt = new Date(String(formData.get("endsAt") ?? ""));
  if (!restaurantId || !["HOME", "CUISINE", "SEARCH"].includes(slot)) return;
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return;

  await db.featuredPlacement.create({
    data: {
      restaurantId,
      slot,
      cuisineId: String(formData.get("cuisineId") ?? "") || null,
      startsAt,
      endsAt,
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath("/admin/featured");
}

export async function deleteFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.featuredPlacement.delete({ where: { id } });
  revalidatePath("/admin/featured");
}

// --- Sponsors ---

export async function createSponsor(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const placement = String(formData.get("placement") ?? "") as SponsorPlacement;
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const endsAt = new Date(String(formData.get("endsAt") ?? ""));
  if (!name || !["HOME_BANNER", "COLLECTION", "SEARCH_BANNER"].includes(placement))
    return;
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return;

  await db.sponsorSlot.create({
    data: {
      name,
      placement,
      linkUrl: String(formData.get("linkUrl") ?? "").trim() || null,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
      collectionId: String(formData.get("collectionId") ?? "") || null,
      startsAt,
      endsAt,
    },
  });
  revalidatePath("/admin/sponsors");
}

export async function toggleSponsor(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const s = await db.sponsorSlot.findUnique({ where: { id } });
  if (!s) return;
  await db.sponsorSlot.update({ where: { id }, data: { active: !s.active } });
  revalidatePath("/admin/sponsors");
}

export async function deleteSponsor(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db.sponsorSlot.delete({ where: { id } });
  revalidatePath("/admin/sponsors");
}

// --- Taxonomy ---

export async function addCuisine(formData: FormData) {
  await requireAdmin();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (!nameAr) return;
  await db.cuisine.create({
    data: {
      nameAr,
      slug: slugify(String(formData.get("slug") ?? "") || nameAr),
      icon: String(formData.get("icon") ?? "").trim() || null,
    },
  });
  revalidatePath("/admin/taxonomy");
}

export async function addFeature(formData: FormData) {
  await requireAdmin();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (!nameAr) return;
  await db.feature.create({
    data: {
      nameAr,
      slug: slugify(String(formData.get("slug") ?? "") || nameAr),
      icon: String(formData.get("icon") ?? "").trim() || null,
    },
  });
  revalidatePath("/admin/taxonomy");
}

export async function addNeighborhood(formData: FormData) {
  await requireAdmin();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (!nameAr) return;
  const city = await db.city.findUnique({ where: { slug: "damascus" } });
  if (!city) return;
  await db.neighborhood.create({
    data: {
      nameAr,
      slug: slugify(String(formData.get("slug") ?? "") || nameAr),
      cityId: city.id,
    },
  });
  revalidatePath("/admin/taxonomy");
}

// --- Users ---

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!["USER", "OWNER", "ADMIN"].includes(role)) return;
  if (id === admin.id) return; // don't demote yourself
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

// --- Demo data ---

export type DemoDataState = { ok?: boolean; error?: string; summary?: string };

export async function generateDemoData(): Promise<DemoDataState> {
  await requireAdmin();
  try {
    const { seedDemoData } = await import("@/lib/demo-seed");
    const result = await seedDemoData(db);
    revalidatePath("/", "layout");
    return {
      ok: true,
      summary: `تمت إضافة ${result.createdRestaurants} مطعماً و${result.createdCollections} قوائم مختارة (تم تخطي ${result.skippedRestaurants} موجود مسبقاً)`,
    };
  } catch (err) {
    console.error("demo data generation failed:", err);
    return { error: "فشل توليد البيانات التجريبية — راجع سجلات الخادم" };
  }
}
