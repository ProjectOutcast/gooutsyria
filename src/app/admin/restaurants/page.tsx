import Link from "next/link";
import { db } from "@/lib/db";
import type { ListingStatus } from "@/generated/prisma/enums";
import {
  setRestaurantStatus,
  toggleVerified,
  setTier,
  deleteRestaurant,
} from "@/actions/admin";

export const metadata = { title: "المطاعم" };

const STATUSES: [ListingStatus | "", string][] = [
  ["", "الكل"],
  ["PENDING", "قيد المراجعة"],
  ["APPROVED", "منشور"],
  ["REJECTED", "مرفوض"],
  ["ARCHIVED", "مؤرشف"],
];

const btnCls =
  "text-xs rounded-lg px-2.5 py-1 border border-stone-300 hover:border-primary-500 bg-white";

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.some(([s]) => s === sp.status)
    ? (sp.status as ListingStatus)
    : undefined;

  const restaurants = await db.restaurant.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(sp.q ? { nameAr: { contains: sp.q, mode: "insensitive" } } : {}),
    },
    include: {
      neighborhood: true,
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-bold">المطاعم ({restaurants.length})</h1>
        <form action="/admin/restaurants" className="flex gap-2">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="بحث بالاسم…"
            className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          />
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <button type="submit" className={btnCls}>
            بحث
          </button>
        </form>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
        {STATUSES.map(([s, label]) => (
          <Link
            key={s}
            href={s ? `/admin/restaurants?status=${s}` : "/admin/restaurants"}
            className={`text-sm rounded-full px-3.5 py-1 border whitespace-nowrap ${
              (sp.status ?? "") === s
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white border-stone-300 text-stone-600"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {restaurants.map((r) => (
          <div key={r.id} className="bg-white border border-stone-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold">{r.nameAr}</span>
                <span className="text-xs text-stone-500 ms-2">
                  {r.neighborhood?.nameAr ?? "—"} · {r.status}
                  {r.verified && " · ✓ موثَّق"}
                  {r.tier === "PRO" && " · PRO"}
                </span>
                {r.owner && (
                  <div className="text-xs text-stone-400 mt-0.5">
                    المالك: {r.owner.name} ({r.owner.email})
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.status !== "APPROVED" && (
                  <form action={setRestaurantStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button className="text-xs rounded-lg px-2.5 py-1 bg-green-600 text-white hover:bg-green-700">
                      موافقة ونشر
                    </button>
                  </form>
                )}
                {r.status === "PENDING" && (
                  <form action={setRestaurantStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <button className={btnCls}>رفض</button>
                  </form>
                )}
                {r.status === "APPROVED" && (
                  <form action={setRestaurantStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button className={btnCls}>أرشفة</button>
                  </form>
                )}
                <form action={toggleVerified}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className={btnCls}>
                    {r.verified ? "إلغاء التوثيق" : "توثيق ✓"}
                  </button>
                </form>
                <form action={setTier}>
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    type="hidden"
                    name="tier"
                    value={r.tier === "PRO" ? "FREE" : "PRO"}
                  />
                  <button className={btnCls}>
                    {r.tier === "PRO" ? "إلغاء PRO" : "ترقية PRO"}
                  </button>
                </form>
                <Link href={`/dashboard/${r.id}/edit`} className={btnCls}>
                  تعديل
                </Link>
                <form action={deleteRestaurant}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs rounded-lg px-2.5 py-1 border border-primary-300 text-primary-700 hover:bg-primary-50">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
