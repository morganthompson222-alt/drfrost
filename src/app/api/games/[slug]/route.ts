import { getGameBySlug } from "@/lib/games";
import type { NextRequest } from "next/server";

export async function GET(_: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const game = await getGameBySlug(slug);
  if (!game) return new Response("Not Found", { status: 404 });
  return Response.json(game);
}
