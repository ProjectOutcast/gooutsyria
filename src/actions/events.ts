"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requireEventOwnership } from "@/lib/guards";
import { uniqueSlug } from "@/lib/slug";
import { parseEventForm } from "@/lib/events";
import { getCity } from "@/lib/queries";

export type FormState = { ok?: boolean; error?: string };

/** Organizer self-submits an event — created PENDING, awaiting admin approval. */
export async function submitEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const city = await getCity(String(formData.get("citySlug") ?? ""));
  if (!city) return { error: "اختر مدينة صحيحة" };

  const slug = await uniqueSlug(parsed.data.title, async (s) =>
    Boolean(await db.event.findUnique({ where: { slug: s } }))
  );

  await db.event.create({
    data: { ...parsed.data, slug, cityId: city.id, ownerId: user.id, status: "PENDING" },
  });
  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=event");
}

/** Owner edits an event they own. Cannot change status/featured/owner. */
export async function updateMyEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const eventId = String(formData.get("eventId") ?? "");
  const { event } = await requireEventOwnership(eventId);

  const parsed = parseEventForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  const city = await getCity(String(formData.get("citySlug") ?? ""));
  if (!city) return { error: "اختر مدينة صحيحة" };

  await db.event.update({ where: { id: event.id }, data: { ...parsed.data, cityId: city.id } });
  revalidatePath(`/dashboard/events/${event.id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath(`/events/${event.slug}`);
  return { ok: true };
}
