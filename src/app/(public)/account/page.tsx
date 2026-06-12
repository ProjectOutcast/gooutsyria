import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { logoutAction } from "@/actions/auth";
import { RatingStars } from "@/components/RatingStars";
import { formatDateAr } from "@/lib/format";

export const metadata: Metadata = {
  title: "حسابي",
  robots: { index: false },
};

const REVIEW_STATUS_AR = {
  PENDING: "بانتظار المراجعة",
  APPROVED: "منشور",
  REJECTED: "مرفوض",
} as const;

export default async function AccountPage() {
  const user = await requireUser();
  const reviews = await db.review.findMany({
    where: { userId: user.id },
    include: { restaurant: { select: { nameAr: true, slug: true, city: { select: { slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-stone-500">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 hover:border-primary-500"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>

      <h2 className="text-lg font-bold mt-10 mb-4">تقييماتي ({reviews.length})</h2>
      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-stone-500">
            لم تكتب أي تقييم بعد —{" "}
            <Link href="/damascus/restaurants" className="text-primary-700 hover:underline">
              اكتشف الأماكن وشارك تجربتك
            </Link>
          </p>
        )}
        {reviews.map((rv) => (
          <div key={rv.id} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/${rv.restaurant.city.slug}/restaurant/${rv.restaurant.slug}`}
                className="font-semibold hover:text-primary-700"
              >
                {rv.restaurant.nameAr}
              </Link>
              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  rv.status === "APPROVED"
                    ? "bg-green-50 text-green-700"
                    : rv.status === "PENDING"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-stone-100 text-stone-500"
                }`}
              >
                {REVIEW_STATUS_AR[rv.status]}
              </span>
            </div>
            <div className="mt-1">
              <RatingStars value={rv.rating} />
            </div>
            <p className="text-sm text-stone-600 mt-1.5">{rv.text}</p>
            <p className="text-xs text-stone-400 mt-2">{formatDateAr(rv.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
