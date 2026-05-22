import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { updateSentiment } from "./agent";
import { TEAM_CODES } from "./teams";

dotenv.config({ path: "../.env.local" });

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Manual trigger for a team
app.post("/api/update/:teamCode", async (req, res) => {
  const { teamCode } = req.params;
  try {
    const result = await updateSentiment(teamCode.toUpperCase());
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run all active teams
app.post("/api/update-all", async (req, res) => {
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

// Cron: update every 30 minutes
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

app.listen(PORT, () => {
  console.log(`Elegy backend running on port ${PORT}`);
});
