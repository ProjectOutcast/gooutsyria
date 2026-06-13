"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainNav } from "./MainNav";
import { HeaderActions } from "./HeaderActions";

function Logo({ onDark }: { onDark: boolean }) {
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
        <span className={`block font-bold text-[20px] ${onDark ? "text-white" : "text-ink"}`}>
          Go Out <span className={onDark ? "text-primary-300" : "text-primary-500"}>Syria</span>
        </span>
        <span className={`hidden sm:block text-[10px] mt-1 ${onDark ? "text-white/60" : "text-muted"}`}>
          دليل مطاعم سوريا
        </span>
      </span>
    </Link>
  );
}

export function HeaderShell({
  user,
}: {
  user: { name: string | null; role: string } | null;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 h-[67px] transition-colors duration-300 ${
        scrolled
          ? "bg-page/80 backdrop-blur-xl border-b border-hairline shadow-[0_2px_10px_rgba(20,13,11,0.05)]"
          : "bg-ink/50 backdrop-blur-md border-b border-white/10"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <Logo onDark={onDark} />
          <MainNav onDark={onDark} />
        </div>
        <HeaderActions user={user} onDark={onDark} />
      </div>
    </header>
  );
}
