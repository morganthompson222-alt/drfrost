import { filterGames, getAllGamesResult } from "@/lib/games";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const quick = url.searchParams.get("quick") ?? undefined;
  const sort = url.searchParams.get("sort") ?? undefined;
  const limitRaw = url.searchParams.get("limit");
  const offsetRaw = url.searchParams.get("offset");
  const limit = limitRaw ? Number(limitRaw) : undefined;
  const offset = offsetRaw ? Number(offsetRaw) : undefined;

  const res = await getAllGamesResult();
  const { total, games } = filterGames(res.games, { q, category, quick, sort, limit, offset });
  return Response.json({ source: res.source, total, games });
}
