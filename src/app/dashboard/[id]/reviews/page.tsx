import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import { RatingStars } from "@/components/RatingStars";
import { ReplyForm } from "@/components/ReplyForm";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "التقييمات" };

export default async function OwnerReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRestaurantOwnership(id);

  const reviews = await db.review.findMany({
    where: { restaurantId: id, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      {reviews.length === 0 && (
        <p className="text-sm text-stone-500 text-center py-8">
          لا توجد تقييمات منشورة بعد.
        </p>
      )}
      {reviews.map((rv) => (
        <div key={rv.id} className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{rv.user.name}</span>
            <span className="text-xs text-stone-400">{formatDateAr(rv.createdAt)}</span>
          </div>
          <div className="mt-1">
            <RatingStars value={rv.rating} />
          </div>
          <p className="text-sm text-stone-700 mt-2">{rv.text}</p>
          <ReplyForm reviewId={rv.id} existingReply={rv.ownerReply} />
        </div>
      ))}
    </div>
  );
}
