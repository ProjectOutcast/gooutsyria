"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./MainNav";
import { logoutAction } from "@/actions/auth";

const CITIES: { name: string; href?: string; soon?: boolean }[] = [
  { name: "دمشق", href: "/damascus/restaurants" },
  { name: "حلب", soon: true },
  { name: "حمص", soon: true },
  { name: "اللاذقية", soon: true },
];

const ACCOUNT_LINKS: { href: string; label: string; icon: AccountIconName }[] = [
  { href: "/account#saved", label: "أماكني المفضّلة", icon: "bookmark" },
  { href: "/account#reviews", label: "تقييماتي", icon: "star" },
  { href: "/account#settings", label: "تعديل معلومات الحساب", icon: "edit" },
];

type AccountIconName = "bookmark" | "star" | "edit" | "dashboard" | "admin" | "logout";

function AccountIcon({ name }: { name: AccountIconName }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "star") {
    return (
      <svg {...common} fill="currentColor" stroke="none" className="text-star">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="none" stroke="currentColor">
      {name === "bookmark" && <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />}
      {name === "edit" && (
        <>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
        </>
      )}
      {name === "dashboard" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </>
      )}
      {name === "admin" && <path d="M12 3l8 4v5c0 5-3.4 7.6-8 9-4.6-1.4-8-4-8-9V7z" />}
      {name === "logout" && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </>
      )}
    </svg>
  );
}

export function HeaderActions({
  user,
  onDark,
}: {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  onDark: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // close menus on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setCityOpen(false);
    setAccountOpen(false);
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
  const dropdownItem =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold text-ink hover:bg-primary-50 transition-colors";

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
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            aria-expanded={accountOpen}
            aria-label="حسابي"
            className={`grid place-items-center w-10 h-10 rounded-full overflow-hidden transition ${
              onDark ? "ring-1 ring-white/25 hover:ring-white/60" : "ring-1 ring-hairline2 hover:ring-primary-300"
            }`}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={`grid place-items-center w-full h-full ${onDark ? "bg-white/15 text-white" : "bg-chipbg text-ink"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>
            )}
          </button>
          {accountOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
              <div className="absolute end-0 mt-2 z-20 w-64 bg-white border border-hairline rounded-xl shadow-card p-1.5">
                <div className="px-2.5 py-2">
                  <p className="text-[14px] font-bold text-ink truncate">{user.name ?? "حسابي"}</p>
                  {user.email && <p className="text-[12px] text-muted2 truncate" dir="ltr">{user.email}</p>}
                </div>
                <div className="h-px bg-hairline my-1" />
                {ACCOUNT_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className={dropdownItem}>
                    <span className="text-muted"><AccountIcon name={l.icon} /></span>
                    {l.label}
                  </Link>
                ))}
                {isStaff && (
                  <>
                    <div className="h-px bg-hairline my-1" />
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className={dropdownItem}>
                        <span className="text-muted"><AccountIcon name="admin" /></span>
                        الإدارة
                      </Link>
                    )}
                    <Link href="/dashboard" className={dropdownItem}>
                      <span className="text-muted"><AccountIcon name="dashboard" /></span>
                      لوحتي
                    </Link>
                  </>
                )}
                <div className="h-px bg-hairline my-1" />
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold text-warn hover:bg-warn/5 transition-colors"
                  >
                    <AccountIcon name="logout" />
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
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
          <div className="absolute inset-x-0 top-0 bg-ink rounded-b-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-[67px] border-b border-white/10">
              <span className="font-bold text-white">القائمة</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق"
                className="grid place-items-center w-9 h-9 rounded-lg text-white/70 hover:text-white"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-5 py-1">
              {NAV_LINKS.map((l) =>
                l.highlight ? (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="flex items-center my-2 py-3 px-3 bg-[linear-gradient(120deg,#E14434,#E0902B)] text-white text-[16px] font-bold"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="block py-3 text-[16px] font-semibold text-white/85 border-b border-white/10"
                  >
                    {l.label}
                  </Link>
                )
              )}
              {user &&
                ACCOUNT_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block py-3 text-[16px] font-semibold text-white/85 border-b border-white/10"
                  >
                    {l.label}
                  </Link>
                ))}
              {isStaff && (
                <>
                  {user!.role === "ADMIN" && (
                    <Link href="/admin" className="block py-3 text-[16px] font-semibold text-white/85 border-b border-white/10">
                      الإدارة
                    </Link>
                  )}
                  <Link href="/dashboard" className="block py-3 text-[16px] font-semibold text-white/85 border-b border-white/10">
                    لوحتي
                  </Link>
                </>
              )}
            </nav>
            <div className="p-5 flex flex-col gap-2.5">
              <Link
                href="/for-restaurants"
                className="flex items-center justify-center bg-white text-ink hover:bg-white/90 rounded-xl px-4 py-3 text-[15px] font-bold transition-colors"
              >
                أضف مطعمك
              </Link>
              {user ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center border border-white/15 text-primary-300 rounded-xl px-4 py-3 text-[15px] font-semibold"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center border border-white/15 text-white rounded-xl px-4 py-3 text-[15px] font-semibold"
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
