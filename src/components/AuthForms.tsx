"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginAction,
  registerAction,
  googleSignIn,
  type AuthFormState,
} from "@/actions/auth";

const inputCls =
  "w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    {}
  );
  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input
          type="email"
          name="email"
          required
          placeholder="البريد الإلكتروني"
          className={inputCls}
          dir="ltr"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="كلمة المرور"
          className={inputCls}
          dir="ltr"
        />
        {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-bold"
        >
          {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
        </button>
      </form>
      {googleEnabled && <GoogleButton />}
      <p className="text-sm text-stone-600 text-center">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-primary-700 font-semibold hover:underline">
          أنشئ حساباً
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    {}
  );
  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input
          type="text"
          name="name"
          required
          placeholder="الاسم الكامل"
          className={inputCls}
        />
        <input
          type="email"
          name="email"
          required
          placeholder="البريد الإلكتروني"
          className={inputCls}
          dir="ltr"
        />
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="كلمة المرور (8 أحرف على الأقل)"
          className={inputCls}
          dir="ltr"
        />
        {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-bold"
        >
          {pending ? "جارٍ الإنشاء…" : "إنشاء حساب"}
        </button>
      </form>
      {googleEnabled && <GoogleButton />}
      <p className="text-sm text-stone-600 text-center">
        لديك حساب؟{" "}
        <Link href="/login" className="text-primary-700 font-semibold hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}

function GoogleButton() {
  return (
    <form action={googleSignIn}>
      <button
        type="submit"
        className="w-full border border-stone-300 hover:border-stone-400 bg-white rounded-xl py-2.5 font-semibold text-sm"
      >
        المتابعة بحساب Google
      </button>
    </form>
  );
}
