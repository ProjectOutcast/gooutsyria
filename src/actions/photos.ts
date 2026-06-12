"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRestaurantOwnership } from "@/lib/guards";
import { saveImage, deleteImage } from "@/lib/uploads";
import type { PhotoKind } from "@/generated/prisma/enums";
import type { FormState } from "./restaurants";

const KINDS = ["EXTERIOR", "INTERIOR", "FOOD", "MENU"];
const MAX_PHOTOS = 12;

export async function uploadPhoto(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireRestaurantOwnership(restaurantId);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "اختر صورة أولاً" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "الملف يجب أن يكون صورة" };
  }

  const count = await db.photo.count({ where: { restaurantId } });
  if (count >= MAX_PHOTOS) {
    return { error: `الحد الأقصى ${MAX_PHOTOS} صورة — احذف صورة قديمة أولاً` };
  }

  const kindRaw = String(formData.get("kind") ?? "FOOD");
  const kind = (KINDS.includes(kindRaw) ? kindRaw : "FOOD") as PhotoKind;

  let url: string;
  try {
    url = await saveImage(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "فشل رفع الصورة" };
  }

  await db.photo.create({
    data: {
      restaurantId: restaurant.id,
      url,
      kind,
      alt: restaurant.nameAr,
      sortOrder: count,
    },
  });

  revalidatePath(`/dashboard/${restaurantId}/photos`);
  return { ok: true };
}

export async function deletePhoto(formData: FormData) {
  const photoId = String(formData.get("photoId") ?? "");
  const photo = await db.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;
  await requireRestaurantOwnership(photo.restaurantId);

  await db.photo.delete({ where: { id: photoId } });
  if (photo.url.startsWith("/uploads/")) await deleteImage(photo.url);
  revalidatePath(`/dashboard/${photo.restaurantId}/photos`);
}
