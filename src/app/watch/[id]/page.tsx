import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlayerView from "@/components/PlayerView";
import { fetchMatchById, getTeamNames, getCategoryDisplayName } from "@/lib/api";

export async function generateMetadata(
  props: PageProps<"/watch/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const match = await fetchMatchById(id);

  if (!match) {
    return { title: "Match Not Found — kickTvStreams" };
  }

  const { home, away } = getTeamNames(match);
  const matchTitle = away ? `${home} vs ${away}` : home;
  const categoryName = getCategoryDisplayName(match.category);
  const leagueName = match.league || categoryName;

  const title = `Nonton Live Streaming ${matchTitle} Gratis — kickTvStreams`;
  const description = `Link streaming nonton ${matchTitle} (${leagueName}) tanpa VPN dan anti buffering. Watch ${matchTitle} live sports stream HD free on kickTvStreams.`;

  return {
    title,
    description,
    keywords: [
      matchTitle,
      home,
      away || "",
      leagueName,
      categoryName,
      `live streaming ${home}`,
      `nonton ${away || home} gratis`,
      "nonton bola live",
      "link streaming",
      "watch live stream",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "kickTvStreams",
    },
  };
}

function PlayerSkeleton() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        className="skeleton"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          maxHeight: 550,
          borderRadius: 0,
        }}
      />
      <div style={{ padding: "20px 24px" }}>
        <div
          className="skeleton skeleton-line"
          style={{ width: "50%", height: 24, marginBottom: 12 }}
        />
        <div
          className="skeleton skeleton-line"
          style={{ width: "30%", height: 16 }}
        />
      </div>
    </div>
  );
}

async function WatchContent({ id }: { id: string }) {
  const match = await fetchMatchById(id);

  if (!match) {
    return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h3>Match Not Found</h3>
        <p>This match might have been removed or the link is invalid.</p>
      </div>
    );
  }

  const { home, away } = getTeamNames(match);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": away ? `${home} vs ${away}` : home,
    "startDate": new Date(match.match_timestamp * 1000).toISOString(),
    "sport": getCategoryDisplayName(match.category),
    "homeTeam": {
      "@type": "SportsOrganization",
      "name": home,
    },
    "awayTeam": away ? {
      "@type": "SportsOrganization",
      "name": away,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlayerView match={match} />
    </>
  );
}

export default async function WatchPage(props: PageProps<"/watch/[id]">) {
  const { id } = await props.params;

  return (
    <div className="page-wrapper">
      <Navbar />
      <Suspense fallback={<PlayerSkeleton />}>
        <WatchContent id={id} />
      </Suspense>
      <Footer />
    </div>
  );
}
