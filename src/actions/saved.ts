"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type ToggleSavedResult = { saved?: boolean; needsLogin?: boolean };

export async function toggleSaved(
  restaurantId: string
): Promise<ToggleSavedResult> {
  const session = await auth();
  if (!session?.user?.id) return { needsLogin: true };
  const userId = session.user.id;

  const existing = await db.savedPlace.findUnique({
    where: { userId_restaurantId: { userId, restaurantId } },
  });
  if (existing) {
    await db.savedPlace.delete({ where: { id: existing.id } });
    return { saved: false };
  }
  try {
    await db.savedPlace.create({ data: { userId, restaurantId } });
  } catch {
    // double-click race — already saved
  }
  return { saved: true };
}
