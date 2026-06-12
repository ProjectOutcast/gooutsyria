import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import {
  addMenuSection,
  deleteMenuSection,
  addMenuItem,
  deleteMenuItem,
} from "@/actions/restaurants";
import { formatSyp } from "@/lib/format";

export const metadata = { title: "قائمة الطعام" };

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export default async function MenuEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRestaurantOwnership(id);

  const sections = await db.menuSection.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <form
        action={addMenuSection}
        className="flex gap-2 bg-white border border-stone-200 rounded-2xl p-4"
      >
        <input type="hidden" name="restaurantId" value={id} />
        <input
          name="nameAr"
          required
          placeholder="اسم القسم الجديد (مثال: المقبلات)"
          className={`${inputCls} flex-1`}
        />
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold"
        >
          + إضافة قسم
        </button>
      </form>

      {sections.length === 0 && (
        <p className="text-sm text-stone-500 text-center py-6">
          ابدأ بإضافة أقسام القائمة (مقبلات، أطباق رئيسية، مشروبات…) ثم أضف
          الأصناف داخل كل قسم.
        </p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary-700">{section.nameAr}</h2>
            <form action={deleteMenuSection}>
              <input type="hidden" name="sectionId" value={section.id} />
              <button
                type="submit"
                className="text-xs text-stone-400 hover:text-primary-700"
              >
                حذف القسم
              </button>
            </form>
          </div>

          <ul className="space-y-2 mb-4">
            {section.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-sm border-b border-stone-100 pb-2"
              >
                <div>
                  <span className="font-semibold">{item.nameAr}</span>
                  {item.popular && (
                    <span className="ms-2 text-[11px] bg-amber-100 text-amber-800 rounded-full px-1.5 py-0.5">
                      الأكثر طلباً
                    </span>
                  )}
                  {item.descAr && (
                    <p className="text-xs text-stone-500">{item.descAr}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold ltr-nums">{formatSyp(item.priceSyp)}</span>
                  <form action={deleteMenuItem}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button type="submit" className="text-stone-400 hover:text-primary-700">
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <form action={addMenuItem} className="grid sm:grid-cols-[1fr_1fr_110px_auto_auto] gap-2 items-center">
            <input type="hidden" name="sectionId" value={section.id} />
            <input name="nameAr" required placeholder="اسم الصنف" className={inputCls} />
            <input name="descAr" placeholder="وصف (اختياري)" className={inputCls} />
            <input
              name="priceSyp"
              required
              type="number"
              min="0"
              placeholder="السعر ل.س"
              className={`${inputCls} ltr-nums`}
            />
            <label className="flex items-center gap-1 text-xs text-stone-600">
              <input type="checkbox" name="popular" className="accent-primary-600" />
              مميز
            </label>
            <button
              type="submit"
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-lg px-3 py-1.5 text-sm"
            >
              إضافة
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
