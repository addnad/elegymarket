import OpenAI from "openai";
import { signAndSubmitScore } from "./signer";
import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://elegy.xyz",
    "X-Title": "Elegy",
  },
});

export async function fetchSentimentScore(
  teamCode: string,
  teamName: string
): Promise<{ score: number; reasoning: string }> {
  const response = await client.chat.completions.create({
    model: "anthropic/claude-sonnet-4",
    max_tokens: 512,
    messages: [
      {
        role: "system",
        content:
          "You are a sports sentiment analyst for the Elegy grief token protocol. You analyze fan reactions to World Cup eliminations and return structured JSON only.",
      },
      {
        role: "user",
        content: `Analyze fan grief sentiment for ${teamName} (${teamCode}) being eliminated from the World Cup.

Rate the grief level 0-100 where:
- 100 = peak grief, devastating unexpected loss, massive outpouring of sadness/anger
- 75  = very upset fanbase, heavy disappointment, lots of emotional reactions
- 50  = moderate grief, disappointing but somewhat expected result
- 25  = mild sadness, fans think team had a decent run
- 0   = fans fully moved on, no grief content remaining

Consider: how passionate is this fanbase, how far did they expect to go, cultural significance of football in this country, typical fan reaction patterns.

Respond with ONLY valid JSON, no markdown, no explanation:
{"score": <integer 0-100>, "reasoning": "<one sentence, max 20 words>"}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || '{"score": 50, "reasoning": "Default estimate"}';
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  console.log(`[agent] ${teamCode} score=${parsed.score} reason="${parsed.reasoning}"`);
  return {
    score: Math.min(100, Math.max(0, Math.round(parsed.score))),
    reasoning: parsed.reasoning,
  };
}

export async function updateSentiment(teamCode: string): Promise<{
  teamCode: string;
  score: number;
  txHash: string;
  reasoning: string;
}> {
  const teamNames: Record<string, string> = {
    ENG: "England", BRA: "Brazil", ARG: "Argentina",
    FRA: "France",  GER: "Germany", ESP: "Spain",
    POR: "Portugal", NED: "Netherlands", ITA: "Italy",
    USA: "United States", MEX: "Mexico", JPN: "Japan",
    KOR: "South Korea", SEN: "Senegal", NGA: "Nigeria", MAR: "Morocco",
  };

  const teamName = teamNames[teamCode] || teamCode;
  console.log(`[agent] Fetching sentiment for ${teamName}...`);

  const { score, reasoning } = await fetchSentimentScore(teamCode, teamName);
  const result = await signAndSubmitScore(teamCode, score);

  return { ...result, reasoning };
}
