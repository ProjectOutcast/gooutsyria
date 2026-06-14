import Link from "next/link";
import { getCurrentCity } from "@/lib/current-city";
import { ACTIVE_CITIES, COMING_SOON_CITIES } from "@/lib/cities";
import { FooterDiscover } from "./FooterDiscover";

export async function Footer() {
  const city = await getCurrentCity();
  const business: [string, string][] = [
    ["أضف مطعمك مجاناً", "/for-restaurants"],
    ["الباقات والإعلان", "/for-restaurants#pricing"],
    ["لوحة صاحب المطعم", "/dashboard"],
  ];

  return (
    <footer className="bg-ink text-[#B7A79E] mt-20">
      <div className="max-w-[1240px] mx-auto px-7 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xl font-bold text-white mb-3">
            Go Out <span className="text-primary-300">Syria</span>
          </div>
          <p className="text-sm leading-relaxed">
            دليلك لاكتشاف أفضل المطاعم والكافيهات والفعاليات في سوريا — قوائم طعام،
            تقييمات حقيقية، وعروض حصرية.
          </p>
          <div className="flex gap-2.5 mt-5">
            {[
              ["إنستغرام", "M16 3H8a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5V8a5 5 0 0 0-5-5Zm-4 12.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Zm4.8-8.1a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"],
              ["فيسبوك", "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"],
              ["واتساب", "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5 13.5c-.2.6-1.2 1.2-1.7 1.2s-1 .3-3.5-.7a12 12 0 0 1-5-4.4c-.4-.5-1-1.6-1-2.7a3 3 0 0 1 1-2.3 1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.4l.8 2c0 .2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.4-.1.7a8.9 8.9 0 0 0 1.7 2.1 8 8 0 0 0 2.4 1.5c.3.1.5.1.7-.1l.6-.8c.2-.3.4-.2.7-.1l1.8.8c.3.2.5.2.6.4a2.4 2.4 0 0 1 0 1.2Z"],
              ["تيليغرام", "M21.9 4.6 18.6 19c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8L18 6.4c.4-.3-.1-.5-.6-.2L6.6 13.1l-4.6-1.4c-1-.3-1-1 .2-1.5l18.2-7c.8-.3 1.6.2 1.5 1.4Z"],
            ].map(([label, d]) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                title={`${label} — قريباً`}
                className="w-9 h-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">اكتشف</h3>
          <FooterDiscover serverCity={city} />
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">المدن</h3>
          <ul className="space-y-2.5 text-sm">
            {ACTIVE_CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-white transition-colors">{c.nameAr}</Link>
              </li>
            ))}
            {COMING_SOON_CITIES.map((c) => (
              <li key={c.nameAr}>
                <span className="opacity-60">{c.nameAr} — قريباً</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">للأعمال</h3>
          <ul className="space-y-2.5 text-sm">
            {business.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="max-w-[1240px] mx-auto px-7 flex flex-wrap items-center justify-between gap-3 text-xs opacity-70">
          <span>© {new Date().getFullYear()} Go Out Syria — جميع الحقوق محفوظة · صُنع بحب في سوريا</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-white">الشروط والأحكام</Link>
            <Link href="/contact" className="hover:text-white">اتصل بنا</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
