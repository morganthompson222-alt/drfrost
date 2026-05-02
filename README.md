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

## Ads

The UI includes ad slots on the home page and the play page. To enable AdSense rendering, set these Vercel Environment Variables:

- `NEXT_PUBLIC_ADSENSE_CLIENT`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_BANNER`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE`
- `NEXT_PUBLIC_ADSENSE_SLOT_PLAY_BANNER`

If these variables are not set, ad slots render as placeholders.

## Tracking

The app includes Vercel Analytics and Speed Insights. Enable and view them in the Vercel dashboard for your project.

Optional: In-app tracking for the `/admin` dashboard uses Upstash Redis via REST API:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Admin

An admin dashboard is available at `/admin` (Basic Auth). Set these Vercel Environment Variables to protect it:

- `ADMIN_USER`
- `ADMIN_PASS`

## Updating (deploy)

After you change something locally:

```bash
git add -A
git commit -m "Describe the change"
git push
```

Vercel automatically redeploys after each push.

## Notes
- Some third-party game providers block iframe embedding. The play page includes an “Open in Tab” option for those cases.
