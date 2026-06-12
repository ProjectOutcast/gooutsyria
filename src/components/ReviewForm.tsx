"use client";

import { useActionState, useState } from "react";
import { submitReview, type ReviewFormState } from "@/actions/reviews";

export function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    submitReview,
    {}
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.ok) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm">
        شكراً لك! تم استلام تقييمك وسيظهر بعد مراجعته من فريقنا.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl leading-none transition-colors ${
              n <= (hover || rating) ? "text-amber-500" : "text-stone-300"
            }`}
            aria-label={`${n} نجوم`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        name="text"
        rows={4}
        required
        minLength={10}
        placeholder="احكِ لنا عن تجربتك: الأكل، الخدمة، الأجواء، الأسعار…"
        className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      {state.error && (
        <p className="text-sm text-primary-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending || rating === 0}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-semibold"
      >
        {pending ? "جارٍ الإرسال…" : "نشر التقييم"}
      </button>
      {rating === 0 && (
        <span className="text-xs text-stone-400 ms-3">اختر عدد النجوم أولاً</span>
      )}
    </form>
  );
}
