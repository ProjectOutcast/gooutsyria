import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateEvent } from "@/actions/admin";
import { EVENT_CATEGORIES, toDatetimeLocal } from "@/lib/events";
import { ACTIVE_CITIES } from "@/lib/cities";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "تعديل فعالية" };

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: { owner: { select: { email: true } }, city: { select: { slug: true } } },
  });
  if (!event) notFound();

  const organizer = (event.organizer as { name?: string; phone?: string } | null) ?? null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">تعديل فعالية</h1>
        <Link href="/admin/events" className="text-sm text-stone-500 hover:text-primary-700">
          ← رجوع للقائمة
        </Link>
      </div>
      <EventForm
        action={updateEvent}
        admin
        categories={EVENT_CATEGORIES}
        cities={ACTIVE_CITIES}
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
          citySlug: event.city.slug,
          featured: event.featured,
          featuredKicker: event.featuredKicker,
          status: event.status,
          ownerEmail: event.owner?.email ?? "",
        }}
      />
    </div>
  );
}
