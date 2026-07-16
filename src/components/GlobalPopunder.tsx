"use client";

import { useEffect } from "react";

const POPUNDER_SCRIPT = `<script src="https://tuxedoarbourannouncement.com/de/85/e8/de85e87c68b20b9e42223558473ad17c.js"></script>`;

export default function GlobalPopunder() {
  useEffect(() => {
    // Only show popunder ONCE per browser session
    const hasSeen = sessionStorage.getItem("hasSeenPopunder");
    if (hasSeen) return;

    // Create a temporary element to parse the HTML string
    const div = document.createElement("div");
    div.innerHTML = POPUNDER_SCRIPT;
    
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

    sessionStorage.setItem("hasSeenPopunder", "true");

    // Cleanup function
    return () => {
      injectedScripts.forEach(s => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, []);

  return null;
}
