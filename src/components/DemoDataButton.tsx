"use client";

import { useActionState } from "react";
import { generateDemoData, type DemoDataState } from "@/actions/admin";

export function DemoDataButton() {
  const [state, formAction, pending] = useActionState<DemoDataState, FormData>(
    generateDemoData,
    {}
  );

  return (
    <form action={formAction} className="bg-white border border-stone-200 rounded-2xl p-5 mt-8">
      <h2 className="font-bold">بيانات تجريبية</h2>
      <p className="text-sm text-stone-500 mt-1">
        يضيف ١٦ مطعماً تجريبياً مع قوائم طعام وتقييمات وعروض وقوائم مختارة —
        لمعاينة المنصة قبل إدخال البيانات الحقيقية. لا يحذف أو يعدّل أي بيانات
        موجودة، والمطاعم الموجودة مسبقاً يتم تخطيها.
      </p>
      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl px-5 py-2 text-sm font-bold"
        >
          {pending ? "جارٍ التوليد…" : "توليد البيانات التجريبية"}
        </button>
        {state.ok && <p className="text-sm text-green-700">✓ {state.summary}</p>}
        {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      </div>
    </form>
  );
}
