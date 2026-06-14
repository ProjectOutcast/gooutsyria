"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveCity, cityNameAr } from "@/lib/cities";

/** City-dependent footer links. Client component so they track the city in the
 * URL (the footer lives in the shared layout, which isn't re-rendered on
 * client-side city switches); falls back to the server-resolved city. */
export function FooterDiscover({ serverCity }: { serverCity: string }) {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  const city = isActiveCity(seg) ? seg : serverCity;
  const links: [string, string][] = [
    [`مطاعم ${cityNameAr(city)}`, `/${city}/restaurants`],
    ["قوائم مختارة", `/${city}/collections`],
    ["العروض الحالية", `/${city}/offers`],
    ["الفعاليات", `/${city}/events`],
    ["خريطة الأماكن", `/${city}/map`],
  ];
  return (
    <ul className="space-y-2.5 text-sm">
      {links.map(([label, href]) => (
        <li key={label}>
          <Link href={href} className="hover:text-white transition-colors">{label}</Link>
        </li>
      ))}
    </ul>
  );
}
