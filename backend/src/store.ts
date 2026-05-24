interface TokenData {
  teamCode: string
  score: number
  reasoning: string
  lastUpdated: string
}

const store: Record<string, TokenData> = {}

export function setTokenScore(code: string, score: number, reasoning: string) {
  store[code] = {
    teamCode: code,
    score,
    reasoning,
    lastUpdated: new Date().toISOString(),
  }
}

export function getAllTokens(): TokenData[] {
  return Object.values(store)
}

export function getTokenScore(code: string): TokenData | null {
  return store[code] || null
}
