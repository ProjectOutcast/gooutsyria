import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryCard } from "@/components/CategoryCard";
import { Chevron } from "@/components/Chevron";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "كل التصنيفات — Go Out Syria",
  description:
    "تصفّح كل تصنيفات المطاعم والكافيهات في سوريا — مشاوي، شامي أصيل، إيطالي، مأكولات بحرية، حلويات، وأكثر.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const cuisines = await db.cuisine.findMany({
    orderBy: { nameAr: "asc" },
    include: {
      _count: {
        select: { restaurants: { where: { restaurant: { status: "APPROVED" } } } },
      },
    },
  });
  const sorted = [...cuisines].sort(
    (a, b) => b._count.restaurants - a._count.restaurants
  );

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-7">
      <nav className="text-[13px] text-muted mb-3" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-primary-500">الرئيسية</Link>
        <Chevron dir="left" size={13} className="mx-1.5 inline-block align-middle" />
        <span className="text-ink font-semibold">التصنيفات</span>
      </nav>

      <h1 className="text-[30px] font-bold">كل التصنيفات</h1>
      <p className="text-ink2 text-[15px] mt-1 mb-7">
        اختر نوع المطبخ لاستكشاف أفضل المطاعم والكافيهات في كل تصنيف.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((c) => (
          <CategoryCard
            key={c.id}
            slug={c.slug}
            nameAr={c.nameAr}
            count={c._count.restaurants}
            href={`/damascus/cuisine/${c.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
