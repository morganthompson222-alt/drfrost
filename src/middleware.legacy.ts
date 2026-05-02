import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(request: NextRequest) {
  return proxy(request);
}
