import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-primary-700">
            Go Out <span className="text-accent-600">Syria</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-stone-700">
          <Link href="/damascus/restaurants" className="hover:text-primary-700">
            المطاعم
          </Link>
          <Link href="/damascus/collections" className="hover:text-primary-700">
            قوائم مختارة
          </Link>
          <Link href="/damascus/offers" className="hover:text-primary-700">
            العروض
          </Link>
          <Link href="/for-restaurants" className="hover:text-primary-700">
            لأصحاب المطاعم
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-stone-600 hover:text-primary-700"
                >
                  الإدارة
                </Link>
              )}
              {(user.role === "OWNER" || user.role === "ADMIN") && (
                <Link
                  href="/dashboard"
                  className="text-stone-600 hover:text-primary-700"
                >
                  لوحتي
                </Link>
              )}
              <Link
                href="/account"
                className="font-semibold text-stone-800 hover:text-primary-700 max-w-28 truncate"
              >
                {user.name ?? "حسابي"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-700 hover:text-primary-700">
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-3 py-1.5 font-semibold"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
