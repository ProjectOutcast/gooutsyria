import Link from "next/link";
import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import { formatRating } from "@/lib/format";

export const metadata = { title: "نظرة عامة" };

export default async function RestaurantOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { restaurant } = await requireRestaurantOwnership(id);

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const metrics = await db.metricDaily.findMany({
    where: { restaurantId: id, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const totals = [
    ["إجمالي الزيارات", restaurant.viewCount],
    ["الاتصالات", restaurant.callClicks],
    ["رسائل واتساب", restaurant.whatsappClicks],
    ["طلبات الاتجاهات", restaurant.directionClicks],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {totals.map(([label, value]) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-primary-700 ltr-nums">{value}</div>
            <div className="text-xs text-stone-500 mt-1">{label}</div>
          </div>
        ))}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-500 ltr-nums">
            {restaurant.ratingCount > 0 ? formatRating(restaurant.avgRating) : "—"}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            التقييم ({restaurant.ratingCount})
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="font-bold mb-4">آخر 14 يوماً</h2>
        {metrics.length === 0 ? (
          <p className="text-sm text-stone-500">لا توجد بيانات بعد — ستظهر الإحصائيات مع أول زيارات لصفحتك.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-500 border-b border-stone-200">
                <th className="text-start py-2 font-semibold">اليوم</th>
                <th className="py-2 font-semibold">زيارات</th>
                <th className="py-2 font-semibold">اتصالات</th>
                <th className="py-2 font-semibold">واتساب</th>
                <th className="py-2 font-semibold">اتجاهات</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id} className="border-b border-stone-100 last:border-0 text-center">
                  <td className="py-2 text-start text-stone-600 ltr-nums">
                    {m.date.toISOString().slice(0, 10)}
                  </td>
                  <td className="ltr-nums">{m.views}</td>
                  <td className="ltr-nums">{m.calls}</td>
                  <td className="ltr-nums">{m.whatsapps}</td>
                  <td className="ltr-nums">{m.directions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {restaurant.tier === "FREE" && (
          <p className="text-xs text-stone-400 mt-4">
            💡 باقة PRO تمنحك إحصائيات أعمق وعروضاً غير محدودة —{" "}
            <Link href="/for-restaurants#pricing" className="text-primary-700 hover:underline">
              تعرّف على الباقات
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
