import { db } from "@/lib/db";
import { createSponsor, toggleSponsor, deleteSponsor } from "@/actions/admin";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "الرعايات" };

const PLACEMENT_AR = {
  HOME_BANNER: "بانر الصفحة الرئيسية",
  COLLECTION: "رعاية قائمة مختارة",
  SEARCH_BANNER: "بانر صفحة البحث",
} as const;

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm bg-white";

export default async function AdminSponsorsPage() {
  const [sponsors, collections] = await Promise.all([
    db.sponsorSlot.findMany({
      include: { collection: { select: { titleAr: true } } },
      orderBy: { endsAt: "desc" },
      take: 50,
    }),
    db.collection.findMany({
      orderBy: { titleAr: "asc" },
      select: { id: true, titleAr: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">الرعايات والإعلانات</h1>
      <p className="text-sm text-stone-500 mb-5">
        مساحات العلامات التجارية (بنوك، شركات اتصالات، مواد غذائية…) — تُباع
        مباشرة وتُدار من هنا
      </p>

      <form
        action={createSponsor}
        className="bg-white border border-stone-200 rounded-2xl p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6"
      >
        <input name="name" required placeholder="اسم الراعي *" className={inputCls} />
        <select name="placement" required defaultValue="HOME_BANNER" className={inputCls}>
          {Object.entries(PLACEMENT_AR).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="collectionId" defaultValue="" className={inputCls}>
          <option value="">قائمة (لرعاية القوائم فقط)</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleAr}
            </option>
          ))}
        </select>
        <input name="linkUrl" placeholder="رابط الراعي" className={inputCls} dir="ltr" />
        <input name="imageUrl" placeholder="رابط صورة البانر" className={inputCls} dir="ltr" />
        <div className="flex gap-2">
          <input type="date" name="startsAt" required className={`${inputCls} flex-1`} />
          <input type="date" name="endsAt" required className={`${inputCls} flex-1`} />
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold lg:col-span-3">
          + إضافة رعاية
        </button>
      </form>

      <div className="space-y-2">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <div>
              <span className="font-bold">{s.name}</span>
              <span className="text-stone-500 ms-2">
                {PLACEMENT_AR[s.placement]}
                {s.collection && ` (${s.collection.titleAr})`} ·{" "}
                {formatDateAr(s.startsAt)} ← {formatDateAr(s.endsAt)} ·{" "}
                {s.active ? "🟢 مفعّلة" : "موقوفة"}
              </span>
            </div>
            <div className="flex gap-2">
              <form action={toggleSponsor}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-xs rounded-lg px-2.5 py-1 border border-stone-300 hover:border-primary-500">
                  {s.active ? "إيقاف" : "تفعيل"}
                </button>
              </form>
              <form action={deleteSponsor}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-stone-400 hover:text-primary-700">✕</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
