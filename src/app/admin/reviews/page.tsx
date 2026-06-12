import { db } from "@/lib/db";
import { decideReview } from "@/actions/admin";
import { RatingStars } from "@/components/RatingStars";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "مراجعة التقييمات" };

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    where: { status: "PENDING" },
    include: {
      restaurant: { select: { nameAr: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">
        تقييمات بانتظار المراجعة ({reviews.length})
      </h1>
      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-stone-500">لا توجد تقييمات معلّقة 🎉</p>
        )}
        {reviews.map((rv) => (
          <div key={rv.id} className="bg-white border border-stone-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm flex-1 min-w-60">
                <div className="font-bold">{rv.restaurant.nameAr}</div>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars value={rv.rating} />
                  <span className="text-xs text-stone-500">
                    {rv.user.name} · {formatDateAr(rv.createdAt)}
                  </span>
                </div>
                <p className="text-stone-700 mt-2">{rv.text}</p>
              </div>
              <div className="flex gap-2">
                <form action={decideReview}>
                  <input type="hidden" name="id" value={rv.id} />
                  <input type="hidden" name="decision" value="approve" />
                  <button className="text-xs rounded-lg px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 font-semibold">
                    نشر
                  </button>
                </form>
                <form action={decideReview}>
                  <input type="hidden" name="id" value={rv.id} />
                  <input type="hidden" name="decision" value="reject" />
                  <button className="text-xs rounded-lg px-3 py-1.5 border border-stone-300 hover:border-primary-500">
                    رفض
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
