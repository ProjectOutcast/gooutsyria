import { auth } from "@/lib/auth";
import { HeaderShell } from "./HeaderShell";

export async function Header() {
  const session = await auth();
  const u = session?.user;
  const user = u ? { name: u.name ?? null, role: u.role } : null;

  return <HeaderShell user={user} />;
}
