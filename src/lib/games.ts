import { localGames } from "@/data/localGames";
import { slugify } from "@/lib/slug";
import type { Game } from "@/lib/types";

const REMOTE_FEED_URL = "https://www.onlinegames.io/media/plugins/genGames/embed.json";

type RawFeedItem = {
  title?: unknown;
  description?: unknown;
  embed?: unknown;
  image?: unknown;
  tags?: unknown;
};

function safeStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function parseTags(raw: unknown) {
  const s = safeStr(raw);
  if (!s) return [];
  return s
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

const HOT_KEYWORDS = [
  "krunker",
  "fps",
  "sniper",
  "battle",
  "multiplayer",
  "madalin",
  "drift",
  "gta",
];

const NEW_KEYWORDS = ["new", "2024", "2025", "2026", "release", "fresh"];

function normalizeRemote(items: RawFeedItem[]) {
  const games: Game[] = [];
  const used = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const raw = items[i] ?? {};
    const title = safeStr(raw.title);
    const playUrl = safeStr(raw.embed);
    if (!title || !playUrl) continue;

    const base = slugify(title) || `game-${i}`;
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n++}`;
    }
    used.add(slug);

    const tags = parseTags(raw.tags);
    const hay = `${title} ${safeStr(raw.description)} ${tags.join(" ")} ${playUrl}`.toLowerCase();
    const isHot = HOT_KEYWORDS.some((k) => hay.includes(k));
    const isNew = NEW_KEYWORDS.some((k) => hay.includes(k));
    const isTop = i < 30 && !isHot && !isNew;

    games.push({
      id: slug,
      slug,
      title,
      description: safeStr(raw.description) || undefined,
      thumbnailUrl: safeStr(raw.image) || undefined,
      categories: tags,
      source: "embed",
      playUrl,
      isHot,
      isNew,
      isTop,
    });
  }

  return games;
}

let liveCache: { ts: number; games: Game[] } | null = null;

async function fetchLive() {
  const now = Date.now();
  if (liveCache && now - liveCache.ts < 1000 * 60 * 10) return liveCache.games;

  const res = await fetch(REMOTE_FEED_URL, {
    next: { revalidate: 60 * 30 },
  });
  if (!res.ok) throw new Error("live_feed_unavailable");
  const json = (await res.json()) as RawFeedItem[];
  const games = normalizeRemote(Array.isArray(json) ? json : []);
  liveCache = { ts: now, games };
  return games;
}

function mergeLocal(live: Game[]) {
  const map = new Map<string, Game>();
  for (const g of localGames) map.set(g.slug, g);
  for (const g of live) if (!map.has(g.slug)) map.set(g.slug, g);
  return Array.from(map.values());
}

export async function getAllGames() {
  const res = await getAllGamesResult();
  return res.games;
}

export async function getAllGamesResult() {
  try {
    const live = await fetchLive();
    return { source: "live" as const, games: mergeLocal(live) };
  } catch {
    return { source: "local" as const, games: mergeLocal([]) };
  }
}

export async function getGameBySlug(slug: string) {
  const all = await getAllGames();
  return all.find((g) => g.slug === slug) ?? null;
}

export function buildHomeRows(all: Game[]) {
  const by = (cat: string) => all.filter((g) => g.categories.includes(cat));
  const hot = all.filter((g) => g.isHot);
  const fresh = all.filter((g) => g.isNew && !g.isHot);
  const top = all.filter((g) => g.isTop && !g.isHot && !g.isNew);

  const rows: Array<{ key: string; title: string; games: Game[] }> = [];
  if (hot.length) rows.push({ key: "hot", title: "Popular", games: hot.slice(0, 30) });
  if (fresh.length) rows.push({ key: "new", title: "New", games: fresh.slice(0, 30) });
  if (top.length) rows.push({ key: "top", title: "Top Picks", games: top.slice(0, 30) });

  const cats = ["action", "arcade", "shooting", "io-games", "racing", "puzzle", "sports"];
  for (const c of cats) {
    const list = by(c);
    if (list.length) rows.push({ key: c, title: c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), games: list.slice(0, 30) });
  }

  return rows;
}

export function filterGames(
  all: Game[],
  opts: { q?: string; category?: string; quick?: string; sort?: string; limit?: number; offset?: number },
) {
  const q = (opts.q ?? "").trim().toLowerCase();
  const category = (opts.category ?? "").trim().toLowerCase();
  const quick = (opts.quick ?? "").trim().toLowerCase();
  const sort = (opts.sort ?? "featured").trim().toLowerCase();
  const offset = Math.max(0, opts.offset ?? 0);
  const limit = Math.min(500, Math.max(1, opts.limit ?? 200));

  let out = all;
  if (q) {
    out = out.filter((g) => {
      const hay = `${g.title} ${g.description ?? ""} ${g.categories.join(" ")} ${g.playUrl}`.toLowerCase();
      return hay.includes(q);
    });
  }
  if (category && category !== "all") out = out.filter((g) => g.categories.includes(category));
  if (quick === "hot") out = out.filter((g) => g.isHot);
  else if (quick === "new") out = out.filter((g) => g.isNew);
  else if (quick === "top") out = out.filter((g) => g.isTop);

  if (sort === "az") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "za") out = [...out].sort((a, b) => b.title.localeCompare(a.title));
  else out = [...out].sort((a, b) => (Number(!!b.isHot) - Number(!!a.isHot)) || (Number(!!b.isNew) - Number(!!a.isNew)) || a.title.localeCompare(b.title));

  return { total: out.length, games: out.slice(offset, offset + limit) };
}
