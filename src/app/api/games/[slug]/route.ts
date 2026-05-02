import { getGameBySlug } from "@/lib/games";

export async function GET(_: Request, context: { params: { slug: string } }) {
  const { slug } = context.params;
  const game = await getGameBySlug(slug);
  if (!game) return new Response("Not Found", { status: 404 });
  return Response.json(game);
}
