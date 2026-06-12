import Link from "next/link";
import { auth } from "@/lib/auth";
import { MainNav } from "./MainNav";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <span className="w-[38px] h-[38px] rounded-xl bg-primary-500 grid place-items-center shadow-accent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-bold text-[20px] text-ink">
          Go Out <span className="text-primary-500">Syria</span>
        </span>
        <span className="block text-[10px] text-muted mt-1">دليل مطاعم سوريا</span>
      </span>
    </Link>
  );
}

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-[67px] bg-page/90 backdrop-blur border-b border-hairline">
      <div className="max-w-[1240px] mx-auto px-7 h-full flex items-center justify-between gap-5">
        <div className="flex items-center gap-8 min-w-0">
          <Logo />
          <MainNav />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 bg-chipbg rounded-full px-3.5 py-1.5 text-sm font-medium text-ink">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            دمشق
          </span>

          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden md:block text-sm text-ink2 hover:text-primary-500 font-medium">
                  الإدارة
                </Link>
              )}
              {(user.role === "OWNER" || user.role === "ADMIN") && (
                <Link href="/dashboard" className="hidden md:block text-sm text-ink2 hover:text-primary-500 font-medium">
                  لوحتي
                </Link>
              )}
              <Link
                href="/account"
                className="bg-ink text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 max-w-32 truncate"
              >
                {user.name ?? "حسابي"}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-ink text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
