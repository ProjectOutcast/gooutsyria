import Link from "next/link";
import { requireEventOwnership } from "@/lib/guards";
import { updateMyEvent } from "@/actions/events";
import { EVENT_CATEGORIES, toDatetimeLocal } from "@/lib/events";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "تعديل الفعالية" };

const STATUS_NOTE: Record<string, string> = {
  PENDING: "فعاليتك قيد المراجعة — ستظهر للعموم بعد الموافقة.",
  APPROVED: "فعاليتك منشورة.",
  REJECTED: "لم تتم الموافقة على هذه الفعالية. عدّلها وراسل الإدارة لإعادة المراجعة.",
  ARCHIVED: "هذه الفعالية مؤرشفة.",
};

export default async function EditMyEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event } = await requireEventOwnership(id);
  const organizer = (event.organizer as { name?: string; phone?: string } | null) ?? null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">تعديل الفعالية</h1>
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-primary-700">
          ← لوحة التحكم
        </Link>
      </div>
      <div className="mb-5 bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-600">
        {STATUS_NOTE[event.status] ?? ""}
        {event.status === "APPROVED" && (
          <Link href={`/events/${event.slug}`} className="ms-2 text-primary-700 font-semibold">
            عرض الصفحة العامة ↗
          </Link>
        )}
      </div>
      <EventForm
        action={updateMyEvent}
        categories={EVENT_CATEGORIES}
        submitLabel="حفظ التعديلات"
        successText="✓ تم حفظ التعديلات"
        initial={{
          id: event.id,
          title: event.title,
          category: event.category,
          venue: event.venue,
          area: event.area,
          address: event.address,
          summary: event.summary,
          description: event.description,
          startsAtLocal: toDatetimeLocal(event.startsAt),
          endsAtLocal: toDatetimeLocal(event.endsAt),
          allDay: event.allDay,
          timeLabel: event.timeLabel,
          priceFrom: event.priceFrom,
          priceNote: event.priceNote,
          tone: event.tone,
          imageUrl: event.imageUrl,
          organizerName: organizer?.name ?? "",
          organizerPhone: organizer?.phone ?? "",
        }}
      />
    </div>
  );
}
