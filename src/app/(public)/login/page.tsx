import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-bold text-center mb-6">تسجيل الدخول</h1>
      <LoginForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
    </div>
  );
}
