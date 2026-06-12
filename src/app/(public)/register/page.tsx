import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  robots: { index: false },
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-bold text-center mb-2">إنشاء حساب جديد</h1>
      <p className="text-sm text-stone-500 text-center mb-6">
        شارك تقييماتك واحفظ أماكنك المفضلة
      </p>
      <RegisterForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID)} />
    </div>
  );
}
