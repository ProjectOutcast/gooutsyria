import Link from "next/link";
import { MainNav } from "./MainNav";
import { HeaderActions } from "./HeaderActions";

function Logo({ city }: { city: string }) {
  return (
    <Link href={`/${city}`} className="flex items-center gap-2.5 shrink-0">
      <span className="w-[38px] h-[38px] rounded-xl bg-primary-500 grid place-items-center shadow-accent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-bold text-[20px] text-white">
          Go Out <span className="text-primary-300">Syria</span>
        </span>
        <span className="hidden sm:block text-[10px] mt-1 text-white/60">دليل مطاعم سوريا</span>
      </span>
    </Link>
  );
}

export function HeaderShell({
  user,
  city,
}: {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  city: string;
}) {
  return (
    <header className="sticky top-0 z-40 h-[67px] bg-ink border-b border-white/10">
      <div className="px-5 sm:px-8 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Logo city={city} />
          <MainNav onDark city={city} />
        </div>
        <HeaderActions user={user} onDark city={city} />
      </div>
    </header>
  );
}
