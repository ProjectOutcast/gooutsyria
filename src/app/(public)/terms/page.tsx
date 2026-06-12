import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-7 py-12">
      <h1 className="text-[30px] font-bold mb-6">الشروط والأحكام</h1>
      <div className="bg-white border border-hairline rounded-2xl p-7 space-y-5 leading-relaxed text-ink2">
        <section>
          <h2 className="font-bold text-ink mb-1.5">استخدام المنصة</h2>
          <p>
            Go Out Syria دليل لاكتشاف المطاعم والكافيهات في سوريا. المعلومات
            المعروضة (الأسعار، أوقات الدوام، العروض) يقدّمها أصحاب المنشآت أو
            فريقنا ونجتهد بتحديثها، وقد تتغير دون إشعار — يُنصح بالتأكد هاتفياً
            قبل الزيارة.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">التقييمات</h2>
          <p>
            التقييمات تعبّر عن رأي أصحابها وتخضع للمراجعة قبل النشر. يُحظر نشر
            تقييمات مزيفة أو مسيئة أو بمقابل مادي، ويحق لنا إزالة أي محتوى
            مخالف وإيقاف الحسابات المخالفة.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">أصحاب المنشآت</h2>
          <p>
            إدراج المنشأة مجاني. المحتوى المدفوع (الظهور المميز والإعلانات)
            يُعرض دائماً بوسم واضح «مميّز» أو «مموّل» أو «إعلان» ولا يؤثر على
            التقييمات.
          </p>
        </section>
        <p className="text-sm text-muted">آخر تحديث: حزيران ٢٠٢٦</p>
      </div>
    </div>
  );
}
