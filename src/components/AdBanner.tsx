"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface AdConfig {
  id: string;
  adType: string;
  placement: string;
  scriptCode: string;
  isActive: boolean;
}

export default function AdBanner({ placement }: { placement: string }) {
  const [ads, setAds] = useState<AdConfig[]>([]);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data: AdConfig[]) => {
        const activeAds = data.filter((ad) => ad.isActive && ad.placement === placement && ad.adType !== "Popunder");
        setAds(activeAds);
      })
      .catch((err) => console.error("Failed to fetch ads", err));
  }, [placement]);

  if (ads.length === 0) return null;

  return (
    <div className={`ad-banner-wrapper placement-${placement.toLowerCase()}`}>
      {ads.map((ad) => {
        // If it's just a <script src="..."> we should render it using Next.js Script tag for better loading
        const isSrcOnly =
          ad.scriptCode.includes("src=") &&
          !ad.scriptCode.includes("atOptions") &&
          (ad.scriptCode.match(/<script/g) || []).length === 1;

        if (isSrcOnly) {
          const srcMatch = ad.scriptCode.match(/src=["'](.*?)["']/);
          if (srcMatch && srcMatch[1]) {
            return <Script key={ad.id} src={srcMatch[1]} strategy="lazyOnload" />;
          }
        }

        return (
          <div
            key={ad.id}
            className="ad-banner-container responsive-ad"
            dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
          />
        );
      })}
    </div>
  );
}
