import Link from "next/link";
import {
  type MatchEvent,
  getMatchStatus,
  formatMatchTime,
  getTeamNames,
  getCategoryDisplayName,
} from "@/lib/api";

interface MatchCardProps {
  match: MatchEvent;
  index?: number;
}

function getUpcomingCountdown(timestamp: number): string {
  const diffMs = timestamp * 1000 - Date.now();
  if (diffMs <= 0) return "1m";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins}m`;
  }

  const diffHours = Math.floor(diffMs / 3600000);
  const remainingMins = Math.floor((diffMs % 3600000) / 60000);
  if (diffHours < 24) {
    return `${diffHours}h ${remainingMins}m`;
  }

  const diffDays = Math.floor(diffMs / 86400000);
  const remainingHours = Math.floor((diffMs % 86400000) / 3600000);
  return `${diffDays}d ${remainingHours}h`;
}

export default function MatchCard({ match, index = 0 }: MatchCardProps) {
  const status = getMatchStatus(match);
  const { home, away } = getTeamNames(match);
  const animDelay = Math.min(index, 8);

  const homeLogo = match.team1?.logo;
  const awayLogo = match.team2?.logo;

  const homeLogoUrl = homeLogo
    ? homeLogo.startsWith("http")
      ? homeLogo
      : `https://streamfree.top${homeLogo}`
    : null;

  const awayLogoUrl = awayLogo
    ? awayLogo.startsWith("http")
      ? awayLogo
      : `https://streamfree.top${awayLogo}`
    : null;

  return (
    <Link
      href={`/watch/${match.stream_key}`}
      className="match-card-box-43"
      id={`match-${match.id}`}
      style={{
        animationDelay: `${animDelay * 50}ms`,
        textDecoration: "none",
      }}
    >
      {/* Top Row: Badges */}
      <div className="mcb-top">
        {status === "live" ? (
          <span className="mcb-badge-live">LIVE</span>
        ) : status === "upcoming" ? (
          <span className="mcb-badge-upcoming">
            {getUpcomingCountdown(match.match_timestamp)}
          </span>
        ) : (
          <span className="mcb-badge-upcoming">SELESAI</span>
        )}

        {status === "live" && match.viewers !== undefined && (
          <div className="mcb-viewers">
            <span className="mcb-viewers-dot" />
            <span>{match.viewers > 0 ? match.viewers : "0"}</span>
          </div>
        )}
      </div>

      {/* Middle Row: Logos */}
      <div className="mcb-logos">
        {homeLogoUrl ? (
          <img src={homeLogoUrl} alt={home} className="mcb-logo" />
        ) : (
          <div className="mcb-logo-fallback">{home.charAt(0).toUpperCase()}</div>
        )}

        <span className="mcb-vs">vs</span>

        {away && awayLogoUrl ? (
          <img src={awayLogoUrl} alt={away} className="mcb-logo" />
        ) : away ? (
          <div className="mcb-logo-fallback">{away.charAt(0).toUpperCase()}</div>
        ) : (
          <div className="mcb-logo-fallback">?</div>
        )}
      </div>

      {/* Bottom Section: Info text details INSIDE the card */}
      <div className="mcb-info">
        <h3 className="mcb-title">
          {home} {away ? `vs ${away}` : ""}
        </h3>
        <div className="mcb-footer-details">
          <span className="mcb-league">
            {match.league || getCategoryDisplayName(match.category)}
          </span>
          <span className="mcb-time-text">
            {formatMatchTime(match.match_timestamp)}
          </span>
        </div>
      </div>
    </Link>
  );
}
