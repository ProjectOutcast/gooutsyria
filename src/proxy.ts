import { NextResponse, type NextRequest } from "next/server";
import { ACTIVE_CITY_SLUGS, DEFAULT_CITY } from "./lib/cities";

/** City-awareness for the whole app:
 *  - resolves the current city (URL segment wins → saved cookie → default),
 *  - exposes it to server components via the `x-city` request header,
 *  - persists it in a cookie,
 *  - redirects the bare root `/` to the city home `/<city>`.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1] ?? "";
  const cookieCity = req.cookies.get("city")?.value;
  const current = ACTIVE_CITY_SLUGS.includes(seg)
    ? seg
    : cookieCity && ACTIVE_CITY_SLUGS.includes(cookieCity)
      ? cookieCity
      : DEFAULT_CITY;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${current}`, req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-city", current);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (cookieCity !== current) {
    res.cookies.set("city", current, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|api).*)"],
};
