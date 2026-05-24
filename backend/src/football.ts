import dotenv from "dotenv";
import { updateSentiment } from "./agent";
dotenv.config({ path: "../.env.local" });

const TOKEN = process.env.FOOTBALL_DATA_TOKEN!;
const WC_URL = "https://api.football-data.org/v4/competitions/WC/matches?season=2026";

// Their TLA → our team code (most match, only exceptions listed)
const TLA_TO_CODE: Record<string, string> = {
  URY: "URU",
  KSA: "KSA",
};

function getCode(tla: string): string {
  return TLA_TO_CODE[tla] || tla;
}

// Track processed matches to avoid double-triggering
const processedMatches = new Set<number>();

interface Match {
  id: number;
  status: string;
  stage: string;
  utcDate: string;
  homeTeam: { tla: string; name: string };
  awayTeam: { tla: string; name: string };
  score: {
    winner: string | null; // "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null
    fullTime: { home: number | null; away: number | null };
  };
}

async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(WC_URL, {
    headers: { "X-Auth-Token": TOKEN },
  });
  if (!res.ok) throw new Error(`Football API error: ${res.status}`);
  const data = await res.json();
  return data.matches || [];
}

async function processFinishedMatch(match: Match) {
  if (processedMatches.has(match.id)) return;
  processedMatches.add(match.id);

  const homeCode = getCode(match.homeTeam.tla);
  const awayCode = getCode(match.awayTeam.tla);
  const { home, away } = match.score.fullTime;
  const winner = match.score.winner;

  console.log(`[football] Match finished: ${match.homeTeam.name} ${home}-${away} ${match.awayTeam.name}`);

  if (winner === "DRAW") {
    // Both teams drew — moderate grief for both (missed win)
    console.log(`[football] Draw — updating both teams with moderate grief`);
    await updateSentiment(homeCode);
    await updateSentiment(awayCode);
  } else if (winner === "HOME_TEAM") {
    // Away team lost — high grief trigger
    console.log(`[football] ${match.awayTeam.name} lost — grief spike`);
    await updateSentiment(awayCode);
    // Winner gets updated too (relief, not grief — score will reflect this)
    await updateSentiment(homeCode);
  } else if (winner === "AWAY_TEAM") {
    // Home team lost — high grief trigger
    console.log(`[football] ${match.homeTeam.name} lost — grief spike`);
    await updateSentiment(homeCode);
    await updateSentiment(awayCode);
  }
}

export async function pollMatches() {
  try {
    const matches = await fetchMatches();
    const now = new Date();

    // Only process matches that finished in the last 3 hours
    const recentlyFinished = matches.filter(m => {
      if (m.status !== "FINISHED") return false;
      const matchTime = new Date(m.utcDate);
      const hoursAgo = (now.getTime() - matchTime.getTime()) / (1000 * 60 * 60);
      return hoursAgo <= 3;
    });

    for (const match of recentlyFinished) {
      await processFinishedMatch(match);
    }

    // Log upcoming matches today
    const today = now.toISOString().split("T")[0];
    const todayMatches = matches.filter(m =>
      m.utcDate.startsWith(today) && m.status === "TIMED"
    );
    if (todayMatches.length > 0) {
      console.log(`[football] ${todayMatches.length} match(es) scheduled today`);
    }

  } catch (e: any) {
    console.error("[football] Poll error:", e.message);
  }
}

export async function getTodayMatches() {
  const matches = await fetchMatches();
  const today = new Date().toISOString().split("T")[0];
  return matches.filter(m => m.utcDate.startsWith(today));
}
