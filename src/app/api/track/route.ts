import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isUpstashEnabled, upstash } from "@/lib/upstash";

function dayKey(d = new Date()) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function track() {
  if (!isUpstashEnabled()) {
    return NextResponse.json({ ok: true, enabled: false }, { status: 200 });
  }

  const jar = await cookies();
  const existing = jar.get("vg_vid")?.value;
  const vid = existing && existing.length >= 16 ? existing : crypto.randomUUID();

  const day = dayKey();
  await Promise.all([
    upstash("incr", "stats:pageviews:total"),
    upstash("incr", `stats:pageviews:${day}`),
    upstash("sadd", `stats:visitors:${day}`, vid),
  ]);

  const res = NextResponse.json({ ok: true, enabled: true }, { status: 200 });
  if (vid !== existing) {
    res.cookies.set("vg_vid", vid, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}

export async function POST() {
  return track();
}

export async function GET() {
  return track();
}

