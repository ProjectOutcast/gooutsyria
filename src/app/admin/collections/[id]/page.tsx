import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addCollectionItem, removeCollectionItem } from "@/actions/admin";

export const metadata = { title: "تحرير قائمة" };

export default async function AdminCollectionEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await db.collection.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { restaurant: { select: { nameAr: true } } },
      },
    },
  });
  if (!collection) notFound();

  const inListIds = collection.items.map((i) => i.restaurantId);
  const candidates = await db.restaurant.findMany({
    where: { status: "APPROVED", id: { notIn: inListIds } },
    orderBy: { nameAr: "asc" },
    select: { id: true, nameAr: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{collection.titleAr}</h1>
      <p className="text-sm text-stone-500 mb-5">
        {collection.published ? "منشورة" : "مسودة"} — {collection.items.length} عناصر
      </p>

      <form
        action={addCollectionItem}
        className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-2 mb-6"
      >
        <input type="hidden" name="collectionId" value={collection.id} />
        <select
          name="restaurantId"
          required
          defaultValue=""
          className="border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white flex-1 min-w-52"
        >
          <option value="" disabled>
            اختر مطعماً…
          </option>
          {candidates.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameAr}
            </option>
          ))}
        </select>
        <input
          name="blurbAr"
          placeholder="لماذا هذا المكان؟ (وصف يظهر في القائمة)"
          className="border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white flex-[2] min-w-60"
        />
        <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold">
          + إضافة
        </button>
      </form>

      <ol className="space-y-2">
        {collection.items.map((item, i) => (
          <li
            key={item.id}
            className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3"
          >
            <div className="text-sm">
              <span className="font-bold text-stone-400 me-2 ltr-nums">{i + 1}.</span>
              <span className="font-semibold">{item.restaurant.nameAr}</span>
              {item.blurbAr && (
                <span className="text-stone-500 text-xs ms-2">{item.blurbAr}</span>
              )}
            </div>
            <form action={removeCollectionItem}>
              <input type="hidden" name="id" value={item.id} />
              <button className="text-stone-400 hover:text-primary-700">✕</button>
            </form>
          </li>
        ))}
      </ol>
    </div>
  );
}
