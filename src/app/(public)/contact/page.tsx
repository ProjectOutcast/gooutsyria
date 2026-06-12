import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "اتصل بنا",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-7 py-12">
      <h1 className="text-[30px] font-bold mb-6">اتصل بنا</h1>
      <div className="bg-white border border-hairline rounded-2xl p-7 space-y-5 leading-relaxed text-ink2">
        <p>يسعدنا سماعك — سواء كنت زائراً، صاحب مطعم، أو معلناً.</p>
        <section>
          <h2 className="font-bold text-ink mb-1.5">البريد الإلكتروني</h2>
          <p className="ltr-nums" dir="ltr">
            <a href="mailto:hello@gooutsyria.com" className="text-primary-500 hover:underline">
              hello@gooutsyria.com
            </a>
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">لأصحاب المطاعم</h2>
          <p>
            للإدراج المجاني، باقات الظهور المميز، أو خدمة التصوير وإدخال
            القائمة:{" "}
            <Link href="/for-restaurants" className="text-primary-500 hover:underline">
              صفحة الأعمال
            </Link>{" "}
            أو راسلنا مباشرة.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-ink mb-1.5">تصحيح معلومات</h2>
          <p>
            لاحظت معلومة خاطئة عن مكان ما؟ أخبرنا وسنصححها خلال ٢٤ ساعة.
          </p>
        </section>
      </div>
    </div>
  );
}
