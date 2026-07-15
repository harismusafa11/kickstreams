"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  type MatchEvent,
  type SportCategory,
  getMatchStatus,
  SPORT_CATEGORIES,
  getCategoryDisplayName,
} from "@/lib/api";
import SportTabs from "@/components/SportTabs";
import MatchCard from "@/components/MatchCard";
import { Tv, Star } from "lucide-react";

interface MatchListProps {
  matches: MatchEvent[];
}

function MatchListContent({ matches }: MatchListProps) {
  const [activeCategory, setActiveCategory] = useState<SportCategory>("All");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    counts["All"] = matches.length;
    for (const cat of SPORT_CATEGORIES) {
      if (cat === "All") continue;
      counts[cat] = matches.filter(
        (m) => m.category?.toLowerCase() === cat.toLowerCase()
      ).length;
    }
    return counts;
  }, [matches]);

  // Dynamic filter for Category and Navbar Search Input
  const filtered = useMemo(() => {
    let list = matches;

    // Filter by category
    if (activeCategory !== "All") {
      list = list.filter(
        (m) => m.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.league?.toLowerCase().includes(lowerQuery) ||
          m.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort: live first, then upcoming by date, then finished
    return [...list].sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 };
      const sa = statusOrder[getMatchStatus(a)];
      const sb = statusOrder[getMatchStatus(b)];
      if (sa !== sb) return sa - sb;
      return a.match_timestamp - b.match_timestamp;
    });
  }, [matches, activeCategory, query]);

  // Popular matches: Live matches sorted by viewers descending
  const popularMatches = useMemo(() => {
    return [...matches]
      .filter((m) => getMatchStatus(m) === "live")
      .sort((a, b) => (b.viewers || 0) - (a.viewers || 0))
      .slice(0, 4);
  }, [matches]);

  const liveMatches = filtered.filter((m) => getMatchStatus(m) === "live");
  const otherMatches = filtered.filter((m) => getMatchStatus(m) !== "live");

  return (
    <>
      <SportTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Popular matches section */}
      {popularMatches.length > 0 && !query && activeCategory === "All" && (
        <>
          <div className="section-header" id="popular-section">
            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={18} color="var(--accent-amber)" fill="var(--accent-amber)" />
              Popular Matches
            </h2>
            <span className="section-count">Trending live events</span>
          </div>
          <div className="match-grid">
            {popularMatches.map((match, i) => (
              <MatchCard key={`popular-${match.id}`} match={match} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Live matches section */}
      {liveMatches.length > 0 && (
        <>
          <div className="section-header" id="live-section">
            <h2 className="section-title">Live Now</h2>
            <span className="section-count">
              {liveMatches.length} {liveMatches.length === 1 ? "match" : "matches"}
            </span>
          </div>
          <div className="match-grid">
            {liveMatches.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>
        </>
      )}

      {/* All / Category schedule section */}
      <div className="section-header" id="schedule-section">
        <h2 className="section-title">
          {query ? `Search Results for "${query}"` : activeCategory === "All" ? "All Matches" : getCategoryDisplayName(activeCategory)}
        </h2>
        <span className="section-count">
          {otherMatches.length} {otherMatches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <div className="match-grid">
        {otherMatches.length > 0 ? (
          otherMatches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))
        ) : liveMatches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Tv size={24} />
            </div>
            <h3>No matches found</h3>
            <p>
              {query
                ? "No matches match your search criteria. Try something else."
                : activeCategory !== "All"
                ? `No ${activeCategory.toLowerCase()} matches available right now. Try another category.`
                : "No matches available at the moment. Check back soon."}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function MatchList({ matches }: MatchListProps) {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
        Loading matches...
      </div>
    }>
      <MatchListContent matches={matches} />
    </Suspense>
  );
}
