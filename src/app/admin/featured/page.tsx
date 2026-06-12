import { db } from "@/lib/db";
import { createFeatured, deleteFeatured } from "@/actions/admin";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "الظهور المميز" };

const SLOT_AR = {
  HOME: "الصفحة الرئيسية",
  SEARCH: "أعلى نتائج البحث",
  CUISINE: "صفحة مطبخ",
} as const;

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white";

export default async function AdminFeaturedPage() {
  const [placements, restaurants, cuisines] = await Promise.all([
    db.featuredPlacement.findMany({
      include: {
        restaurant: { select: { nameAr: true } },
        cuisine: { select: { nameAr: true } },
      },
      orderBy: { endsAt: "desc" },
      take: 50,
    }),
    db.restaurant.findMany({
      where: { status: "APPROVED" },
      orderBy: { nameAr: "asc" },
      select: { id: true, nameAr: true },
    }),
    db.cuisine.findMany({ orderBy: { nameAr: "asc" } }),
  ]);

  const now = new Date();

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">الظهور المميز (مُموَّل)</h1>
      <p className="text-sm text-stone-500 mb-5">
        المواضع المباعة للمطاعم — تُعرض بشارة «مُموَّل» في الموقع وتُفوتَر يدوياً
      </p>

      <form
        action={createFeatured}
        className="bg-white border border-stone-200 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-6 items-center"
      >
        <select name="restaurantId" required defaultValue="" className={inputCls}>
          <option value="" disabled>
            المطعم…
          </option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameAr}
            </option>
          ))}
        </select>
        <select name="slot" required defaultValue="HOME" className={inputCls}>
          {Object.entries(SLOT_AR).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="cuisineId" defaultValue="" className={inputCls}>
          <option value="">مطبخ (لموضع المطبخ فقط)</option>
          {cuisines.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
        <input type="date" name="startsAt" required className={inputCls} />
        <input type="date" name="endsAt" required className={inputCls} />
        <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold">
          + إضافة
        </button>
        <input
          name="notes"
          placeholder="ملاحظات (المبلغ، طريقة الدفع…)"
          className={`${inputCls} sm:col-span-2 lg:col-span-6`}
        />
      </form>

      <div className="space-y-2">
        {placements.map((p) => {
          const live = p.startsAt <= now && p.endsAt >= now;
          return (
            <div
              key={p.id}
              className={`bg-white border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-sm ${
                live ? "border-green-300" : "border-stone-200 opacity-70"
              }`}
            >
              <div>
                <span className="font-bold">{p.restaurant.nameAr}</span>
                <span className="text-stone-500 ms-2">
                  {SLOT_AR[p.slot]}
                  {p.cuisine && ` (${p.cuisine.nameAr})`} ·{" "}
                  {formatDateAr(p.startsAt)} ← {formatDateAr(p.endsAt)}
                  {live && " · 🟢 نشط"}
                </span>
                {p.notes && (
                  <div className="text-xs text-stone-400 mt-0.5">{p.notes}</div>
                )}
              </div>
              <form action={deleteFeatured}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-stone-400 hover:text-primary-700">✕</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
