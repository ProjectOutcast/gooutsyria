"use client";

import { useActionState } from "react";
import { uploadPhoto } from "@/actions/photos";
import type { FormState } from "@/actions/restaurants";

export function PhotoUploadForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    uploadPhoto,
    {}
  );

  return (
    <form
      action={formAction}
      className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center gap-3"
    >
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="text-sm flex-1 min-w-48"
      />
      <select
        name="kind"
        className="border border-stone-300 rounded-lg px-2 py-1.5 text-sm bg-white"
        defaultValue="FOOD"
      >
        <option value="FOOD">طعام</option>
        <option value="INTERIOR">الديكور الداخلي</option>
        <option value="EXTERIOR">الواجهة</option>
        <option value="MENU">قائمة الطعام</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 text-sm font-semibold"
      >
        {pending ? "جارٍ الرفع…" : "رفع الصورة"}
      </button>
      {state.error && (
        <p className="text-sm text-primary-700 w-full">{state.error}</p>
      )}
    </form>
  );
}
