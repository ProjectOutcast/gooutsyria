import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentCity } from "@/lib/current-city";
import { HeaderShell } from "./HeaderShell";

export async function Header() {
  const [session, city] = await Promise.all([auth(), getCurrentCity()]);
  const uid = session?.user?.id;

  let user = null;
  if (uid) {
    // read fresh from the DB so name/avatar reflect account edits immediately
    const dbUser = await db.user.findUnique({
      where: { id: uid },
      select: { name: true, email: true, image: true, role: true },
    });
    if (dbUser) {
      user = {
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role as string,
      };
    }
  }

  return <HeaderShell user={user} city={city} />;
}
