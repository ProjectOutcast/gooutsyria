import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { formatDateAr } from "@/lib/format";
import { getEventsByOwner, formatEventDate, categoryAr } from "@/lib/events";

export const metadata = { title: "لوحة التحكم" };

const LISTING_STATUS_AR = {
  PENDING: ["قيد المراجعة", "bg-amber-50 text-amber-700"],
  APPROVED: ["منشور", "bg-green-50 text-green-700"],
  REJECTED: ["مرفوض", "bg-primary-50 text-primary-700"],
  ARCHIVED: ["مؤرشف", "bg-stone-100 text-stone-500"],
} as const;

const CLAIM_STATUS_AR = {
  PENDING: "قيد المراجعة",
  APPROVED: "تمت الموافقة",
  REJECTED: "مرفوض",
} as const;

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireUser();
  const { submitted } = await searchParams;

  const [restaurants, events, claims] = await Promise.all([
    db.restaurant.findMany({
      where: { ownerId: user.id },
      include: { city: true },
      orderBy: { createdAt: "desc" },
    }),
    getEventsByOwner(user.id),
    db.ownerClaim.findMany({
      where: { userId: user.id },
      include: { restaurant: { select: { nameAr: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const nothing = restaurants.length === 0 && events.length === 0 && claims.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="flex gap-2">
          <Link
            href="/add-restaurant"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            + إضافة مطعم
          </Link>
          <Link
            href="/dashboard/events/new"
            className="bg-secondary hover:opacity-90 text-white rounded-lg px-4 py-2 text-sm font-semibold"
          >
            + أضف فعالية
          </Link>
        </div>
      </div>

      {submitted === "event" && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
          ✓ تم إرسال فعاليتك بنجاح — ستظهر للعموم بعد مراجعتها من الإدارة.
        </div>
      )}

      {nothing && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <p className="text-stone-600">لا توجد مطاعم أو فعاليات مرتبطة بحسابك بعد.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/add-restaurant"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-6 py-2.5 font-bold"
            >
              أضف مطعمك
            </Link>
            <Link
              href="/dashboard/events/new"
              className="inline-block bg-secondary hover:opacity-90 text-white rounded-xl px-6 py-2.5 font-bold"
            >
              أضف فعاليتك
            </Link>
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3">مطاعمي</h2>
          <div className="space-y-3">
            {restaurants.map((r) => {
              const [label, cls] = LISTING_STATUS_AR[r.status];
              return (
                <Link
                  key={r.id}
                  href={`/dashboard/${r.id}`}
                  className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-5 hover:border-primary-400 transition"
                >
                  <div>
                    <h3 className="font-bold text-lg">{r.nameAr}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {r.city.nameAr} — أُضيف {formatDateAr(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.tier === "PRO" && (
                      <span className="text-xs font-bold bg-stone-900 text-amber-400 rounded-full px-2 py-0.5">
                        PRO
                      </span>
                    )}
                    <span className={`text-xs rounded-full px-2.5 py-1 ${cls}`}>{label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {events.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3 mt-10">فعالياتي</h2>
          <div className="space-y-3">
            {events.map((e) => {
              const [label, cls] = LISTING_STATUS_AR[e.status];
              return (
                <Link
                  key={e.id}
                  href={`/dashboard/events/${e.id}/edit`}
                  className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-5 hover:border-primary-400 transition"
                >
                  <div>
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {categoryAr(e.category)} — {formatEventDate(e.startsAt, e.endsAt)}
                    </p>
                  </div>
                  <span className={`text-xs rounded-full px-2.5 py-1 ${cls}`}>{label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {claims.length > 0 && (
        <>
          <h2 className="text-lg font-bold mt-10 mb-3">طلبات الملكية</h2>
          <div className="space-y-2">
            {claims.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-xl p-4 text-sm"
              >
                <span className="font-semibold">{c.restaurant.nameAr}</span>
                <span className="text-stone-500">{CLAIM_STATUS_AR[c.status]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
