import { isUpstashEnabled, upstash } from "@/lib/upstash";

function dayKey(d = new Date()) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type AdminStats = {
  enabled: boolean;
  day: string;
  pageviewsToday: number | null;
  uniqueVisitorsToday: number | null;
  pageviewsTotal: number | null;
};

export async function getAdminStats(): Promise<AdminStats> {
  const enabled = isUpstashEnabled();
  const day = dayKey();
  if (!enabled) {
    return { enabled, day, pageviewsToday: null, uniqueVisitorsToday: null, pageviewsTotal: null };
  }

  const [pvTotal, pvToday, uvToday] = await Promise.all([
    upstash<number>("get", "stats:pageviews:total"),
    upstash<number>("get", `stats:pageviews:${day}`),
    upstash<number>("scard", `stats:visitors:${day}`),
  ]);

  const toNum = (v: unknown) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim()) return Number(v);
    return null;
  };

  return {
    enabled,
    day,
    pageviewsToday: toNum(pvToday),
    uniqueVisitorsToday: toNum(uvToday),
    pageviewsTotal: toNum(pvTotal),
  };
}

