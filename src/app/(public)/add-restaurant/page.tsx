import type { Metadata } from "next";
import { requireUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { getCurrentCity } from "@/lib/current-city";
import { AddRestaurantForms } from "@/components/AddRestaurantForms";

export const metadata: Metadata = {
  title: "أضف مطعمك",
  robots: { index: false },
};

export default async function AddRestaurantPage() {
  await requireUser();
  const city = await getCurrentCity();

  const [neighborhoods, claimable] = await Promise.all([
    db.neighborhood.findMany({
      where: { city: { slug: city } },
      orderBy: { nameAr: "asc" },
      select: { id: true, nameAr: true },
    }),
    db.restaurant.findMany({
      where: { ownerId: null, status: "APPROVED" },
      orderBy: { nameAr: "asc" },
      select: { id: true, nameAr: true },
    }),
  ]);

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">أضف مطعمك إلى Go Out Syria</h1>
      <p className="text-sm text-stone-500 mb-6">
        الإدراج مجاني — بعد مراجعة فريقنا وتوثيق ملكيتك تحصل على لوحة تحكم
        كاملة لصفحتك
      </p>
      <AddRestaurantForms neighborhoods={neighborhoods} claimable={claimable} />
    </div>
  );
}
