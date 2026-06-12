"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/damascus/restaurants", label: "المطاعم", match: "restaurants" },
  { href: "/damascus/cuisine/cafe", label: "الكافيهات", match: "cuisine/cafe" },
  { href: "/damascus/restaurants?features=shisha", label: "الأراكيل", match: "features=shisha" },
  { href: "/damascus/offers", label: "العروض", match: "offers" },
  { href: "/damascus/restaurants?features=workspace", label: "مساحات العمل", match: "features=workspace" },
];

function NavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}?${searchParams.toString()}`;

  return (
    <nav className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-ink2">
      {LINKS.map((l) => {
        const active = l.match.includes("=")
          ? current.includes(l.match)
          : pathname.includes(l.match) && !current.includes("features=");
        return (
          <Link
            key={l.label}
            href={l.href}
            className={active ? "text-primary-500 font-semibold" : "hover:text-primary-500"}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainNav() {
  return (
    <Suspense fallback={<nav className="hidden lg:block" />}>
      <NavInner />
    </Suspense>
  );
}
