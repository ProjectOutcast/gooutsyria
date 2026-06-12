import Link from "next/link";
import { requireRestaurantOwnership } from "@/lib/guards";

const TABS = [
  ["", "نظرة عامة"],
  ["/edit", "تعديل البيانات"],
  ["/menu", "قائمة الطعام"],
  ["/photos", "الصور"],
  ["/offers", "العروض"],
  ["/reviews", "التقييمات"],
] as const;

export default async function RestaurantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { restaurant } = await requireRestaurantOwnership(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold">{restaurant.nameAr}</h1>
        {restaurant.status === "APPROVED" && (
          <Link
            href={`/damascus/restaurant/${restaurant.slug}`}
            className="text-sm text-primary-700 font-semibold hover:underline"
          >
            عرض الصفحة العامة ←
          </Link>
        )}
      </div>
      <nav className="flex gap-1 overflow-x-auto scrollbar-none border-b border-stone-200 mt-4 mb-6">
        {TABS.map(([suffix, label]) => (
          <Link
            key={suffix}
            href={`/dashboard/${id}${suffix}`}
            className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-primary-700 whitespace-nowrap"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
