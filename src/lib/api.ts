// Types for the streamfree.top API responses

export interface TeamInfo {
  name: string;
  logo?: string;
}

export interface MatchEvent {
  id: string;
  name: string;
  stream_key: string;
  match_timestamp: number; // unix timestamp in seconds
  category: string;
  league?: string;
  team1?: TeamInfo;
  team2?: TeamInfo;
  thumbnail_url?: string;
  viewers?: number;
  is_external?: boolean;
}

export type SportCategory =
  | "All"
  | "Soccer"
  | "Basketball"
  | "Hockey"
  | "Baseball"
  | "Football"
  | "Combat"
  | "Racing"
  | "Tennis"
  | "Cricket";

export const SPORT_CATEGORIES: SportCategory[] = [
  "All",
  "Soccer",
  "Basketball",
  "Football",
  "Hockey",
  "Baseball",
  "Combat",
  "Racing",
  "Tennis",
  "Cricket",
];

export const SPORT_ICONS: Record<string, string> = {
  All: "layout-grid",
  Soccer: "circle-dot",
  Basketball: "target",
  Football: "shield",
  Hockey: "swords",
  Baseball: "diamond",
  Combat: "flame",
  Racing: "flag",
  Tennis: "activity",
  Cricket: "trophy",
};

const API_BASE = "https://streamfree.top";

interface StreamsResponse {
  streams: Record<string, MatchEvent[]>;
}

export async function fetchAllMatches(): Promise<MatchEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/streams`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: StreamsResponse = await res.json();
    if (!data.streams) return [];

    const all: MatchEvent[] = [];
    for (const [category, items] of Object.entries(data.streams)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          all.push({ ...item, category });
        }
      }
    }
    return all;
  } catch {
    return [];
  }
}

export async function fetchMatchById(
  id: string
): Promise<MatchEvent | null> {
  try {
    const all = await fetchAllMatches();
    return all.find((m) => m.id === id || m.stream_key === id) || null;
  } catch {
    return null;
  }
}

export function getMatchStatus(
  match: MatchEvent
): "live" | "upcoming" | "finished" {
  const now = Math.floor(Date.now() / 1000);
  const matchTime = match.match_timestamp;
  const nineMinutes = 9 * 60; // 9 minutes before = LIVE (matching streamfree logic: diff <= 540)
  const threeHours = 3 * 60 * 60;

  if (now >= matchTime - nineMinutes && now <= matchTime + threeHours) {
    return "live";
  }
  if (now < matchTime - nineMinutes) {
    return "upcoming";
  }
  return "finished";
}

export function formatMatchTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  
  // Format time in Asia/Jakarta timezone (WIB)
  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta"
  });

  const getJakartaDateString = (d: Date) => {
    return d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
  };

  const todayStr = getJakartaDateString(new Date());
  const matchDateStr = getJakartaDateString(date);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getJakartaDateString(tomorrow);

  if (matchDateStr === todayStr) {
    return `Hari ini, ${timeStr} WIB`;
  }
  if (matchDateStr === tomorrowStr) {
    return `Besok, ${timeStr} WIB`;
  }

  const dateStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta"
  });

  return `${dateStr}, ${timeStr} WIB`;
}

export function parseTeams(name?: string): { home: string; away: string } {
  if (!name) return { home: "TBD", away: "" };
  const delimiters = [" vs ", " v ", " VS ", " Vs "];
  for (const d of delimiters) {
    if (name.includes(d)) {
      const parts = name.split(d);
      return {
        home: parts[0]?.trim() || "TBD",
        away: parts.slice(1).join(d).trim() || "TBD",
      };
    }
  }
  return { home: name, away: "" };
}

export function getTeamNames(match: MatchEvent): { home: string; away: string } {
  if (match.team1?.name && match.team2?.name) {
    return { home: match.team1.name, away: match.team2.name };
  }
  if (match.team1?.name) {
    return { home: match.team1.name, away: "" };
  }
  return parseTeams(match.name);
}

export function getCategoryDisplayName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
