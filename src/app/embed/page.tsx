import { getAllGamesResult } from "@/lib/games";

export default async function EmbedPage() {
  const { source, games } = await getAllGamesResult();
  const list = games.slice(0, 240);

  return (
    <>
      <header className="header">
        <div className="container headerRow">
          <a href="/" className="brand" aria-label="Home">
            DR<span>FROST</span>
          </a>
          <div style={{ marginLeft: "auto" }} />
          <span className="pill">Embed mode</span>
          <span className="pill">Source: {source}</span>
          <a className="btn" href="/games">
            Full site
          </a>
        </div>
      </header>

      <main className="container content">
        <div className="pageTitle">Games</div>
        <div className="grid">
          {list.map((g) => {
            const dotColor = g.isHot ? "var(--red)" : g.isNew ? "var(--green)" : "var(--accent)";
            const meta = g.categories.slice(0, 2).join(" · ");
            return (
              <div className="tile" key={g.slug}>
                <a href={`/play/${g.slug}`} className="tileLink" aria-label={`Play ${g.title}`}>
                  <div className="thumb">
                    {g.thumbnailUrl ? (
                      <img
                        src={g.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : null}
                  </div>
                  <div className="tileInfo">
                    <div className="tileTitle">{g.title}</div>
                    <div className="tileMeta">
                      <span className="dot" style={{ background: dotColor }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{meta || "—"}</span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

