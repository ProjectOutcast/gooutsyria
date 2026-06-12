"use client";

import { useActionState } from "react";
import {
  updateRestaurantProfile,
  type FormState,
} from "@/actions/restaurants";
import { DAY_NAMES_AR, PRICE_BAND_LABELS } from "@/lib/format";

const inputCls =
  "w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
const labelCls = "block text-sm font-semibold text-stone-700 mb-1";

type Option = { id: string; nameAr: string; icon?: string | null };

export function EditProfileForm({
  restaurant,
  neighborhoods,
  cuisines,
  features,
  selectedCuisines,
  selectedFeatures,
  openingHours,
}: {
  restaurant: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    description: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    address: string | null;
    neighborhoodId: string | null;
    lat: number | null;
    lng: number | null;
    priceBand: string;
  };
  neighborhoods: Option[];
  cuisines: Option[];
  features: Option[];
  selectedCuisines: string[];
  selectedFeatures: string[];
  openingHours: Record<string, { open: string; close: string } | null>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateRestaurantProfile,
    {}
  );

  return (
    <form action={formAction} className="space-y-6 bg-white border border-stone-200 rounded-2xl p-6">
      <input type="hidden" name="restaurantId" value={restaurant.id} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>اسم المطعم *</label>
          <input name="nameAr" required defaultValue={restaurant.nameAr} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>الاسم بالإنكليزية</label>
          <input name="nameEn" defaultValue={restaurant.nameEn ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>الهاتف</label>
          <input name="phone" defaultValue={restaurant.phone ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>واتساب</label>
          <input name="whatsapp" defaultValue={restaurant.whatsapp ?? ""} className={inputCls} dir="ltr" placeholder="+963..." />
        </div>
        <div>
          <label className={labelCls}>الحي</label>
          <select name="neighborhoodId" defaultValue={restaurant.neighborhoodId ?? ""} className={inputCls}>
            <option value="">— غير محدد —</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>{n.nameAr}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>فئة الأسعار</label>
          <select name="priceBand" defaultValue={restaurant.priceBand} className={inputCls}>
            {Object.entries(PRICE_BAND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>العنوان التفصيلي</label>
          <input name="address" defaultValue={restaurant.address ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>خط العرض (lat)</label>
          <input name="lat" defaultValue={restaurant.lat ?? ""} className={inputCls} dir="ltr" placeholder="33.51" />
        </div>
        <div>
          <label className={labelCls}>خط الطول (lng)</label>
          <input name="lng" defaultValue={restaurant.lng ?? ""} className={inputCls} dir="ltr" placeholder="36.29" />
        </div>
        <div>
          <label className={labelCls}>الموقع الإلكتروني</label>
          <input name="website" defaultValue={restaurant.website ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>إنستغرام</label>
          <input name="instagram" defaultValue={restaurant.instagram ?? ""} className={inputCls} dir="ltr" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>نبذة عن المكان</label>
          <textarea name="description" rows={4} defaultValue={restaurant.description ?? ""} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>المطابخ</label>
        <div className="flex flex-wrap gap-2">
          {cuisines.map((c) => (
            <label key={c.id} className="flex items-center gap-1.5 text-sm bg-stone-50 border border-stone-200 rounded-full px-3 py-1 cursor-pointer has-checked:bg-primary-50 has-checked:border-primary-400">
              <input
                type="checkbox"
                name="cuisineIds"
                value={c.id}
                defaultChecked={selectedCuisines.includes(c.id)}
                className="accent-primary-600"
              />
              {c.icon} {c.nameAr}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>المزايا</label>
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <label key={f.id} className="flex items-center gap-1.5 text-sm bg-stone-50 border border-stone-200 rounded-full px-3 py-1 cursor-pointer has-checked:bg-primary-50 has-checked:border-primary-400">
              <input
                type="checkbox"
                name="featureIds"
                value={f.id}
                defaultChecked={selectedFeatures.includes(f.id)}
                className="accent-primary-600"
              />
              {f.icon} {f.nameAr}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>أوقات الدوام (اتركه فارغاً ليوم الإغلاق)</label>
        <div className="space-y-2">
          {DAY_NAMES_AR.map((day, i) => {
            const h = openingHours[String(i)];
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-stone-600">{day}</span>
                <input
                  type="time"
                  name={`open_${i}`}
                  defaultValue={h?.open ?? ""}
                  className="border border-stone-300 rounded-lg px-2 py-1"
                />
                <span className="text-stone-400">إلى</span>
                <input
                  type="time"
                  name={`close_${i}`}
                  defaultValue={h?.close ?? ""}
                  className="border border-stone-300 rounded-lg px-2 py-1"
                />
              </div>
            );
          })}
        </div>
      </div>

      {state.error && <p className="text-sm text-primary-700">{state.error}</p>}
      {state.ok && (
        <p className="text-sm text-green-700">✓ تم حفظ التعديلات بنجاح</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl px-8 py-2.5 font-bold"
      >
        {pending ? "جارٍ الحفظ…" : "حفظ التعديلات"}
      </button>
    </form>
  );
}
