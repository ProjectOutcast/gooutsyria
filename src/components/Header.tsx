import Link from "next/link";
import { auth } from "@/lib/auth";
import { MainNav } from "./MainNav";
import { HeaderActions } from "./HeaderActions";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <span className="w-[38px] h-[38px] rounded-xl bg-primary-500 grid place-items-center shadow-accent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-bold text-[20px] text-ink">
          Go Out <span className="text-primary-500">Syria</span>
        </span>
        <span className="hidden sm:block text-[10px] text-muted mt-1">دليل مطاعم سوريا</span>
      </span>
    </Link>
  );
}

export async function Header() {
  const session = await auth();
  const u = session?.user;
  const user = u ? { name: u.name ?? null, role: u.role } : null;

  return (
    <header className="sticky top-0 z-40 h-[67px] bg-page/80 backdrop-blur-xl border-b border-hairline shadow-[0_2px_10px_rgba(20,13,11,0.05)]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Logo />
          <MainNav />
        </div>
        <HeaderActions user={user} />
      </div>
    </header>
  );
}
