"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const NAV_LINKS = [
  { href: "/damascus/restaurants", label: "المطاعم", match: "restaurants" },
  { href: "/damascus/restaurants?features=workspace", label: "مساحات العمل", match: "features=workspace" },
  { href: "/categories", label: "تصفّح حسب المطبخ", match: "/categories" },
  { href: "/events", label: "الفعاليات", match: "/events" },
  { href: "/contact", label: "اتصل بنا", match: "/contact" },
];

function NavInner({ onDark }: { onDark: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}?${searchParams.toString()}`;

  return (
    <nav className={`hidden lg:flex items-center gap-6 text-[15px] font-medium ${onDark ? "text-white/85" : "text-ink2"}`}>
      {NAV_LINKS.map((l) => {
        const active = l.match.includes("=")
          ? current.includes(l.match)
          : pathname.includes(l.match) && !current.includes("features=");
        return (
          <Link
            key={l.label}
            href={l.href}
            className={
              active
                ? onDark
                  ? "text-white font-semibold"
                  : "text-primary-500 font-semibold"
                : onDark
                  ? "hover:text-white"
                  : "hover:text-primary-500"
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainNav({ onDark = false }: { onDark?: boolean }) {
  return (
    <Suspense fallback={<nav className="hidden lg:block" />}>
      <NavInner onDark={onDark} />
    </Suspense>
  );
}
