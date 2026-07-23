import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kicktvstreams.my.id"),
  title: "kickTvStreams — Live Sports Streaming",
  description:
    "Watch live sports events for free. Soccer, Basketball, Hockey, Baseball, Tennis, Cricket, Combat, and Racing — all in one place.",
  verification: {
    google: "isi-kode-google-search-console",
    yandex: "783adc4fe5423856",
    yahoo: "isi-kode-yahoo-bing",
    other: {
      "msvalidate.01": "isi-kode-bing-webmaster",
      "p:domain_verify": "isi-kode-pinterest",
      "monetag": "77cedfe5829a603f7e2827b79b4fc2dd",
    }
  },
  keywords: [
    // English keywords
    "live sports",
    "streaming",
    "soccer",
    "basketball",
    "football",
    "free sports streaming",
    "watch sports live",
    "sports streaming hd",
    "watch ufc free",
    // Indonesian keywords
    "nonton bola live",
    "streaming bola gratis",
    "live streaming sepak bola",
    "nonton ufc gratis",
    "nonton badminton live",
    "nonton motogp live",
    "streaming olahraga",
    "nonton bola online",
    "nonton basket gratis",
    "link streaming bola",
    "nonton bola tanpa vpn"
  ],
  icons: {
    icon: "/log0.webp",
    shortcut: "/log0.webp",
    apple: "/log0.webp",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "kickTvStreams — Live Sports Streaming",
    description:
      "Watch live sports events for free. Soccer, Basketball, Hockey, Baseball, Tennis, Cricket, Combat, and Racing.",
    type: "website",
    siteName: "kickTvStreams",
    images: [
      {
        url: "/log0.webp",
        width: 800,
        height: 600,
        alt: "kickTvStreams Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "kickTvStreams — Live Sports Streaming",
    description: "Watch live sports events for free.",
    images: ["/log0.webp"],
  },
};

import GlobalPopunder from "@/components/GlobalPopunder";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth">
      <body>
        <GlobalPopunder />
        {children}
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="263031"
          async
          data-cfasync="false"
          strategy="afterInteractive"
        />
        <Analytics />
      </body>
    </html>
  );
}
