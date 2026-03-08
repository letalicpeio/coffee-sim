import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirigir raíz a /es
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/es";
    return NextResponse.redirect(url);
  }

  // Detectar /es o /en como primer segmento
  const seg = pathname.split("/")[1];
  const locale = seg === "en" ? "en" : seg === "es" ? "es" : null;

  const res = NextResponse.next();

  if (locale) {
    res.cookies.set("locale", locale, { path: "/" });
  }

  return res;
}

export const config = {
  matcher: ["/", "/es/:path*", "/en/:path*"],
};