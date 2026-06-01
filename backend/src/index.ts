import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { updateSentiment } from "./agent";
import { pollMatches, getTodayMatches, getTodayTeamCodes } from "./football";
import { getOKBPrice } from "./price";
import { TEAM_CODES } from "./teams";
import { getAllTokens } from "./store";

dotenv.config();

const app = express();
app.use(express.json());

// Allow cross-origin requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-secret');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const API_SECRET = process.env.API_SECRET;
function requireSecret(req, res, next) {
  if (!API_SECRET) return next();
  const key = req.headers['x-api-secret'] || req.query.secret;
  if (key !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

const PORT = process.env.PORT || 3001;

// Health check
app.get("/api/okb-price", async (req, res) => {
  const price = await getOKBPrice();
  res.json({ price });
});

app.get("/api/tokens", async (req, res) => {
  const tokens = getAllTokens();
  const okbPrice = await getOKBPrice();
  res.json({ tokens, okbPrice, timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Manual trigger for a team
app.post("/api/update/:teamCode", requireSecret, async (req, res) => {
  const { teamCode } = req.params;
  try {
    const result = await updateSentiment(teamCode.toUpperCase());
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run all active teams
app.post("/api/update-all", requireSecret, async (req, res) => {
  const results: any[] = [];
  for (const code of TEAM_CODES) {
    try {
      const result = await updateSentiment(code);
      results.push({ ...result, teamCode: code });
    } catch (err: any) {
      results.push({ teamCode: code, error: err.message });
    }
  }
  res.json({ success: true, results });
});

// Manual football poll trigger
app.post("/api/poll-matches", requireSecret, async (req, res) => {
  try {
    await pollMatches();
    res.json({ success: true, message: "Match poll complete" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Today's matches
app.get("/api/matches/today", async (req, res) => {
  try {
    const matches = await getTodayMatches();
    res.json({ success: true, matches });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cron: update sentiment every 30 minutes
cron.schedule("0 */6 * * *", async () => {
  // During tournament: only score teams playing today
  // Pre-tournament: score all teams
  let codesToUpdate = TEAM_CODES;
  try {
    const todayCodes = await getTodayTeamCodes();
    if (todayCodes.length > 0) {
      codesToUpdate = todayCodes;
      console.log(`[cron] Match day — updating ${todayCodes.length} teams: ${todayCodes.join(", ")}`);
    } else {
      console.log("[cron] No matches today — updating all 48 teams");
    }
  } catch(e) {}

  for (const code of codesToUpdate) {
    try {
      await updateSentiment(code);
      console.log(`[cron] Updated ${code}`);
    } catch (err: any) {
      console.error(`[cron] Failed ${code}:`, err.message);
    }
  }
});

// Cron: poll match results every 2 minutes during tournament
cron.schedule("*/2 * * * *", async () => {
  await pollMatches();
});

app.listen(PORT, () => {
  console.log(`Elegy backend running on port ${PORT}`);
  console.log(`Football poller active — checks every 2 minutes`);
});
