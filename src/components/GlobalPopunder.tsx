"use client";

import { useEffect, useState } from "react";

interface AdConfig {
  id: string;
  adType: string;
  scriptCode: string;
  isActive: boolean;
}

export default function GlobalPopunder() {
  const [popunderCode, setPopunderCode] = useState<string | null>(null);

  useEffect(() => {
    // Only show popunder ONCE per browser session
    const hasSeen = sessionStorage.getItem("hasSeenPopunder");
    if (hasSeen) return;

    fetch("/api/ads")
      .then((res) => res.json())
      .then((data: AdConfig[]) => {
        const popunders = data.filter((ad) => ad.isActive && ad.adType === "Popunder");
        if (popunders.length > 0) {
          // Just take the first active popunder
          setPopunderCode(popunders[0].scriptCode);
          sessionStorage.setItem("hasSeenPopunder", "true");
        }
      })
      .catch((err) => console.error("Failed to fetch popunder", err));
  }, []);

  if (!popunderCode) return null;

  return <div dangerouslySetInnerHTML={{ __html: popunderCode }} />;
}
