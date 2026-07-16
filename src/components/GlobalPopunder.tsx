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

  useEffect(() => {
    if (!popunderCode) return;
    
    // Create a temporary element to parse the HTML string
    const div = document.createElement("div");
    div.innerHTML = popunderCode;
    
    // Extract all scripts and inject them properly so they execute
    const scripts = div.getElementsByTagName("script");
    const injectedScripts: HTMLScriptElement[] = [];
    
    for (let i = 0; i < scripts.length; i++) {
      const script = document.createElement("script");
      if (scripts[i].src) {
        script.src = scripts[i].src;
      } else {
        script.innerHTML = scripts[i].innerHTML;
      }
      script.async = true;
      document.body.appendChild(script);
      injectedScripts.push(script);
    }

    // Cleanup function
    return () => {
      injectedScripts.forEach(s => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, [popunderCode]);

  return null;
}
