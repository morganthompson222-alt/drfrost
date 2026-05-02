import type { Game } from "@/lib/types";

export const localGames: Game[] = [
  {
    id: "demo-clicker",
    slug: "demo-clicker",
    title: "Demo Clicker",
    description: "Local demo game bundled with the site.",
    thumbnailUrl: "/games/demo/thumb.svg",
    categories: ["arcade", "clicker"],
    source: "local",
    playUrl: "/games/demo/index.html",
    isTop: true,
  },
];
