import Link from "next/link";
import { Header } from "@/components/Header";
import { requireAdmin } from "@/lib/guards";

export const metadata = {
  title: { default: "الإدارة", template: "%s | إدارة Go Out Syria" },
  robots: { index: false },
};

const NAV = [
  ["/admin", "الرئيسية"],
  ["/admin/restaurants", "المطاعم"],
  ["/admin/events", "الفعاليات"],
  ["/admin/claims", "طلبات الملكية"],
  ["/admin/reviews", "التقييمات"],
  ["/admin/collections", "القوائم المختارة"],
  ["/admin/featured", "الظهور المميز"],
  ["/admin/sponsors", "الرعايات"],
  ["/admin/taxonomy", "التصنيفات"],
  ["/admin/users", "المستخدمون"],
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none bg-white border border-stone-200 rounded-2xl p-1.5 mb-6">
            {NAV.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1.5 text-sm font-semibold text-stone-600 rounded-xl hover:bg-stone-100 hover:text-primary-700 whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>
    </>
  );
}
