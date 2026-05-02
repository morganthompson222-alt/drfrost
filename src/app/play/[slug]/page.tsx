import { notFound } from "next/navigation";
import Link from "next/link";
import { getGameBySlug } from "@/lib/games";
import { AdSlot } from "@/components/AdSlot";
import { GamePlayer } from "@/components/GamePlayer";

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  return (
    <>
      <header className="header">
        <div className="container headerRow">
          <Link href="/" className="brand" aria-label="Home">
            DR<span>FROST</span>
          </Link>
          <span className="pill">{game.source === "local" ? "Local" : "Embedded"}</span>
          <span className="pill">{game.categories.slice(0, 2).join(" · ") || "—"}</span>
          <div style={{ marginLeft: "auto" }} />
          <Link className="btn" href="/">
            Back
          </Link>
        </div>
      </header>

      <main className="container content">
        <AdSlot placement="play-banner" />
        <GamePlayer game={game} />
      </main>
    </>
  );
}
