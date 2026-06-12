import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="text-lg font-bold text-white mb-2">
            Go Out <span className="text-accent-500">Syria</span>
          </div>
          <p className="text-sm leading-relaxed">
            دليلك لاكتشاف أفضل المطاعم والكافيهات في سوريا — قوائم طعام، تقييمات
            حقيقية، وعروض حصرية.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3 text-sm">اكتشف</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/damascus/restaurants" className="hover:text-white">
                مطاعم دمشق
              </Link>
            </li>
            <li>
              <Link href="/damascus/collections" className="hover:text-white">
                قوائم مختارة
              </Link>
            </li>
            <li>
              <Link href="/damascus/offers" className="hover:text-white">
                العروض الحالية
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3 text-sm">للشركاء</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/for-restaurants" className="hover:text-white">
                أضف مطعمك مجاناً
              </Link>
            </li>
            <li>
              <Link href="/for-restaurants#pricing" className="hover:text-white">
                الإعلان والظهور المميز
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Go Out Syria — صُنع بحب في دمشق
      </div>
    </footer>
  );
}
