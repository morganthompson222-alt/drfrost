import Link from "next/link";
import { getAllGamesResult } from "@/lib/games";
import { getAdminStats } from "@/lib/stats";

export default async function AdminPage() {
  const res = await getAllGamesResult();
  const stats = await getAdminStats();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? "—";
  const env = process.env.VERCEL_ENV ?? "—";
  const url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "—";

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
  const slotHome = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BANNER ?? "";
  const slotInline = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE ?? "";
  const slotPlay = process.env.NEXT_PUBLIC_ADSENSE_SLOT_PLAY_BANNER ?? "";

  const adsEnabled = Boolean(client && (slotHome || slotInline || slotPlay));

  return (
    <>
      <header className="header">
        <div className="container headerRow">
          <Link href="/" className="brand" aria-label="Home">
            DR<span>FROST</span>
          </Link>
          <span className="pill">Admin</span>
          <div style={{ marginLeft: "auto" }} />
          <Link className="btn" href="/">
            Back
          </Link>
        </div>
      </header>

      <main className="container content">
        <div className="pageTitle">Admin Dashboard</div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">Games</div>
              <div className="tileMeta">Source: {res.source}</div>
              <div style={{ fontSize: 34, fontWeight: 900, marginTop: 10 }}>{res.games.length}</div>
            </div>
          </div>

          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">Deployment</div>
              <div className="tileMeta">Env: {env}</div>
              <div className="tileMeta">Commit: {commit}</div>
              <div className="tileMeta" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                URL: {url}
              </div>
            </div>
          </div>

          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">Ads</div>
              <div className="tileMeta">Configured: {adsEnabled ? "Yes" : "No"}</div>
              <div className="tileMeta">Client: {client ? "Set" : "Missing"}</div>
              <div className="tileMeta">Home Banner Slot: {slotHome ? "Set" : "Missing"}</div>
              <div className="tileMeta">Home Inline Slot: {slotInline ? "Set" : "Missing"}</div>
              <div className="tileMeta">Play Banner Slot: {slotPlay ? "Set" : "Missing"}</div>
            </div>
          </div>

          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">Tracking</div>
              <div className="tileMeta">In-app stats: {stats.enabled ? "On" : "Off"}</div>
              <div className="tileMeta">Today ({stats.day}) pageviews: {stats.pageviewsToday ?? "—"}</div>
              <div className="tileMeta">Today ({stats.day}) visitors: {stats.uniqueVisitorsToday ?? "—"}</div>
              <div className="tileMeta">Total pageviews: {stats.pageviewsTotal ?? "—"}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">AdSense Setup</div>
              <div className="tileMeta">Set these Environment Variables in Vercel → Project → Settings → Environment Variables</div>
              <pre
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "rgba(0,0,0,.28)",
                  overflowX: "auto",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
{`NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_HOME_BANNER=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_PLAY_BANNER=1234567890`}
              </pre>
            </div>
          </div>

          <div className="tile" style={{ width: "auto" }}>
            <div className="tileInfo">
              <div className="tileTitle">In-app Tracking Setup</div>
              <div className="tileMeta">Optional: store visitor/pageview counts in Upstash Redis for this admin page</div>
              <pre
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "rgba(0,0,0,.28)",
                  overflowX: "auto",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
{`UPSTASH_REDIS_REST_URL=https://xxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
