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

const AD_SCRIPTS: Record<string, string> = {
  Sidebar: `<script>
  atOptions = {
    'key' : '5d0f0e278bb55ca8da4d4506b7e1555d',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://tuxedoarbourannouncement.com/5d0f0e278bb55ca8da4d4506b7e1555d/invoke.js"></script>`,

  UnderPlayer: `<script>
  atOptions = {
    'key' : '70e808ea4812d840159583a381edb720',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://tuxedoarbourannouncement.com/70e808ea4812d840159583a381edb720/invoke.js"></script>`,

  BottomBanner: `<script>
  atOptions = {
    'key' : '329e2af2d942556fca80d37e224b2880',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://tuxedoarbourannouncement.com/329e2af2d942556fca80d37e224b2880/invoke.js"></script>`,

  TopBanner: `<script async="async" data-cfasync="false" src="https://tuxedoarbourannouncement.com/c355bac4abe671c9bf43a4c7ea192b11/invoke.js"></script>
<div id="container-c355bac4abe671c9bf43a4c7ea192b11"></div>`
};

export default function AdBanner({ placement }: { placement: string }) {
  const scriptCode = AD_SCRIPTS[placement];

  if (!scriptCode) return null;

  return (
    <div className={`ad-banner-wrapper placement-${placement.toLowerCase()}`}>
      <div className="ad-banner-container responsive-ad" style={{ width: "100%" }}>
        <AdIframe scriptCode={scriptCode} />
      </div>
    </div>
  );
}
