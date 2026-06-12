import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminHome() {
  const [
    pendingRestaurants,
    approvedRestaurants,
    pendingClaims,
    pendingReviews,
    totalUsers,
    activeOffers,
  ] = await Promise.all([
    db.restaurant.count({ where: { status: "PENDING" } }),
    db.restaurant.count({ where: { status: "APPROVED" } }),
    db.ownerClaim.count({ where: { status: "PENDING" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.user.count(),
    db.offer.count({
      where: { active: true, endsAt: { gte: new Date() } },
    }),
  ]);

  const cards = [
    ["مطاعم بانتظار الموافقة", pendingRestaurants, "/admin/restaurants?status=PENDING", true],
    ["طلبات ملكية معلّقة", pendingClaims, "/admin/claims", true],
    ["تقييمات بانتظار المراجعة", pendingReviews, "/admin/reviews", true],
    ["مطاعم منشورة", approvedRestaurants, "/admin/restaurants", false],
    ["عروض نشطة", activeOffers, "/admin/restaurants", false],
    ["المستخدمون", totalUsers, "/admin/users", false],
  ] as const;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([label, count, href, urgent]) => (
          <Link
            key={label}
            href={href}
            className={`rounded-2xl p-5 border transition hover:shadow-md ${
              urgent && count > 0
                ? "bg-amber-50 border-amber-300"
                : "bg-white border-stone-200"
            }`}
          >
            <div className="text-3xl font-bold ltr-nums">{count}</div>
            <div className="text-sm text-stone-600 mt-1">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
