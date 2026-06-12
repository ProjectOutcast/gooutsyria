"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireRestaurantOwnership } from "@/lib/guards";
import { uniqueSlug } from "@/lib/slug";
import type { PriceBand } from "@/generated/prisma/enums";

export type FormState = { ok?: boolean; error?: string };

const submissionSchema = z.object({
  nameAr: z.string().trim().min(2, "اسم المطعم مطلوب").max(100),
  phone: z.string().trim().min(8, "رقم الهاتف مطلوب").max(20),
  neighborhoodId: z.string().min(1, "اختر الحي"),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
});

export async function submitNewRestaurant(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" };

  const parsed = submissionSchema.safeParse({
    nameAr: formData.get("nameAr"),
    phone: formData.get("phone"),
    neighborhoodId: formData.get("neighborhoodId"),
    address: formData.get("address") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const neighborhood = await db.neighborhood.findUnique({
    where: { id: parsed.data.neighborhoodId },
  });
  if (!neighborhood) return { error: "الحي غير موجود" };

  const slug = await uniqueSlug(parsed.data.nameAr, async (s) =>
    Boolean(await db.restaurant.findUnique({ where: { slug: s } }))
  );

  await db.restaurant.create({
    data: {
      slug,
      nameAr: parsed.data.nameAr,
      phone: parsed.data.phone,
      address: parsed.data.address,
      description: parsed.data.description,
      cityId: neighborhood.cityId,
      neighborhoodId: neighborhood.id,
      ownerId: session.user.id,
      status: "PENDING",
    },
  });

  return { ok: true };
}

export async function claimRestaurant(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" };

  const restaurantId = String(formData.get("restaurantId") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!restaurantId || phone.length < 8) {
    return { error: "اختر المطعم وأدخل رقم هاتف صحيح" };
  }

  const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return { error: "المطعم غير موجود" };
  if (restaurant.ownerId) return { error: "هذه الصفحة مُدارة من مالكها بالفعل" };

  const existing = await db.ownerClaim.findFirst({
    where: { restaurantId, userId: session.user.id, status: "PENDING" },
  });
  if (existing) return { error: "لديك طلب ملكية قيد المراجعة لهذه الصفحة" };

  await db.ownerClaim.create({
    data: { restaurantId, userId: session.user.id, phone, message: message || null },
  });

  return { ok: true };
}

const HOURS_DAYS = ["0", "1", "2", "3", "4", "5", "6"] as const;
const PRICE_BANDS = ["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"];
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

export async function updateRestaurantProfile(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireRestaurantOwnership(restaurantId);

  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (nameAr.length < 2) return { error: "اسم المطعم مطلوب" };

  const priceBandRaw = String(formData.get("priceBand") ?? "MODERATE");
  const priceBand = (
    PRICE_BANDS.includes(priceBandRaw) ? priceBandRaw : "MODERATE"
  ) as PriceBand;

  const neighborhoodId = String(formData.get("neighborhoodId") ?? "") || null;
  const latRaw = String(formData.get("lat") ?? "").trim();
  const lngRaw = String(formData.get("lng") ?? "").trim();
  const lat = latRaw ? Number(latRaw) : null;
  const lng = lngRaw ? Number(lngRaw) : null;
  if ((lat !== null && Number.isNaN(lat)) || (lng !== null && Number.isNaN(lng))) {
    return { error: "إحداثيات الموقع غير صالحة" };
  }

  const openingHours: Record<string, { open: string; close: string } | null> = {};
  for (const d of HOURS_DAYS) {
    const open = String(formData.get(`open_${d}`) ?? "").trim();
    const close = String(formData.get(`close_${d}`) ?? "").trim();
    if (open && close && TIME_RE.test(open) && TIME_RE.test(close)) {
      openingHours[d] = { open, close };
    } else {
      openingHours[d] = null;
    }
  }

  const cuisineIds = formData.getAll("cuisineIds").map(String);
  const featureIds = formData.getAll("featureIds").map(String);

  const clean = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s || null;
  };

  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      nameAr,
      nameEn: clean(formData.get("nameEn")),
      description: clean(formData.get("description")),
      phone: clean(formData.get("phone")),
      whatsapp: clean(formData.get("whatsapp")),
      website: clean(formData.get("website")),
      instagram: clean(formData.get("instagram")),
      facebook: clean(formData.get("facebook")),
      address: clean(formData.get("address")),
      neighborhoodId,
      lat,
      lng,
      priceBand,
      openingHours,
      cuisines: {
        deleteMany: {},
        create: cuisineIds.map((cuisineId) => ({ cuisineId })),
      },
      features: {
        deleteMany: {},
        create: featureIds.map((featureId) => ({ featureId })),
      },
    },
  });

  revalidatePath(`/dashboard/${restaurant.id}`);
  return { ok: true };
}

// --- Menu management ---

export async function addMenuSection(formData: FormData) {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireRestaurantOwnership(restaurantId);
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (!nameAr) return;
  const count = await db.menuSection.count({ where: { restaurantId } });
  await db.menuSection.create({
    data: { restaurantId: restaurant.id, nameAr, sortOrder: count },
  });
  revalidatePath(`/dashboard/${restaurant.id}/menu`);
}

export async function deleteMenuSection(formData: FormData) {
  const sectionId = String(formData.get("sectionId") ?? "");
  const section = await db.menuSection.findUnique({ where: { id: sectionId } });
  if (!section) return;
  await requireRestaurantOwnership(section.restaurantId);
  await db.menuSection.delete({ where: { id: sectionId } });
  revalidatePath(`/dashboard/${section.restaurantId}/menu`);
}

export async function addMenuItem(formData: FormData) {
  const sectionId = String(formData.get("sectionId") ?? "");
  const section = await db.menuSection.findUnique({ where: { id: sectionId } });
  if (!section) return;
  await requireRestaurantOwnership(section.restaurantId);

  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const priceSyp = parseInt(String(formData.get("priceSyp") ?? ""), 10);
  if (!nameAr || !Number.isFinite(priceSyp) || priceSyp < 0) return;

  const count = await db.menuItem.count({ where: { sectionId } });
  await db.menuItem.create({
    data: {
      sectionId,
      nameAr,
      priceSyp,
      descAr: String(formData.get("descAr") ?? "").trim() || null,
      popular: formData.get("popular") === "on",
      sortOrder: count,
    },
  });
  revalidatePath(`/dashboard/${section.restaurantId}/menu`);
}

export async function deleteMenuItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const item = await db.menuItem.findUnique({
    where: { id: itemId },
    include: { section: true },
  });
  if (!item) return;
  await requireRestaurantOwnership(item.section.restaurantId);
  await db.menuItem.delete({ where: { id: itemId } });
  revalidatePath(`/dashboard/${item.section.restaurantId}/menu`);
}

// --- Offers ---

export async function createOffer(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireRestaurantOwnership(restaurantId);

  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const descAr = String(formData.get("descAr") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const endsAt = new Date(String(formData.get("endsAt") ?? ""));

  if (titleAr.length < 3) return { error: "عنوان العرض مطلوب" };
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "تواريخ غير صالحة" };
  }
  if (endsAt <= startsAt) return { error: "تاريخ الانتهاء يجب أن يكون بعد البداية" };

  // monetization gate: FREE tier = one active offer at a time
  if (restaurant.tier === "FREE") {
    const activeCount = await db.offer.count({
      where: { restaurantId, active: true, endsAt: { gte: new Date() } },
    });
    if (activeCount >= 1) {
      return {
        error: "الباقة المجانية تسمح بعرض واحد نشط — قم بالترقية إلى PRO لعروض غير محدودة",
      };
    }
  }

  await db.offer.create({
    data: { restaurantId, titleAr, descAr: descAr || null, startsAt, endsAt },
  });
  revalidatePath(`/dashboard/${restaurantId}/offers`);
  return { ok: true };
}

export async function toggleOffer(formData: FormData) {
  const offerId = String(formData.get("offerId") ?? "");
  const offer = await db.offer.findUnique({ where: { id: offerId } });
  if (!offer) return;
  await requireRestaurantOwnership(offer.restaurantId);
  await db.offer.update({
    where: { id: offerId },
    data: { active: !offer.active },
  });
  revalidatePath(`/dashboard/${offer.restaurantId}/offers`);
}

// --- Review replies ---

export async function replyToReview(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const reviewId = String(formData.get("reviewId") ?? "");
  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return { error: "التقييم غير موجود" };
  await requireRestaurantOwnership(review.restaurantId);

  const reply = String(formData.get("reply") ?? "").trim();
  if (reply.length < 2) return { error: "اكتب رداً أولاً" };

  await db.review.update({
    where: { id: reviewId },
    data: { ownerReply: reply, repliedAt: new Date() },
  });
  revalidatePath(`/dashboard/${review.restaurantId}/reviews`);
  return { ok: true };
}

export async function redirectToDashboard() {
  redirect("/dashboard");
}
