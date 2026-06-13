"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./MainNav";

const CITIES: { name: string; href?: string; soon?: boolean }[] = [
  { name: "دمشق", href: "/damascus/restaurants" },
  { name: "حلب", soon: true },
  { name: "حمص", soon: true },
  { name: "اللاذقية", soon: true },
];

export function HeaderActions({
  user,
  onDark,
}: {
  user: { name: string | null; role: string } | null;
  onDark: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  // close menus on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setCityOpen(false);
  }, [pathname]);

  const isStaff = user && (user.role === "OWNER" || user.role === "ADMIN");
  const ghostChip = onDark
    ? "bg-white/15 hover:bg-white/25 text-white"
    : "bg-chipbg hover:bg-hairline2 text-ink";
  const pinIcon = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      {/* City selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setCityOpen((o) => !o)}
          aria-expanded={cityOpen}
          className={`flex items-center gap-1.5 rounded-full ps-3 pe-2.5 py-1.5 text-[13px] font-semibold transition-colors ${ghostChip}`}
        >
          {pinIcon}
          دمشق
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${onDark ? "text-white/70" : "text-muted2"} ${cityOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {cityOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
            <div className="absolute end-0 mt-2 z-20 w-44 bg-white border border-hairline rounded-xl shadow-card p-1.5">
              <p className="px-2.5 py-1 text-[11px] font-semibold text-muted2">اختر المدينة</p>
              {CITIES.map((c) =>
                c.href ? (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[14px] font-semibold text-ink bg-primary-50"
                  >
                    {c.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </Link>
                ) : (
                  <span
                    key={c.name}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[14px] text-muted2 cursor-not-allowed"
                  >
                    {c.name}
                    <span className="text-[10px] bg-chipbg rounded-full px-1.5 py-0.5">قريباً</span>
                  </span>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Desktop primary CTA + account/login */}
      <Link
        href="/for-restaurants"
        className={`hidden lg:inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
          onDark ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-primary-700"
        }`}
      >
        أضف مطعمك
      </Link>
      {user ? (
        <Link
          href="/account"
          className={`hidden lg:inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-semibold max-w-32 truncate transition-colors ${ghostChip}`}
        >
          {user.name ?? "حسابي"}
        </Link>
      ) : (
        <Link
          href="/login"
          className={`hidden lg:inline-flex items-center text-sm font-semibold px-2 transition-colors ${
            onDark ? "text-white/90 hover:text-white" : "text-ink2 hover:text-primary-500"
          }`}
        >
          تسجيل الدخول
        </Link>
      )}

      {/* Mobile burger */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="القائمة"
        className={`lg:hidden grid place-items-center w-10 h-10 rounded-xl transition-colors ${ghostChip}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Mobile menu sheet */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-x-0 top-0 bg-page rounded-b-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-[67px] border-b border-hairline">
              <span className="font-bold text-ink">القائمة</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق"
                className="grid place-items-center w-9 h-9 rounded-lg text-ink2 hover:text-ink"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-5 py-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="block py-3 text-[16px] font-semibold text-ink border-b border-hairline/60"
                >
                  {l.label}
                </Link>
              ))}
              {isStaff && (
                <>
                  {user!.role === "ADMIN" && (
                    <Link href="/admin" className="block py-3 text-[16px] font-semibold text-ink border-b border-hairline/60">
                      الإدارة
                    </Link>
                  )}
                  <Link href="/dashboard" className="block py-3 text-[16px] font-semibold text-ink border-b border-hairline/60">
                    لوحتي
                  </Link>
                </>
              )}
            </nav>
            <div className="p-5 flex flex-col gap-2.5">
              <Link
                href="/for-restaurants"
                className="flex items-center justify-center bg-ink text-white rounded-xl px-4 py-3 text-[15px] font-bold"
              >
                أضف مطعمك
              </Link>
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center justify-center bg-chipbg text-ink rounded-xl px-4 py-3 text-[15px] font-semibold"
                >
                  {user.name ?? "حسابي"}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center border border-hairline2 text-ink rounded-xl px-4 py-3 text-[15px] font-semibold"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
