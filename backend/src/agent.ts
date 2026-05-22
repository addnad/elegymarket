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
        content: "You are a sports sentiment analyst for the Elegy grief token protocol. You analyze fan reactions to World Cup moments and return structured JSON only.",
      },
      {
        role: "user",
        content: `Analyze fan grief and outrage sentiment for ${teamName} (${teamCode}) in the current World Cup.

Consider ALL of these grief triggers, not just elimination:
- Team eliminated from tournament
- Controversial VAR decisions that went against the team
- Disputed penalties awarded or denied
- Controversial red cards
- Unexpected defeats in group stage or knockouts
- Viral moments of fan outrage on social media
- Referee decisions that sparked widespread anger
- Any match controversy involving this team

Rate the current grief/outrage level 0-100 where:
- 100 = peak grief or outrage, massive fan reaction, viral controversy
- 75  = very upset fanbase, significant emotional reaction online
- 50  = moderate disappointment or controversy, notable but not explosive
- 25  = mild frustration, minor controversy or expected result
- 0   = no grief, team doing well or fans fully recovered

Consider: how passionate is this fanbase, cultural significance of football in this country, severity of the controversial moment, how recent it was.

Respond with ONLY valid JSON, no markdown:
{"score": <integer 0-100>, "reasoning": "<one sentence max 20 words>"}`,
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
    KOR: "South Korea", SEN: "Senegal", NGA: "Nigeria",
    MAR: "Morocco",
  };

  const teamName = teamNames[teamCode] || teamCode;
  console.log(`[agent] Fetching sentiment for ${teamName}...`);

  const { score, reasoning } = await fetchSentimentScore(teamCode, teamName);
  const result = await signAndSubmitScore(teamCode, score);

  return { ...result, reasoning };
}
