"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  submitNewRestaurant,
  claimRestaurant,
  type FormState,
} from "@/actions/restaurants";

const inputCls =
  "w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

type Option = { id: string; nameAr: string };

export function AddRestaurantForms({
  neighborhoods,
  claimable,
}: {
  neighborhoods: Option[];
  claimable: Option[];
}) {
  const [mode, setMode] = useState<"new" | "claim">("new");

  return (
    <div>
      <div className="flex rounded-xl overflow-hidden border border-stone-300 mb-6">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`flex-1 py-2.5 text-sm font-semibold ${
            mode === "new" ? "bg-primary-600 text-white" : "bg-white text-stone-600"
          }`}
        >
          إضافة مطعم جديد
        </button>
        <button
          type="button"
          onClick={() => setMode("claim")}
          className={`flex-1 py-2.5 text-sm font-semibold ${
            mode === "claim" ? "bg-primary-600 text-white" : "bg-white text-stone-600"
          }`}
        >
          مطعمي موجود — أطلب الملكية
        </button>
      </div>
      {mode === "new" ? (
        <NewRestaurantForm neighborhoods={neighborhoods} />
      ) : (
        <ClaimForm claimable={claimable} />
      )}
    </div>
  );
}

function NewRestaurantForm({ neighborhoods }: { neighborhoods: Option[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    submitNewRestaurant,
    {}
  );

  if (state.ok) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 text-sm leading-relaxed">
        تم استلام طلبك! سيراجع فريقنا البيانات ويتواصل معك للتوثيق، وستظهر
        صفحة مطعمك خلال أيام. يمكنك متابعة الحالة من{" "}
        <Link href="/dashboard" className="font-bold underline">
          لوحة التحكم
        </Link>
        .
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input name="nameAr" required placeholder="اسم المطعم *" className={inputCls} />
      <input name="phone" required placeholder="رقم الهاتف *" className={inputCls} dir="ltr" />
      <select name="neighborhoodId" required defaultValue="" className={inputCls}>
        <option value="" disabled>
          اختر الحي *
        </option>
        {neighborhoods.map((n) => (
          <option key={n.id} value={n.id}>
            {n.nameAr}
          </option>
        ))}
      </select>
      <input name="address" placeholder="العنوان التفصيلي" className={inputCls} />
      <textarea
        name="description"
        rows={3}
        placeholder="نبذة قصيرة عن المطعم"
        className={inputCls}
      />
      {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-bold"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال الطلب"}
      </button>
    </form>
  );
}

function ClaimForm({ claimable }: { claimable: Option[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    claimRestaurant,
    {}
  );

  if (state.ok) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 text-sm">
        تم استلام طلب الملكية! سيتصل بك فريقنا على الرقم المُدخل للتحقق، ثم
        تنتقل إدارة الصفحة إليك.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <select name="restaurantId" required defaultValue="" className={inputCls}>
        <option value="" disabled>
          اختر صفحة مطعمك *
        </option>
        {claimable.map((r) => (
          <option key={r.id} value={r.id}>
            {r.nameAr}
          </option>
        ))}
      </select>
      <input
        name="phone"
        required
        placeholder="رقم هاتفك للتحقق *"
        className={inputCls}
        dir="ltr"
      />
      <textarea
        name="message"
        rows={3}
        placeholder="معلومات إضافية تساعدنا بالتحقق (صفتك، أوقات التواصل…)"
        className={inputCls}
      />
      {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-bold"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال طلب الملكية"}
      </button>
    </form>
  );
}
