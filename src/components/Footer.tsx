import Link from "next/link";

const COLS: [string, [string, string][]][] = [
  [
    "اكتشف",
    [
      ["مطاعم دمشق", "/damascus/restaurants"],
      ["قوائم مختارة", "/damascus/collections"],
      ["العروض الحالية", "/damascus/offers"],
      ["خريطة الأماكن", "/damascus/map"],
    ],
  ],
  [
    "المدن",
    [
      ["دمشق", "/damascus/restaurants"],
      ["حلب — قريباً", "#"],
      ["حمص — قريباً", "#"],
      ["اللاذقية — قريباً", "#"],
    ],
  ],
  [
    "للأعمال",
    [
      ["أضف مطعمك مجاناً", "/for-restaurants"],
      ["الباقات والإعلان", "/for-restaurants#pricing"],
      ["لوحة صاحب المطعم", "/dashboard"],
    ],
  ],
];

export function Footer() {
  return (
    <footer className="bg-ink text-[#B7A79E] mt-20">
      <div className="max-w-[1240px] mx-auto px-7 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xl font-bold text-white mb-3">
            Go Out <span className="text-primary-300">Syria</span>
          </div>
          <p className="text-sm leading-relaxed">
            دليلك لاكتشاف أفضل المطاعم والكافيهات في سوريا — قوائم طعام،
            تقييمات حقيقية، وعروض حصرية. نبدأ من دمشق.
          </p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <h3 className="font-semibold text-white mb-4 text-sm">{title}</h3>
            <ul className="space-y-2.5 text-sm">
              {links.map(([label, href]) => (
                <li key={label}>
                  {href === "#" ? (
                    <span className="opacity-60">{label}</span>
                  ) : (
                    <Link href={href} className="hover:text-white transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Go Out Syria — صُنع بحب في دمشق
      </div>
    </footer>
  );
}
