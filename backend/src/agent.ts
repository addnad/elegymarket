import OpenAI from "openai";
import { signAndSubmitScore } from "./signer";
import { TEAM_NAMES } from "./teams";
import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://elegymarket.vercel.app",
    "X-Title": "Elegy",
  },
});

export async function fetchSentimentScore(
  teamCode: string,
  teamName: string
): Promise<{ score: number; reasoning: string }> {
  const response = await client.chat.completions.create({
    model: "anthropic/claude-sonnet-4",
    max_tokens: 256,
    messages: [
      {
        role: "system",
        content: "You are a sports sentiment analyst for the Elegy grief token protocol. You analyze football fan sentiment and return structured JSON only. Never return 0 — all fanbases have some level of anxiety, grief, or emotional charge.",
      },
      {
        role: "user",
        content: `Score the pre-tournament grief and anxiety sentiment for ${teamName} (${teamCode}) ahead of the 2026 FIFA World Cup.

IMPORTANT: ${teamName} HAS qualified for the 2026 FIFA World Cup. The tournament starts June 11, 2026.

This is the PRE-TOURNAMENT phase. Score based on:
- Historical World Cup trauma and past heartbreaks (e.g. England's penalty history, Brazil's 7-1, etc.)
- Fan expectations vs realistic chances — high expectations + uncertain outcome = high grief potential
- Pressure of being host nation (USA, Canada, Mexico)
- Underdog anxiety — small nations worried about humiliation
- Fanbase volatility and emotional intensity of football culture in this country
- Recent qualifying drama or narrow qualification
- Key player injuries, retirements, or controversies in the squad
- Defending champion pressure (Argentina)

Rate 0-100 where:
- 80-100 = extremely emotionally charged fanbase, massive expectations, history of heartbreak
- 60-79  = very anxious fanbase, real pressure, passionate football culture
- 40-59  = moderate anxiety, competitive team with mixed expectations
- 20-39  = lower pressure, smaller football nation, fans just happy to be here
- 1-19   = very relaxed fanbase, low expectations, pure excitement

Never return 0. Every fanbase feels something before a World Cup.

Respond with ONLY valid JSON, no markdown:
{"score": <integer 1-100>, "reasoning": "<one sentence max 20 words>"}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || '{"score": 30, "reasoning": "Default pre-tournament estimate"}';
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  console.log(`[agent] ${teamCode} score=${parsed.score} reason="${parsed.reasoning}"`);
  return {
    score: Math.min(100, Math.max(1, Math.round(parsed.score))),
    reasoning: parsed.reasoning,
  };
}

export async function updateSentiment(teamCode: string): Promise<{
  teamCode: string;
  score: number;
  txHash: string;
  reasoning: string;
}> {
  const teamName = TEAM_NAMES[teamCode] || teamCode;
  console.log(`[agent] Fetching sentiment for ${teamName}...`);
  const { score, reasoning } = await fetchSentimentScore(teamCode, teamName);
  const result = await signAndSubmitScore(teamCode, score);
  return { ...result, reasoning };
}
