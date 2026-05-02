"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function Tracker() {
  const pathname = usePathname();
  const last = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (last.current && last.current.path === pathname && now - last.current.at < 3000) return;
    last.current = { path: pathname, at: now };
    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}

