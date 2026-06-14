import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Returns the restaurant only if the current user owns it (or is an admin). */
export async function requireRestaurantOwnership(restaurantId: string) {
  const user = await requireUser();
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    include: { city: { select: { slug: true } } },
  });
  if (!restaurant) redirect("/dashboard");
  if (restaurant.ownerId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return { user, restaurant };
}

/** Returns the event only if the current user owns it (or is an admin). */
export async function requireEventOwnership(eventId: string) {
  const user = await requireUser();
  const event = await db.event.findUnique({ where: { id: eventId }, include: { city: true } });
  if (!event) redirect("/dashboard");
  if (event.ownerId !== user.id && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return { user, event };
}
