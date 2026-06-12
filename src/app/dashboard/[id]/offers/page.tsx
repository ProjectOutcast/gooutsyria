import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import { toggleOffer } from "@/actions/restaurants";
import { OfferForm } from "@/components/OfferForm";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "العروض" };

export default async function OffersManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { restaurant } = await requireRestaurantOwnership(id);

  const offers = await db.offer.findMany({
    where: { restaurantId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <OfferForm restaurantId={id} />
      {restaurant.tier === "FREE" && (
        <p className="text-xs text-stone-500">
          الباقة المجانية تسمح بعرض واحد نشط في نفس الوقت — باقة PRO تمنحك
          عروضاً غير محدودة.
        </p>
      )}
      <div className="space-y-3">
        {offers.map((o) => {
          const expired = o.endsAt < new Date();
          return (
            <div
              key={o.id}
              className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 ${
                o.active && !expired ? "border-accent-500/50" : "border-stone-200 opacity-70"
              }`}
            >
              <div>
                <div className="font-bold">{o.titleAr}</div>
                {o.descAr && <div className="text-sm text-stone-600">{o.descAr}</div>}
                <div className="text-xs text-stone-400 mt-1">
                  {formatDateAr(o.startsAt)} ← {formatDateAr(o.endsAt)}
                  {expired && " — منتهي"}
                </div>
              </div>
              {!expired && (
                <form action={toggleOffer}>
                  <input type="hidden" name="offerId" value={o.id} />
                  <button
                    type="submit"
                    className={`text-sm rounded-lg px-3 py-1.5 border font-semibold ${
                      o.active
                        ? "border-stone-300 text-stone-600 hover:border-primary-500"
                        : "bg-primary-600 text-white border-primary-600 hover:bg-primary-700"
                    }`}
                  >
                    {o.active ? "إيقاف" : "تفعيل"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
