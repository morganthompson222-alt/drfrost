export type GameSource = "embed" | "local";

export type Game = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  categories: string[];
  source: GameSource;
  playUrl: string;
  isHot?: boolean;
  isNew?: boolean;
  isTop?: boolean;
};

