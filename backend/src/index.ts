import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { updateSentiment } from "./agent";
import { pollMatches, getTodayMatches } from "./football";
import { getOKBPrice } from "./price";
import { TEAM_CODES } from "./teams";

dotenv.config();

const app = express();
app.use(express.json());

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
cron.schedule("*/30 * * * *", async () => {
  console.log("[cron] Running sentiment update for all teams...");
  for (const code of TEAM_CODES) {
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
