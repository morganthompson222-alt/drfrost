"use client";

import Script from "next/script";

export function AdSlot(props: {
  placement: "home-banner" | "home-inline" | "play-banner";
  label?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot =
    props.placement === "home-banner"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BANNER
      : props.placement === "play-banner"
        ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_PLAY_BANNER
        : process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE;

  const enabled = Boolean(client && slot);
  const title = props.label ?? "Advertisement";

  return (
    <div className="adSlot" aria-label={title} data-placement={props.placement}>
      {enabled ? (
        <>
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client ?? "")}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          <Script
            id={`adsbygoogle-${props.placement}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: "(adsbygoogle=window.adsbygoogle||[]).push({});",
            }}
          />
        </>
      ) : (
        <div className="adPlaceholder">
          <div className="adPlaceholderTitle">{title}</div>
          <div className="adPlaceholderSub">Ad slot not configured</div>
        </div>
      )}
    </div>
  );
}

