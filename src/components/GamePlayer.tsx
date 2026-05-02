"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "@/lib/types";

export function GamePlayer({ game }: { game: Game }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const src = useMemo(() => game.playUrl, [game.playUrl]);

  const [status, setStatus] = useState<{ src: string; stuck: boolean }>({ src, stuck: false });
  const isStuck = status.src === src ? status.stuck : false;

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStatus({ src, stuck: true });
    }, 8500);
    return () => window.clearTimeout(t);
  }, [src]);

  async function fullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    const anyEl = el as unknown as { requestFullscreen?: () => Promise<void> };
    if (anyEl.requestFullscreen) await anyEl.requestFullscreen();
  }

  return (
    <>
      <div className="playerTop">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{game.title}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>
            {game.categories.slice(0, 6).join(" · ") || "—"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a className="btn" href={src} target="_blank" rel="noopener">
            Open in Tab
          </a>
          <button className="btn" type="button" onClick={fullscreen}>
            Fullscreen
          </button>
        </div>
      </div>

      <div className="playerWrap" ref={wrapRef}>
        {isStuck ? (
          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>This game may block embeds.</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
              Some providers disallow being displayed in an iframe. Use “Open in Tab”.
            </div>
            <a className="btn" href={src} target="_blank" rel="noopener">
              Open in Tab
            </a>
          </div>
        ) : (
          <iframe
            className="playerFrame"
            src={src}
            allow="fullscreen; gamepad; autoplay"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            onLoad={() => {
              setStatus({ src, stuck: false });
            }}
          />
        )}
      </div>
    </>
  );
}
