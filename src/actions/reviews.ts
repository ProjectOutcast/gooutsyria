"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  restaurantId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, "الرجاء كتابة 10 أحرف على الأقل").max(2000),
});

export type ReviewFormState = { ok?: boolean; error?: string };

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول لكتابة تقييم" };
  }

  const parsed = reviewSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const { restaurantId, rating, text } = parsed.data;

  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true, city: { select: { slug: true } }, ownerId: true },
  });
  if (!restaurant) return { error: "المطعم غير موجود" };
  if (restaurant.ownerId === session.user.id) {
    return { error: "لا يمكنك تقييم مطعمك الخاص" };
  }

  // one review per user per restaurant — resubmitting updates it (goes back to moderation)
  await db.review.upsert({
    where: {
      restaurantId_userId: { restaurantId, userId: session.user.id },
    },
    update: { rating, text, status: "PENDING" },
    create: { restaurantId, userId: session.user.id, rating, text },
  });

  revalidatePath(`/${restaurant.city.slug}/restaurant/${restaurant.slug}`);
  return { ok: true };
}

/** Recomputes the cached average from APPROVED reviews. Called after moderation. */
export async function recomputeRating(restaurantId: string) {
  const agg = await db.review.aggregate({
    where: { restaurantId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await db.restaurant.update({
    where: { id: restaurantId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });
}
