import fs from "node:fs";
import path from "node:path";

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripJsonc(input) {
  let out = "";
  let i = 0;
  let inStr = false;
  let esc = false;
  while (i < input.length) {
    const c = input[i];
    const n = input[i + 1];

    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      i++;
      continue;
    }

    if (c === '"') {
      inStr = true;
      out += c;
      i++;
      continue;
    }

    if (c === "/" && n === "/") {
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }

    if (c === "/" && n === "*") {
      i += 2;
      while (i < input.length) {
        if (input[i] === "*" && input[i + 1] === "/") {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

function titleFromSlug(slug) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function firstExistingFile(absCandidates) {
  for (const abs of absCandidates) {
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
    } catch {}
  }
  return null;
}

function toPublicUrl(absPath, publicDir) {
  const rel = path.relative(publicDir, absPath).split(path.sep).join("/");
  return `/${rel}`;
}

const repoRoot = path.resolve(process.cwd());
const configPath = path.join(repoRoot, "scripts", "config.jsonc");
const publicDir = path.join(repoRoot, "public");
const gamesDir = path.join(publicDir, "games");
const outPath = path.join(repoRoot, "src", "data", "localGames.ts");

if (!fs.existsSync(configPath)) {
  throw new Error(`Missing config: ${configPath}`);
}
if (!fs.existsSync(gamesDir)) {
  throw new Error(`Missing games dir: ${gamesDir}`);
}

const raw = fs.readFileSync(configPath, "utf8");
const cfg = JSON.parse(stripJsonc(raw));
const entries = Object.entries(cfg?.games ?? {});

const usedSlugs = new Set();
const localGames = [];

for (let i = 0; i < entries.length; i++) {
  const [titleRaw, meta] = entries[i];
  const title = String(titleRaw ?? "").trim();
  const gamePath = String(meta?.path ?? "").trim();
  const categories = Array.isArray(meta?.categories) ? meta.categories.filter((x) => typeof x === "string") : [];

  if (!title || !gamePath) continue;

  const baseSlug = slugify(title) || slugify(gamePath) || `game-${i}`;
  let slug = baseSlug;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${baseSlug}-${n++}`;
  usedSlugs.add(slug);

  let playUrl;
  if (gamePath.includes("?") || gamePath.endsWith(".html")) playUrl = `/games/${gamePath}`;
  else playUrl = `/games/${gamePath}/index.html`;

  let thumbnailUrl;
  if (gamePath.startsWith("flash/") && gamePath.includes("game=")) {
    const gameId = (gamePath.split("game=")[1] ?? "").split("&")[0];
    if (gameId) {
      const abs = firstExistingFile([
        path.join(gamesDir, "flash", "images", `${gameId}.png`),
        path.join(gamesDir, "flash", "images", `${gameId}.jpg`),
        path.join(gamesDir, "flash", "images", `${gameId}.jpeg`),
      ]);
      if (abs) thumbnailUrl = toPublicUrl(abs, publicDir);
    }
  } else {
    const absBase = path.join(gamesDir, gamePath);
    const abs = firstExistingFile([
      path.join(absBase, "thumb.png"),
      path.join(absBase, "thumb.jpg"),
      path.join(absBase, "thumb.jpeg"),
      path.join(absBase, "thumbnail.png"),
      path.join(absBase, "thumbnail.jpg"),
      path.join(absBase, "icon.png"),
      path.join(absBase, "icon.jpg"),
      path.join(absBase, "icon.jpeg"),
      path.join(absBase, "icon-256.png"),
      path.join(absBase, "logo.png"),
      path.join(absBase, "logo.jpg"),
      path.join(absBase, "logo.jpeg"),
      path.join(absBase, "splash.png"),
      path.join(absBase, "background.png"),
      path.join(absBase, "media.png"),
    ]);
    if (abs) thumbnailUrl = toPublicUrl(abs, publicDir);
  }

  localGames.push({
    id: slug,
    slug,
    title: title || titleFromSlug(slug),
    description: undefined,
    thumbnailUrl,
    categories,
    source: "local",
    playUrl,
    isTop: i < 30,
  });
}

localGames.sort((a, b) => a.title.localeCompare(b.title));

const header = `import type { Game } from "@/lib/types";\n\nexport const localGames: Game[] = `;
const body = JSON.stringify(localGames, null, 2)
  .replaceAll('"source": "local"', 'source: "local"')
  .replaceAll('"id":', "id:")
  .replaceAll('"slug":', "slug:")
  .replaceAll('"title":', "title:")
  .replaceAll('"description":', "description:")
  .replaceAll('"thumbnailUrl":', "thumbnailUrl:")
  .replaceAll('"categories":', "categories:")
  .replaceAll('"playUrl":', "playUrl:")
  .replaceAll('"isTop":', "isTop:");

fs.writeFileSync(outPath, `${header}${body};\n`, "utf8");
console.log(`Wrote ${localGames.length} games to ${outPath}`);
