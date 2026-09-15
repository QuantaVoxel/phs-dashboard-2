import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/inngest")
  ) {
    return NextResponse.next();
  }

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
