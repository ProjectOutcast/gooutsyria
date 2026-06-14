"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { isActiveCity } from "@/lib/cities";

export type NavLink = { href: string; label: string; match: string; highlight?: boolean };

/** Main nav links for a given city. */
export function navLinks(city: string): NavLink[] {
  return [
    { href: `/${city}/restaurants`, label: "المطاعم", match: "restaurants" },
    { href: `/${city}/restaurants?features=workspace`, label: "مساحات العمل", match: "features=workspace" },
    { href: `/${city}/categories`, label: "تصفّح حسب المطبخ", match: "/categories" },
    { href: `/${city}/events`, label: "الفعاليات", match: "/events", highlight: true },
  ];
}

function NavInner({ onDark, city: cityProp }: { onDark: boolean; city: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}?${searchParams.toString()}`;
  // URL is the source of truth on the client (the shared layout's header is not
  // re-rendered on client-side navigation between cities); fall back to the
  // server-resolved city on non-city pages.
  const seg = pathname.split("/")[1];
  const city = isActiveCity(seg) ? seg : cityProp;

  return (
    <nav className={`hidden lg:flex items-center gap-6 text-[15px] font-medium ${onDark ? "text-white/85" : "text-ink2"}`}>
      {navLinks(city).map((l) => {
        const active = l.match.includes("=")
          ? current.includes(l.match)
          : pathname.includes(l.match) && !current.includes("features=");
        if (l.highlight) {
          return (
            <Link
              key={l.label}
              href={l.href}
              className="inline-flex items-center h-[67px] px-5 bg-[linear-gradient(120deg,#E14434,#E0902B)] text-white font-bold hover:brightness-110 transition"
            >
              {l.label}
            </Link>
          );
        }
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

export function MainNav({ onDark = false, city }: { onDark?: boolean; city: string }) {
  return (
    <Suspense fallback={<nav className="hidden lg:block" />}>
      <NavInner onDark={onDark} city={city} />
    </Suspense>
  );
}
