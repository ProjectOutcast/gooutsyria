import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { submitEvent } from "@/actions/events";
import { EVENT_CATEGORIES } from "@/lib/events";
import { ACTIVE_CITIES } from "@/lib/cities";
import { getCurrentCity } from "@/lib/current-city";
import { EventForm } from "@/components/EventForm";

export const metadata = { title: "أضف فعالية" };

export default async function NewEventPage() {
  await requireUser();
  const city = await getCurrentCity();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">أضف فعالية</h1>
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-primary-700">
          ← لوحة التحكم
        </Link>
      </div>
      <p className="text-sm text-stone-500 mb-5">
        أدخل تفاصيل فعاليتك. سيراجعها فريقنا قبل نشرها للعموم.
      </p>
      <EventForm
        action={submitEvent}
        categories={EVENT_CATEGORIES}
        cities={ACTIVE_CITIES}
        initial={{ citySlug: city }}
        submitLabel="إرسال الفعالية للمراجعة"
        successText="✓ تم الإرسال"
      />
    </div>
  );
}
