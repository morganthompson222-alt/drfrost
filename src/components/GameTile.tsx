"use client";

import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/lib/types";

export function GameTile(props: {
  game: Game;
  row: number;
  col: number;
  isFav: boolean;
  setEl: (key: string, el: HTMLAnchorElement | null) => void;
  onFav: () => void;
  onPlay: () => void;
}) {
  const g = props.game;
  const key = `${props.row}:${props.col}`;

  const dotColor = g.isHot ? "var(--red)" : g.isNew ? "var(--green)" : "var(--accent)";
  const meta = g.categories.slice(0, 2).join(" · ");

  return (
    <div className="tile">
      <button
        type="button"
        className="favBtn"
        onClick={props.onFav}
        aria-label={props.isFav ? "Remove from favorites" : "Add to favorites"}
      >
        {props.isFav ? "★" : "☆"}
      </button>
      <Link
        href={`/play/${g.slug}`}
        className="tileLink"
        data-row={props.row}
        data-col={props.col}
        ref={(el) => props.setEl(key, el)}
        onClick={props.onPlay}
        aria-label={`Play ${g.title}`}
      >
        <div className="thumb" style={{ position: "relative" }}>
          {g.thumbnailUrl ? (
            <Image src={g.thumbnailUrl} alt="" fill sizes="(max-width: 760px) 210px, 240px" className="thumbImg" />
          ) : null}
        </div>
        <div className="tileInfo">
          <div className="tileTitle">{g.title}</div>
          <div className="tileMeta">
            <span className="dot" style={{ background: dotColor }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{meta || "—"}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
