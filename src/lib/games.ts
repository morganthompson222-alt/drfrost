import { localGames } from "@/data/localGames";
import type { Game } from "@/lib/types";

export async function getAllGames() {
  const res = await getAllGamesResult();
  return res.games;
}

export async function getAllGamesResult() {
  return { source: "local" as const, games: localGames };
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
