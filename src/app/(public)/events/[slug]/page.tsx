import { redirect, permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentCity } from "@/lib/current-city";

// Event detail moved under the city path. Resolve the event's city and
// 308-redirect to its canonical URL; fall back to the current city's list.
export default async function EventSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = await db.event.findUnique({ where: { slug }, include: { city: true } });
  if (!e) redirect(`/${await getCurrentCity()}/events`);
  permanentRedirect(`/${e.city.slug}/events/${slug}`);
}
