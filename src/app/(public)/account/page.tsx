import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { db } from "@/lib/db";
import { RESTAURANT_CARD_INCLUDE } from "@/lib/queries";
import { logoutAction } from "@/actions/auth";
import { RatingStars } from "@/components/RatingStars";
import { RestaurantCard } from "@/components/RestaurantCard";
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
  const [reviews, saved] = await Promise.all([
    db.review.findMany({
      where: { userId: user.id },
      include: {
        restaurant: {
          select: { nameAr: true, slug: true, city: { select: { slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.savedPlace.findMany({
      where: { userId: user.id },
      include: { restaurant: { include: RESTAURANT_CARD_INCLUDE } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-[1240px] mx-auto px-7 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm border border-hairline bg-white rounded-xl px-4 py-2 hover:border-primary-500 transition"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">
        🔖 أماكني المحفوظة ({saved.length})
      </h2>
      {saved.length === 0 ? (
        <p className="text-sm text-ink2 bg-white border border-hairline rounded-2xl p-5">
          لم تحفظ أي مكان بعد — اضغط على أيقونة الحفظ على أي مطعم لإضافته هنا.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((s) => (
            <RestaurantCard key={s.id} restaurant={s.restaurant} variant="compact" saved />
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mt-12 mb-4">تقييماتي ({reviews.length})</h2>
      <div className="space-y-3 max-w-2xl">
        {reviews.length === 0 && (
          <p className="text-sm text-ink2">
            لم تكتب أي تقييم بعد —{" "}
            <Link href="/damascus/restaurants" className="text-primary-500 font-semibold hover:underline">
              اكتشف الأماكن وشارك تجربتك
            </Link>
          </p>
        )}
        {reviews.map((rv) => (
          <div key={rv.id} className="bg-white border border-hairline rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/${rv.restaurant.city.slug}/restaurant/${rv.restaurant.slug}`}
                className="font-semibold hover:text-primary-500"
              >
                {rv.restaurant.nameAr}
              </Link>
              <span
                className={`text-xs rounded-full px-2.5 py-0.5 ${
                  rv.status === "APPROVED"
                    ? "bg-success-tint text-success"
                    : rv.status === "PENDING"
                      ? "bg-primary-50 text-primary-700"
                      : "bg-chipbg text-muted"
                }`}
              >
                {REVIEW_STATUS_AR[rv.status]}
              </span>
            </div>
            <div className="mt-1">
              <RatingStars value={rv.rating} />
            </div>
            <p className="text-sm text-ink2 mt-1.5">{rv.text}</p>
            <p className="text-xs text-muted2 mt-2">{formatDateAr(rv.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
