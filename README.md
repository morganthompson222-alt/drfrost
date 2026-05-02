Modern Unblocked Games Platform (Apple TV–Style UI)

## Getting Started

Install dependencies and run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Sources

The app attempts to use a live public JSON feed for game metadata (title, thumbnail, categories, embed URL). If the live feed is unreachable, it falls back to local games defined in `src/data/localGames.ts`.

## Adding Games

### Add a locally hosted game
- Put the game files under `public/games/<your-game>/index.html`
- Add an entry to `src/data/localGames.ts` with:
  - `source: "local"`
  - `playUrl: "/games/<your-game>/index.html"`
  - `thumbnailUrl: "/games/<your-game>/thumb.jpg"` (optional)
  - `categories: ["arcade", "action"]` (any tags you want)

### Add an embedded game
- Add an entry to `src/data/localGames.ts` with:
  - `source: "embed"`
  - `playUrl: "https://..."` (iframe target URL)

## API
- `GET /api/games` supports `q`, `quick` (`hot|new|top`), `sort` (`featured|az|za`), `limit`, `offset`
- `GET /api/games/:slug`

## Notes
- Some third-party game providers block iframe embedding. The play page includes an “Open in Tab” option for those cases.
