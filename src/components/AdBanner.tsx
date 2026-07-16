"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface AdConfig {
  id: string;
  adType: string;
  placement: string;
  scriptCode: string;
  isActive: boolean;
}

function AdIframe({ scriptCode, height = "250px" }: { scriptCode: string; height?: string }) {
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
      style={{ width: "100%", border: "none", overflow: "hidden", minHeight: height, background: "transparent" }}
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

  DesktopBanner: `<script>
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
<div id="container-c355bac4abe671c9bf43a4c7ea192b11"></div>`,

  SideBanner: `<script>
  atOptions = {
    'key' : 'c51ffbf648534cedf1df4522b8f4b73c',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://tuxedoarbourannouncement.com/c51ffbf648534cedf1df4522b8f4b73c/invoke.js"></script>`
};

export default function AdBanner({ placement }: { placement: string }) {
  const scriptCode = AD_SCRIPTS[placement];

  if (!scriptCode) return null;
  
  let minHeight = "250px";
  if (placement === "UnderPlayer" || placement === "DesktopBanner") minHeight = "90px";
  if (placement === "BottomBanner") minHeight = "60px";
  if (placement === "SideBanner") minHeight = "600px";
  if (placement === "TopBanner") minHeight = "100px"; // approximate for native

  return (
    <div className={`ad-banner-wrapper placement-${placement.toLowerCase()}`}>
      <div className="ad-banner-container responsive-ad" style={{ width: "100%" }}>
        <AdIframe scriptCode={scriptCode} height={minHeight} />
      </div>
    </div>
  );
}
