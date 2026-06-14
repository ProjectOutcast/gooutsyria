"use client";

import { useActionState } from "react";
import type { FormState } from "@/actions/events";

const inputCls =
  "w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelCls = "block text-sm font-semibold text-stone-700 mb-1";

const TONES = ["a", "b", "c", "d", "e", "f"];

export type EventInitial = {
  id?: string;
  title?: string;
  category?: string;
  venue?: string;
  area?: string;
  address?: string | null;
  summary?: string | null;
  description?: string | null;
  startsAtLocal?: string;
  endsAtLocal?: string;
  allDay?: boolean;
  timeLabel?: string | null;
  priceFrom?: number | null;
  priceNote?: string | null;
  tone?: string;
  imageUrl?: string | null;
  organizerName?: string;
  organizerPhone?: string;
  // admin-only
  featured?: boolean;
  featuredKicker?: string | null;
  status?: string;
  ownerEmail?: string;
};

const STATUS_AR: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "منشور",
  REJECTED: "مرفوض",
  ARCHIVED: "مؤرشف",
};

export function EventForm({
  action,
  categories,
  initial = {},
  admin = false,
  submitLabel,
  successText,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  categories: { slug: string; nameAr: string }[];
  initial?: EventInitial;
  admin?: boolean;
  submitLabel: string;
  successText: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-6 bg-white border border-stone-200 rounded-2xl p-6">
      {initial.id && <input type="hidden" name="eventId" value={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>عنوان الفعالية *</label>
          <input name="title" required defaultValue={initial.title ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>الفئة *</label>
          <select name="category" defaultValue={initial.category ?? categories[0]?.slug} className={inputCls}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nameAr}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>المكان (القاعة/الموقع) *</label>
          <input name="venue" required defaultValue={initial.venue ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>المنطقة *</label>
          <input name="area" required defaultValue={initial.area ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>تاريخ ووقت البداية *</label>
          <input type="datetime-local" name="startsAt" required defaultValue={initial.startsAtLocal ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>تاريخ الانتهاء (للفعاليات متعددة الأيام)</label>
          <input type="datetime-local" name="endsAt" defaultValue={initial.endsAtLocal ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>وقت العرض (نص اختياري، مثل ٧:٣٠ م)</label>
          <input name="timeLabel" defaultValue={initial.timeLabel ?? ""} className={inputCls} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="allDay" defaultChecked={initial.allDay} className="accent-primary-600" />
            طوال اليوم
          </label>
        </div>
        <div>
          <label className={labelCls}>السعر يبدأ من (ل.س — اتركه فارغاً للمجاني)</label>
          <input name="priceFrom" type="number" min="0" defaultValue={initial.priceFrom ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>ملاحظة السعر (عند المجاني، مثل دخول مجاني)</label>
          <input name="priceNote" defaultValue={initial.priceNote ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>رابط صورة الغلاف</label>
          <input name="imageUrl" defaultValue={initial.imageUrl ?? ""} className={inputCls} dir="ltr" placeholder="https://…" />
        </div>
        <div>
          <label className={labelCls}>التدرّج اللوني (احتياطي عند غياب الصورة)</label>
          <select name="tone" defaultValue={initial.tone ?? "a"} className={inputCls}>
            {TONES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>العنوان التفصيلي</label>
          <input name="address" defaultValue={initial.address ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>اسم المنظّم</label>
          <input name="organizerName" defaultValue={initial.organizerName ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>هاتف المنظّم</label>
          <input name="organizerPhone" defaultValue={initial.organizerPhone ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>نبذة قصيرة (تظهر على البطاقات)</label>
          <input name="summary" defaultValue={initial.summary ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>الوصف الكامل</label>
          <textarea name="description" rows={5} defaultValue={initial.description ?? ""} className={inputCls} />
        </div>
      </div>

      {admin && (
        <div className="grid sm:grid-cols-2 gap-4 border-t border-stone-200 pt-5">
          <div className="sm:col-span-2 text-xs font-bold text-stone-400">إعدادات الإدارة</div>
          <div>
            <label className={labelCls}>الحالة</label>
            <select name="status" defaultValue={initial.status ?? "APPROVED"} className={inputCls}>
              {Object.entries(STATUS_AR).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>بريد المالك/المنظّم (لربط الفعالية بحسابه)</label>
            <input name="ownerEmail" defaultValue={initial.ownerEmail ?? ""} className={inputCls} dir="ltr" placeholder="organizer@example.com" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" name="featured" defaultChecked={initial.featured} className="accent-primary-600" />
              مميّزة (تظهر في الكاروسيل)
            </label>
          </div>
          <div>
            <label className={labelCls}>نص الشارة المميّزة</label>
            <input name="featuredKicker" defaultValue={initial.featuredKicker ?? ""} className={inputCls} placeholder="مهرجان · ٦ أيام" />
          </div>
        </div>
      )}

      {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">{successText}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl px-8 py-2.5 font-bold"
      >
        {pending ? "جارٍ الحفظ…" : submitLabel}
      </button>
    </form>
  );
}
