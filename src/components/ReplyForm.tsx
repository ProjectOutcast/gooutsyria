"use client";

import { useActionState } from "react";
import { replyToReview, type FormState } from "@/actions/restaurants";

export function ReplyForm({
  reviewId,
  existingReply,
}: {
  reviewId: string;
  existingReply: string | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    replyToReview,
    {}
  );

  return (
    <form action={formAction} className="mt-3 flex gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input
        name="reply"
        required
        defaultValue={existingReply ?? ""}
        placeholder="اكتب رداً عاماً على هذا التقييم…"
        className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 text-sm font-semibold"
      >
        {pending ? "…" : existingReply ? "تحديث الرد" : "رد"}
      </button>
      {state.error && (
        <p className="text-xs text-primary-700 self-center">{state.error}</p>
      )}
    </form>
  );
}
