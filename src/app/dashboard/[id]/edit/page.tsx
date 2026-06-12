import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import { EditProfileForm } from "@/components/EditProfileForm";
import type { OpeningHours } from "@/lib/format";

export const metadata = { title: "تعديل البيانات" };

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { restaurant } = await requireRestaurantOwnership(id);

  const [neighborhoods, cuisines, features, links] = await Promise.all([
    db.neighborhood.findMany({
      where: { cityId: restaurant.cityId },
      orderBy: { nameAr: "asc" },
    }),
    db.cuisine.findMany({ orderBy: { nameAr: "asc" } }),
    db.feature.findMany({ orderBy: { nameAr: "asc" } }),
    db.restaurant.findUnique({
      where: { id },
      select: {
        cuisines: { select: { cuisineId: true } },
        features: { select: { featureId: true } },
      },
    }),
  ]);

  return (
    <EditProfileForm
      restaurant={restaurant}
      neighborhoods={neighborhoods}
      cuisines={cuisines}
      features={features}
      selectedCuisines={links?.cuisines.map((c) => c.cuisineId) ?? []}
      selectedFeatures={links?.features.map((f) => f.featureId) ?? []}
      openingHours={(restaurant.openingHours as OpeningHours | null) ?? {}}
    />
  );
}
