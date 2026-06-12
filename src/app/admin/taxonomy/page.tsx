import { db } from "@/lib/db";
import { addCuisine, addFeature, addNeighborhood } from "@/actions/admin";

export const metadata = { title: "التصنيفات" };

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white";

export default async function AdminTaxonomyPage() {
  const [cuisines, features, neighborhoods] = await Promise.all([
    db.cuisine.findMany({
      orderBy: { nameAr: "asc" },
      include: { _count: { select: { restaurants: true } } },
    }),
    db.feature.findMany({
      orderBy: { nameAr: "asc" },
      include: { _count: { select: { restaurants: true } } },
    }),
    db.neighborhood.findMany({
      orderBy: { nameAr: "asc" },
      include: { _count: { select: { restaurants: true } } },
    }),
  ]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <section className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="font-bold mb-3">المطابخ ({cuisines.length})</h2>
        <form action={addCuisine} className="flex gap-2 mb-4">
          <input name="icon" placeholder="🍕" className={`${inputCls} w-14`} />
          <input name="nameAr" required placeholder="اسم المطبخ" className={`${inputCls} flex-1`} />
          <button className="bg-primary-600 text-white rounded-lg px-3 text-sm">+</button>
        </form>
        <ul className="space-y-1.5 text-sm">
          {cuisines.map((c) => (
            <li key={c.id} className="flex justify-between border-b border-stone-100 pb-1.5">
              <span>{c.icon} {c.nameAr}</span>
              <span className="text-stone-400 text-xs ltr-nums">{c._count.restaurants}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="font-bold mb-3">المزايا ({features.length})</h2>
        <form action={addFeature} className="flex gap-2 mb-4">
          <input name="icon" placeholder="📶" className={`${inputCls} w-14`} />
          <input name="nameAr" required placeholder="اسم الميزة" className={`${inputCls} flex-1`} />
          <button className="bg-primary-600 text-white rounded-lg px-3 text-sm">+</button>
        </form>
        <ul className="space-y-1.5 text-sm">
          {features.map((f) => (
            <li key={f.id} className="flex justify-between border-b border-stone-100 pb-1.5">
              <span>{f.icon} {f.nameAr}</span>
              <span className="text-stone-400 text-xs ltr-nums">{f._count.restaurants}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-5">
        <h2 className="font-bold mb-3">أحياء دمشق ({neighborhoods.length})</h2>
        <form action={addNeighborhood} className="flex gap-2 mb-4">
          <input name="nameAr" required placeholder="اسم الحي" className={`${inputCls} flex-1`} />
          <button className="bg-primary-600 text-white rounded-lg px-3 text-sm">+</button>
        </form>
        <ul className="space-y-1.5 text-sm">
          {neighborhoods.map((n) => (
            <li key={n.id} className="flex justify-between border-b border-stone-100 pb-1.5">
              <span>{n.nameAr}</span>
              <span className="text-stone-400 text-xs ltr-nums">{n._count.restaurants}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
