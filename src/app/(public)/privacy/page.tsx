import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-7 py-12">
      <h1 className="text-[30px] font-bold mb-6">سياسة الخصوصية</h1>
      <div className="bg-white border border-hairline rounded-2xl p-7 space-y-5 leading-relaxed text-ink2">
        <p>
          نحترم خصوصيتك. توضح هذه الصفحة كيف تتعامل منصة Go Out Syria مع
          بياناتك.
        </p>
        <section>
          <h2 className="font-bold text-ink mb-1.5">البيانات التي نجمعها</h2>
          <p>
            عند إنشاء حساب نحفظ اسمك وبريدك الإلكتروني وكلمة مرور مشفّرة. عند
            استخدام الموقع نحفظ تقييماتك والأماكن التي تحفظها. لأصحاب
            المطاعم: نحفظ بيانات المنشأة ورقم هاتف التحقق.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">كيف نستخدمها</h2>
          <p>
            لتشغيل المنصة فقط: عرض تقييماتك باسمك، حفظ تفضيلاتك، وتزويد أصحاب
            المطاعم بإحصائيات مجمّعة (عدد الزيارات والاتصالات) دون أي بيانات
            شخصية عن الزوار. لا نبيع بياناتك لأي طرف ثالث.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">حذف حسابك</h2>
          <p>
            يمكنك طلب حذف حسابك وكل بياناتك في أي وقت عبر صفحة{" "}
            <Link href="/contact" className="text-primary-500 hover:underline">اتصل بنا</Link>.
          </p>
        </section>
        <p className="text-sm text-muted">آخر تحديث: حزيران ٢٠٢٦</p>
      </div>
    </div>
  );
}
