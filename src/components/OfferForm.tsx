"use client";

import { useActionState } from "react";
import { createOffer, type FormState } from "@/actions/restaurants";

const inputCls =
  "border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export function OfferForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createOffer,
    {}
  );

  return (
    <form
      action={formAction}
      className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3"
    >
      <h2 className="font-bold">عرض جديد</h2>
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input
        name="titleAr"
        required
        placeholder="عنوان العرض (مثال: خصم 20% على كل القائمة)"
        className={`${inputCls} w-full`}
      />
      <textarea
        name="descAr"
        rows={2}
        placeholder="تفاصيل وشروط العرض (اختياري)"
        className={`${inputCls} w-full`}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="text-stone-600">
          من{" "}
          <input type="date" name="startsAt" required className={inputCls} />
        </label>
        <label className="text-stone-600">
          إلى{" "}
          <input type="date" name="endsAt" required className={inputCls} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg px-5 py-1.5 font-semibold ms-auto"
        >
          {pending ? "جارٍ النشر…" : "نشر العرض"}
        </button>
      </div>
      {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">✓ تم نشر العرض</p>}
    </form>
  );
}
