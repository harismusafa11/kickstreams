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

import { useRef } from "react";

function AdIframe({ scriptCode }: { scriptCode: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
              </style>
            </head>
            <body>
              ${scriptCode}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [scriptCode]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "250px", background: "transparent" }}
      scrolling="no"
      title="Advertisement"
    />
  );
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
          <div key={ad.id} className="ad-banner-container responsive-ad" style={{ width: "100%" }}>
            <AdIframe scriptCode={ad.scriptCode} />
          </div>
        );
      })}
    </div>
  );
}
