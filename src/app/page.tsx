import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="container headerRow">
          <Link href="/" className="brand" aria-label="Home">
            DR<span>FROST</span>
          </Link>
          <div style={{ marginLeft: "auto" }} />
          <Link className="btn" href="/games">
            DrFrost Games
          </Link>
        </div>
      </header>

      <main className="container content">
        <div className="pageTitle">Maths</div>
        <div style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 820, lineHeight: 1.65 }}>
          <div style={{ marginBottom: 12 }}>
            Maths is the study of patterns, numbers, shapes, and logical thinking. It helps you solve problems, spot structure, and build skills
            you can use in everyday life.
          </div>
          <div style={{ marginBottom: 12 }}>
            Topics you can explore: arithmetic, fractions, algebra, geometry, probability, graphs, and mental maths strategies.
          </div>
          <div>
            Want something interactive? Open the categories menu below and pick <span style={{ color: "var(--text)" }}>DrFrost Games</span>.
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" href="/games">
            Start DrFrost Games
          </Link>

          <details>
            <summary className="btn" style={{ listStyle: "none" }}>
              Categories
            </summary>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn" href="/games">
                DrFrost Games
              </Link>
              <button className="btn" type="button" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
                Science (Coming soon)
              </button>
              <button className="btn" type="button" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
                English (Coming soon)
              </button>
              <button className="btn" type="button" disabled style={{ opacity: 0.55, cursor: "not-allowed" }}>
                Puzzles (Coming soon)
              </button>
            </div>
          </details>
        </div>
      </main>
    </>
  );
}
