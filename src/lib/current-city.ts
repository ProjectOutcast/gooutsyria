import { headers, cookies } from "next/headers";
import { DEFAULT_CITY, isActiveCity } from "./cities";

/** Resolve the active city for the current request. Source of truth order:
 * the URL (surfaced by middleware as the `x-city` header) → the saved cookie
 * → the default. Used by the header/footer on every page so the nav, switcher
 * and links always reflect the city the visitor is browsing. */
export async function getCurrentCity(): Promise<string> {
  const fromHeader = (await headers()).get("x-city");
  if (isActiveCity(fromHeader)) return fromHeader;
  const fromCookie = (await cookies()).get("city")?.value;
  if (isActiveCity(fromCookie)) return fromCookie;
  return DEFAULT_CITY;
}
