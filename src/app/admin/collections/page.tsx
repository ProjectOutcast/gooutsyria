import Link from "next/link";
import { db } from "@/lib/db";
import {
  createCollection,
  togglePublishCollection,
  deleteCollection,
} from "@/actions/admin";

export const metadata = { title: "القوائم المختارة" };

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white";

export default async function AdminCollectionsPage() {
  const collections = await db.collection.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">القوائم المختارة</h1>

      <form
        action={createCollection}
        className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap gap-2 mb-6"
      >
        <input
          name="titleAr"
          required
          placeholder="عنوان القائمة (مثال: أفضل فطور في دمشق)"
          className={`${inputCls} flex-1 min-w-60`}
        />
        <input
          name="descAr"
          placeholder="وصف قصير"
          className={`${inputCls} flex-1 min-w-60`}
        />
        <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold">
          + إنشاء
        </button>
      </form>

      <div className="space-y-3">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <span className="font-bold">{col.titleAr}</span>
              <span className="text-xs text-stone-500 ms-2">
                {col._count.items} عناصر · {col.published ? "منشورة" : "مسودة"}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/collections/${col.id}`}
                className="text-xs rounded-lg px-3 py-1.5 border border-stone-300 hover:border-primary-500 bg-white"
              >
                تحرير العناصر
              </Link>
              <form action={togglePublishCollection}>
                <input type="hidden" name="id" value={col.id} />
                <button
                  className={`text-xs rounded-lg px-3 py-1.5 font-semibold ${
                    col.published
                      ? "border border-stone-300 hover:border-primary-500"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {col.published ? "إخفاء" : "نشر"}
                </button>
              </form>
              <form action={deleteCollection}>
                <input type="hidden" name="id" value={col.id} />
                <button className="text-xs rounded-lg px-3 py-1.5 border border-primary-300 text-primary-700 hover:bg-primary-50">
                  حذف
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
