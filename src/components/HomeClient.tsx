"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "@/lib/types";
import { GameRow } from "@/components/GameRow";
import { GameTile } from "@/components/GameTile";

type Row = { key: string; title: string; games: Game[] };

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function loadIds(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set<string>();
    return new Set(arr.filter((x) => typeof x === "string") as string[]);
  } catch {
    return new Set<string>();
  }
}

function saveIds(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch {}
}

function buildRows(all: Game[], recent: Game[], favs: Game[]) {
  const by = (cat: string) => all.filter((g) => g.categories.includes(cat));
  const hot = all.filter((g) => g.isHot);
  const fresh = all.filter((g) => g.isNew && !g.isHot);
  const top = all.filter((g) => g.isTop && !g.isHot && !g.isNew);

  const rows: Row[] = [];
  if (recent.length) rows.push({ key: "recent", title: "Recently Played", games: recent.slice(0, 20) });
  if (favs.length) rows.push({ key: "favs", title: "Favorites", games: favs.slice(0, 30) });
  if (hot.length) rows.push({ key: "hot", title: "Popular", games: hot.slice(0, 30) });
  if (fresh.length) rows.push({ key: "new", title: "New", games: fresh.slice(0, 30) });
  if (top.length) rows.push({ key: "top", title: "Top Picks", games: top.slice(0, 30) });

  const cats = ["action", "arcade", "shooting", "io-games", "racing", "puzzle", "sports"];
  for (const c of cats) {
    const list = by(c);
    if (list.length) rows.push({ key: c, title: c.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), games: list.slice(0, 30) });
  }

  const seen = new Set<string>();
  const pruned: Row[] = [];
  for (const r of rows) {
    const g = r.games.filter((x) => !seen.has(x.slug));
    for (const x of g) seen.add(x.slug);
    if (g.length) pruned.push({ ...r, games: g });
  }

  return pruned;
}

export function HomeClient() {
  const [all, setAll] = useState<Game[]>([]);
  const [source, setSource] = useState<string>("—");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "az" | "za">("featured");
  const [quick, setQuick] = useState<"all" | "hot" | "new" | "top">("all");

  const favKey = "vg_favs_v1";
  const recentKey = "vg_recent_v1";
  const [favIds, setFavIds] = useState<Set<string>>(() => loadIds(favKey));
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(recentKey);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((x) => typeof x === "string") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games?limit=600&sort=${sort}`, { cache: "no-store" });
        const json = (await res.json()) as { games: Game[]; source?: string };
        if (!alive) return;
        setAll(Array.isArray(json.games) ? json.games : []);
        setSource(json.source === "live" ? "live" : "local");
      } catch {
        if (!alive) return;
        setAll([]);
        setSource("offline");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [sort]);

  const favs = useMemo(() => all.filter((g) => favIds.has(g.slug)), [all, favIds]);
  const recent = useMemo(() => recentIds.map((id) => all.find((g) => g.slug === id)).filter(Boolean) as Game[], [all, recentIds]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = all;
    if (s) {
      out = out.filter((g) => (`${g.title} ${g.description ?? ""} ${g.categories.join(" ")} ${g.playUrl}`).toLowerCase().includes(s));
    }
    if (quick === "hot") out = out.filter((g) => g.isHot);
    else if (quick === "new") out = out.filter((g) => g.isNew);
    else if (quick === "top") out = out.filter((g) => g.isTop);
    return out;
  }, [all, q, quick]);

  const rows = useMemo(() => buildRows(all, recent, favs), [all, favs, recent]);

  const focusMap = useRef(new Map<string, HTMLAnchorElement>());
  const activeIndex = useRef<{ row: number; col: number } | null>(null);

  function setEl(key: string, el: HTMLAnchorElement | null) {
    if (!el) {
      focusMap.current.delete(key);
      return;
    }
    focusMap.current.set(key, el);
  }

  function moveFocus(nextRow: number, nextCol: number) {
    const key = `${nextRow}:${nextCol}`;
    const el = focusMap.current.get(key);
    if (!el) return;
    el.focus();
    el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    activeIndex.current = { row: nextRow, col: nextCol };
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const t = e.target as HTMLElement | null;
    const row = t?.dataset?.row ? Number(t.dataset.row) : NaN;
    const col = t?.dataset?.col ? Number(t.dataset.col) : NaN;
    if (!Number.isFinite(row) || !Number.isFinite(col)) return;
    activeIndex.current = { row, col };

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(row, Math.max(0, col - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(row, col + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(Math.max(0, row - 1), col);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(row + 1, col);
    }
  }

  function toggleFav(slug: string) {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      saveIds(favKey, next);
      return next;
    });
  }

  function markRecent(slug: string) {
    setRecentIds((prev) => {
      const next = uniq([slug, ...prev]).slice(0, 30);
      try {
        localStorage.setItem(recentKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <>
      <header className="header">
        <div className="container headerRow">
          <Link href="/" className="brand" aria-label="Home">
            VOID<span>GAMES</span>
          </Link>
          <input
            className="search"
            placeholder="Search games…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <span className="pill">Source: {source}</span>
          <span className="pill">{loading ? "Loading…" : `${filtered.length}/${all.length}`}</span>
          <select className="pill" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
            <option value="featured">Featured</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </header>

      <main className="container content" onKeyDown={onKeyDown}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {(["all", "hot", "new", "top"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className="btn"
              style={{
                borderColor: quick === k ? "rgba(108,99,255,.45)" : undefined,
                background: quick === k ? "rgba(108,99,255,.12)" : undefined,
              }}
              onClick={() => setQuick(k)}
            >
              {k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {q.trim() ? (
          <>
            <div className="pageTitle">Results</div>
            <div className="grid">
              {filtered.slice(0, 240).map((g, idx) => (
                <GameTile
                  key={g.slug}
                  game={g}
                  row={0}
                  col={idx}
                  isFav={favIds.has(g.slug)}
                  setEl={setEl}
                  onFav={() => toggleFav(g.slug)}
                  onPlay={() => markRecent(g.slug)}
                />
              ))}
            </div>
          </>
        ) : (
          rows.length ? (
            rows.map((r, rowIdx) => (
              <GameRow key={r.key} title={r.title} count={r.games.length}>
                {r.games.map((g, colIdx) => (
                  <GameTile
                    key={g.slug}
                    game={g}
                    row={rowIdx}
                    col={colIdx}
                    isFav={favIds.has(g.slug)}
                    setEl={setEl}
                    onFav={() => toggleFav(g.slug)}
                    onPlay={() => markRecent(g.slug)}
                  />
                ))}
              </GameRow>
            ))
          ) : (
            <div style={{ padding: "42px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 8 }}>No games loaded</div>
              <div style={{ fontSize: 13 }}>Add local entries in src/data/localGames.ts or ensure the live feed is reachable.</div>
            </div>
          )
        )}
      </main>
    </>
  );
}
