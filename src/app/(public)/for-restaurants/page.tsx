import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "لأصحاب المطاعم — أضف مطعمك مجاناً",
  description:
    "انضم إلى Go Out Syria: أضف مطعمك مجاناً، حدّث قائمة طعامك، رد على تقييمات الزبائن، وتابع إحصائيات صفحتك. باقات ظهور مميز وتوثيق متاحة.",
  alternates: { canonical: "/for-restaurants" },
};

const FEATURES = [
  ["📋", "صفحة كاملة لمطعمك", "قائمة الطعام بالأسعار، الصور، أوقات الدوام، وموقعك على الخريطة"],
  ["⭐", "تقييمات موثوقة", "كل التقييمات تمر بمراجعة فريقنا قبل النشر — ويمكنك الرد عليها"],
  ["📈", "إحصائيات حقيقية", "عدد الزيارات، الاتصالات، ورسائل واتساب من صفحتك يومياً"],
  ["🔥", "انشر عروضك", "أعلن عن خصوماتك وعروضك لآلاف الزوار الباحثين عن طلعتهم القادمة"],
] as const;

const PLANS = [
  {
    name: "أساسي",
    price: "مجاناً",
    perks: ["صفحة مطعم كاملة", "قائمة طعام وصور", "الرد على التقييمات", "إحصائيات أساسية", "عرض واحد نشط"],
    highlight: false,
  },
  {
    name: "احترافي PRO",
    price: "اشتراك شهري",
    perks: ["كل مزايا الأساسي", "عروض غير محدودة", "إحصائيات تفصيلية يومية", "أولوية في الدعم", "شارة PRO على الصفحة"],
    highlight: true,
  },
  {
    name: "ظهور مميز",
    price: "حسب الموقع والمدة",
    perks: ["الظهور أعلى نتائج البحث", "مكان مميز في الصفحة الرئيسية", "الظهور أول صفحات المطابخ", "تقرير أداء الحملة"],
    highlight: false,
  },
] as const;

export default function ForRestaurantsPage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-stone-900 to-stone-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">
            زبائنك يبحثون عنك — خلّيهم يلاقوك
          </h1>
          <p className="text-stone-300 mt-3 max-w-2xl mx-auto">
            آلاف الزوار يستخدمون Go Out Syria لاختيار وجهتهم القادمة. أضف
            مطعمك مجاناً خلال دقائق وتحكم بصفحتك بالكامل.
          </p>
          <Link
            href="/add-restaurant"
            className="inline-block mt-6 bg-accent-600 hover:bg-accent-700 rounded-xl px-8 py-3 font-bold text-lg"
          >
            أضف مطعمك الآن — مجاناً
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-8">ماذا تحصل؟</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, desc]) => (
            <div key={title} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="text-3xl">{icon}</div>
              <h3 className="font-bold mt-2">{title}</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-stone-100 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">الباقات</h2>
          <p className="text-stone-500 text-center text-sm mb-8">
            الإدراج الأساسي مجاني دائماً — الباقات المدفوعة تُفعَّل بالتواصل مع فريقنا
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 ${
                  plan.highlight
                    ? "bg-primary-700 text-white shadow-xl scale-[1.02]"
                    : "bg-white border border-stone-200"
                }`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`mt-1 font-semibold ${plan.highlight ? "text-primary-100" : "text-accent-600"}`}>
                  {plan.price}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className={plan.highlight ? "text-accent-100" : "text-green-600"}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-stone-500 mt-8">
            للاشتراك في الباقات المدفوعة أو خدمة التصوير الاحترافي وإدخال القائمة:
            تواصل معنا وسيزورك فريقنا — الدفع نقداً أو بالحوالة البنكية
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold">جاهز تبدأ؟</h2>
        <p className="text-stone-600 mt-2">
          سجّل حسابك، أضف مطعمك أو اطلب ملكية صفحة موجودة، وسيتواصل معك فريقنا
          للتوثيق خلال أيام
        </p>
        <Link
          href="/add-restaurant"
          className="inline-block mt-5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-8 py-3 font-bold"
        >
          ابدأ الآن
        </Link>
      </section>
    </div>
  );
}
