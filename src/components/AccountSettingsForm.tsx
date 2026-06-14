"use client";

import { useActionState } from "react";
import { updateAccount, type AccountFormState } from "@/actions/auth";

const inputCls =
  "w-full border border-hairline2 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelCls = "block text-sm font-semibold text-ink2 mb-1.5";

export function AccountSettingsForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(
    updateAccount,
    {}
  );

  return (
    <form
      action={formAction}
      className="bg-white border border-hairline rounded-2xl p-6 max-w-xl space-y-5"
    >
      <div>
        <label className={labelCls}>الاسم</label>
        <input name="name" required defaultValue={name} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>البريد الإلكتروني</label>
        <input
          value={email}
          disabled
          dir="ltr"
          className={`${inputCls} bg-chipbg text-muted cursor-not-allowed`}
        />
        <p className="text-[12px] text-muted2 mt-1">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
      </div>

      <div className="h-px bg-hairline" />

      <p className="text-sm font-semibold text-ink">
        تغيير كلمة المرور <span className="text-muted2 font-normal">(اختياري)</span>
      </p>
      <div>
        <label className={labelCls}>كلمة المرور الحالية</label>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className={inputCls}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>كلمة المرور الجديدة</label>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>تأكيد كلمة المرور</label>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-warn font-semibold">{state.error}</p>}
      {state.ok && <p className="text-sm text-success font-semibold">✓ تم حفظ التعديلات</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary-500 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl px-8 py-2.5 font-bold transition-colors"
      >
        {pending ? "جارٍ الحفظ…" : "حفظ التعديلات"}
      </button>
    </form>
  );
}
