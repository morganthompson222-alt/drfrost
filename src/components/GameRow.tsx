import type { PropsWithChildren } from "react";

export function GameRow(props: PropsWithChildren<{ title: string; count?: number }>) {
  return (
    <section className="row" aria-label={props.title}>
      <div className="rowHeader">
        <div className="rowTitle">{props.title}</div>
        {typeof props.count === "number" ? <div className="rowSub">{props.count} games</div> : null}
      </div>
      <div className="rail">{props.children}</div>
    </section>
  );
}

