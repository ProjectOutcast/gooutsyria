import Link from "next/link";
import { db } from "@/lib/db";
import {
  createEvent,
  setEventStatus,
  toggleEventFeatured,
  deleteEvent,
} from "@/actions/admin";
import { EVENT_CATEGORIES, categoryAr, formatEventDate } from "@/lib/events";
import { ACTIVE_CITIES } from "@/lib/cities";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "الفعاليات" };

const STATUS_AR: Record<string, [string, string]> = {
  PENDING: ["قيد المراجعة", "bg-amber-50 text-amber-700"],
  APPROVED: ["منشور", "bg-green-50 text-green-700"],
  REJECTED: ["مرفوض", "bg-primary-50 text-primary-700"],
  ARCHIVED: ["مؤرشف", "bg-stone-100 text-stone-500"],
};

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: [{ status: "asc" }, { startsAt: "asc" }],
    include: { owner: { select: { email: true } }, city: { select: { nameAr: true } } },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">الفعاليات</h1>
      <p className="text-sm text-stone-500 mb-5">
        أضف فعالية جديدة (تُنشر مباشرةً)، وراجع الفعاليات المُرسَلة من المنظّمين.
        لربط فعالية بمنظّم ليديرها بنفسه، أدخل بريده الإلكتروني.
      </p>

      <details className="mb-6 bg-white border border-stone-200 rounded-2xl">
        <summary className="cursor-pointer select-none px-5 py-3 font-semibold text-sm">
          + إضافة فعالية جديدة
        </summary>
        <div className="px-2 pb-2 sm:px-4 sm:pb-4">
          <EventForm
            action={createEvent}
            admin
            categories={EVENT_CATEGORIES}
            cities={ACTIVE_CITIES}
            submitLabel="إضافة الفعالية"
            successText="✓ تمت إضافة الفعالية"
          />
        </div>
      </details>

      <div className="space-y-2">
        {events.map((e) => {
          const [label, cls] = STATUS_AR[e.status] ?? STATUS_AR.APPROVED;
          return (
            <div
              key={e.id}
              className="bg-white border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-bold">{e.title}</span>
                {e.featured && <span className="ms-1 text-amber-500">★</span>}
                <span className="text-stone-500 ms-2">
                  {e.city.nameAr} · {categoryAr(e.category)} · {formatEventDate(e.startsAt, e.endsAt)} · {e.venue}
                  {e.owner && ` · ${e.owner.email}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs rounded-full px-2.5 py-1 ${cls}`}>{label}</span>
                {e.status === "PENDING" && (
                  <form action={setEventStatus}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button className="text-xs rounded-lg px-2.5 py-1 border border-green-300 text-green-700 hover:bg-green-50">
                      نشر
                    </button>
                  </form>
                )}
                <form action={toggleEventFeatured}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-xs rounded-lg px-2.5 py-1 border border-stone-300 hover:border-amber-500">
                    {e.featured ? "إلغاء التمييز" : "تمييز"}
                  </button>
                </form>
                <Link
                  href={`/admin/events/${e.id}`}
                  className="text-xs rounded-lg px-2.5 py-1 border border-stone-300 hover:border-primary-500"
                >
                  تعديل
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-stone-400 hover:text-primary-700">✕</button>
                </form>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <p className="text-sm text-stone-500">لا توجد فعاليات بعد.</p>
        )}
      </div>
    </div>
  );
}
