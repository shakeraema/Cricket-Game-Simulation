import { NextResponse } from "next/server";

function buildCorsHeaders(request) {
  const requestOrigin = request.headers.get("origin");
  const requestHeaders =
    request.headers.get("access-control-request-headers") ||
    "Content-Type, Authorization, X-Requested-With";
  const isPrivateNetworkRequest =
    request.headers.get("access-control-request-private-network") === "true";

  // Reflect explicit origins; fallback to wildcard for non-browser callers.
  const allowOrigin = requestOrigin || "*";
  const allowCredentials = requestOrigin ? "true" : "false";

  const headers = new Headers({
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": requestHeaders,
    "Access-Control-Allow-Credentials": allowCredentials,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  });

  if (isPrivateNetworkRequest) {
    headers.set("Access-Control-Allow-Private-Network", "true");
  }

  return headers;
}

export function middleware(req) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();
  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};

