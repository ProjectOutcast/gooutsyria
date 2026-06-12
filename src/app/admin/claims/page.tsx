import { db } from "@/lib/db";
import { decideClaim } from "@/actions/admin";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "طلبات الملكية" };

export default async function AdminClaimsPage() {
  const claims = await db.ownerClaim.findMany({
    include: {
      restaurant: { select: { nameAr: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">طلبات الملكية</h1>
      <div className="space-y-3">
        {claims.length === 0 && (
          <p className="text-sm text-stone-500">لا توجد طلبات.</p>
        )}
        {claims.map((c) => (
          <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-bold">{c.restaurant.nameAr}</div>
                <div className="text-stone-600 mt-0.5">
                  {c.user.name} ({c.user.email}) — هاتف التحقق:{" "}
                  <span className="ltr-nums" dir="ltr">{c.phone}</span>
                </div>
                {c.message && (
                  <p className="text-stone-500 text-xs mt-1">{c.message}</p>
                )}
                <div className="text-xs text-stone-400 mt-1">
                  {formatDateAr(c.createdAt)} · {c.status}
                </div>
              </div>
              {c.status === "PENDING" && (
                <div className="flex gap-2">
                  <form action={decideClaim}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button className="text-xs rounded-lg px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 font-semibold">
                      موافقة — نقل الملكية
                    </button>
                  </form>
                  <form action={decideClaim}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button className="text-xs rounded-lg px-3 py-1.5 border border-stone-300 hover:border-primary-500">
                      رفض
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
