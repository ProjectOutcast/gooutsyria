import Image from "next/image";
import { requireRestaurantOwnership } from "@/lib/guards";
import { db } from "@/lib/db";
import { deletePhoto } from "@/actions/photos";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";

export const metadata = { title: "الصور" };

const KIND_AR = {
  EXTERIOR: "الواجهة",
  INTERIOR: "الديكور",
  FOOD: "طعام",
  MENU: "القائمة",
} as const;

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRestaurantOwnership(id);

  const photos = await db.photo.findMany({
    where: { restaurantId: id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <PhotoUploadForm restaurantId={id} />
      <p className="text-xs text-stone-500">
        💡 نصيحة: ابدأ بصورة الواجهة، ثم الديكور الداخلي، ثم أشهى أطباقك —
        الصور الجيدة تضاعف زيارات صفحتك. ({photos.length}/12)
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative group rounded-xl overflow-hidden bg-stone-100 aspect-[4/3]">
            <Image
              src={p.url}
              alt={p.alt ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
            <span className="absolute bottom-1 start-1 bg-stone-900/70 text-white text-[11px] rounded px-1.5 py-0.5">
              {KIND_AR[p.kind]}
            </span>
            <form action={deletePhoto} className="absolute top-1 end-1">
              <input type="hidden" name="photoId" value={p.id} />
              <button
                type="submit"
                className="bg-white/90 hover:bg-primary-600 hover:text-white text-stone-700 rounded-full w-7 h-7 text-sm font-bold"
                title="حذف"
              >
                ✕
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
