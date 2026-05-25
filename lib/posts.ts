export interface Post {
  slug: string
  title: string
  date: string
  tag: string
  excerpt: string
  content: string
}

export const posts: Post[] = [
  {
    slug: "what-is-elegy",
    title: "What is Elegy? The First On-Chain Grief Market",
    date: "May 24, 2026",
    tag: "Introduction",
    excerpt: "For millions of fans, the World Cup isn't entertainment. It's grief waiting to happen. Elegy makes it tradeable.",
    content: `
They pace, they scream, they cry, they go silent. When England loses on penalties — again — millions of people feel the exact same gut-punch simultaneously.

Elegy turns that suffering into a tradeable asset.

## The Concept

Every team in the 2026 FIFA World Cup has a Grief Token — an ERC-20 on X Layer Mainnet. The token price moves with fan sentiment. More grief = higher price. When a team loses, their fans' pain is scored by an AI agent, pushed on-chain via a signed oracle, and reflected instantly in the bonding curve price.

This isn't speculation on match outcomes. It's speculation on emotional intensity.

## Three Grief Triggers

**Match Loss** — A team loses in the group stage. Not eliminated yet, but the fanbase is hurting. GRIEF_BRA spikes. Price moves.

**Controversy** — A VAR decision overturns a goal. A star player gets a red card. A referee makes a terrible call. Acute grief. Immediate price impact.

**Elimination** — The terminal event. The team is out. The token stays live. In fact, this is when grief peaks and stays elevated longest.

## Why Now

The 2026 World Cup starts June 11. 48 teams. 104 matches. 32 days of grief. This may be the first large-scale on-chain market built entirely around sports emotion.

All 48 qualified teams are already live on X Layer Mainnet. The AI agent is scoring pre-tournament anxiety right now. Trades are open.

The market opens before the first whistle.
    `
  },
  {
    slug: "how-grief-tokens-work",
    title: "How Grief Tokens Work: Bonding Curves Meet Fan Sentiment",
    date: "May 24, 2026",
    tag: "Technical",
    excerpt: "A deep dive into the pricing mechanics behind Elegy — linear bonding curves modified by a live sentiment multiplier.",
    content: `
The Elegy pricing model combines two mechanisms: a linear bonding curve and a sentiment multiplier. Together they create prices that move with both trading activity and real-world emotional events.

## The Formula

\`\`\`
price = (0.008 + 0.000001 × supply) × sentimentMultiplier
sentimentMultiplier = 1 + (score / 100) × 2
\`\`\`

The sentiment multiplier ranges from **1x** (score = 0, no grief) to **3x** (score = 100, peak grief). This means a high-grief token costs up to 3x more than a recovering one at the same supply level.

## Why a Bonding Curve

Bonding curves guarantee liquidity — you can always buy or sell directly against the contract. There's no order book, no counterparty needed. The contract mints tokens on buy and burns on sell, adjusting the price based on supply.

This makes Elegy work even with small trading volumes. You don't need a liquid market to trade grief.

## The 5% Platform Fee

Every buy transaction sends 5% to the Elegy treasury. This funds ongoing development and the AI agent infrastructure that keeps sentiment scores current.

## Max Supply: 10,000

Each Grief Token has a hard cap of 10,000 tokens. Once a team's supply hits 10,000, no more can be minted. Scarcity kicks in. At peak grief, reaching the cap creates genuine urgency.

## The Oracle

Prices don't update automatically — an AI agent pushes signed scores to the SentimentOracle contract every 30 minutes. The oracle verifies the ECDSA signature and updates the on-chain score. The bonding curve reads the latest score on every trade.

This means prices can change even without anyone trading — just from new sentiment data hitting the oracle.
    `
  },
  {
    slug: "ai-sentiment-agent",
    title: "The AI Sentiment Agent: Scoring World Cup Heartbreak",
    date: "May 25, 2026",
    tag: "AI",
    excerpt: "How Claude analyzes fan grief every 30 minutes, signs the scores, and pushes them directly on-chain.",
    content: `
The most unusual part of Elegy isn't the bonding curve or the oracle. It's the AI agent that decides how much each fanbase is suffering.

## How It Works

Every 30 minutes, the Elegy backend calls Claude for each of the 48 qualified teams. The prompt asks Claude to score pre-tournament anxiety and, once the World Cup starts, real match grief.

The agent considers:
- Historical World Cup trauma (England's penalties, Brazil's 7-1)
- Fan expectations vs realistic chances
- Host nation pressure (USA, Canada, Mexico)
- Recent match results and controversial moments
- Fanbase volatility and cultural significance of football

The response is a JSON object with a score (0-100) and a one-sentence reasoning.

## The Signing Process

Claude returns a score. The backend signs it with a dedicated ECDSA signer key using \`ethers.solidityPackedKeccak256\`. The signed payload is submitted to the SentimentOracle contract on X Layer.

The oracle verifies the signature on-chain. If the signature doesn't match the registered signer address, the update is rejected. This means only the Elegy agent can push scores — nobody can manipulate them without the private key.

## Pre-Tournament Scoring

Right now, with the World Cup not yet started, the agent scores pre-tournament anxiety. Some examples:

- **Brazil (88)** — "Massive expectations, 7-1 trauma lingers, Pentacampeão pressure"
- **England (78)** — "Decades of penalty heartbreak, It's Coming Home mentality"
- **Mexico (78)** — "Host nation pressure plus historic Round of 16 curse"
- **New Zealand (28)** — "Small football nation, low expectations, just happy to qualify"

The variance is real. The agent understands football culture.

## When Matches Start

From June 11, the agent also polls football-data.org for live match results. When a match finishes, the losing team's sentiment is immediately re-scored and pushed on-chain within minutes. Grief spikes are automatic.
    `
  },
  {
    slug: "why-x-layer",
    title: "Why We Built on X Layer",
    date: "May 25, 2026",
    tag: "Infrastructure",
    excerpt: "Fast finality, near-zero gas, and OKX ecosystem integration made X Layer the obvious choice for a real-time sentiment market.",
    content: `
Building a real-time sentiment market means one thing above all else: transactions have to be fast and cheap. When England loses on penalties, the grief spike has to hit the chain before the emotional moment passes.

X Layer delivers this.

## The Technical Case

X Layer is an EVM-compatible L2 built by OKX, powered by Polygon CDK. Transactions confirm in seconds. Gas costs are negligible — our AI agent pushes 48 score updates every 30 minutes for fractions of a cent total.

For comparison: doing this on Ethereum mainnet would cost hundreds of dollars per update cycle. Doing it on most L2s would still be prohibitively expensive for a free-to-use protocol.

## OKB as Native Currency

OKB is the native gas token. Grief tokens are priced in OKB. This creates a natural alignment with the OKX ecosystem — users who already hold OKB on OKX Exchange can bridge directly and start trading.

The OKX wallet is natively supported in Elegy's RainbowKit configuration.

## The Hackathon Context

Elegy was built for the X Layer Build XCup hackathon (deadline May 28, 2026). The timing is deliberate — the World Cup starts June 11, giving us two weeks post-hackathon to prepare for live tournament trading.

Building on X Layer meant we could deploy 49 smart contracts (oracle + bonding curve + 48 tokens) for under 0.05 OKB total. That's the kind of economics that makes an experimental protocol viable.

## What's On-Chain

- **SentimentOracle** — \`0x234200FF134ddA9B36a1F13E83dEA006aE8A2443\`
- **GriefBondingCurve** — \`0x113aC3D59766DC82604d748ff00E9a80cEF00ee6\`
- 48 GriefToken contracts, one per qualified team

All contracts are verified and live on X Layer Mainnet (Chain ID 196).
    `
  },
  {
    slug: "world-cup-2026",
    title: "World Cup 2026: 48 Teams, 104 Matches, One Grief Market",
    date: "May 25, 2026",
    tag: "World Cup",
    excerpt: "The expanded 2026 format means more teams, more losses, and more grief. Here's how Elegy tracks every moment of it.",
    content: `
The 2026 FIFA World Cup is unlike any before it. 48 teams instead of 32. 104 matches instead of 64. Three host nations — USA, Canada, Mexico — spanning two time zones. And an expanded format that means more teams, more matches, more losses, more grief.

For Elegy, this is the defining event.

## The Format

The group stage alone features 72 matches across 12 groups of 4 teams. Every team plays 3 group games. That's 96 teams participating in group stage matches, with every loss a potential grief trigger.

The knockout rounds start with a new **Round of 32** — 16 more matches, 16 more eliminations. Then Round of 16, Quarter-finals, Semi-finals, Third Place, Final.

Total grief events: dozens. Total heartbreak moments: hundreds.

## The Big Fanbases

Some Grief Tokens will trade harder than others. The biggest fanbases create the most violent price swings:

**Brazil (88)** — 200 million football-obsessed fans. One loss and the entire country mourns publicly. The 7-1 against Germany in 2014 is still an open wound.

**England (78)** — The original heartbreak nation. 60 years of hurt. Every tournament ends in penalty drama. GRIEF_ENG is the most emotionally volatile token in the market.

**Argentina (72)** — Defending champions. Messi's shadow hangs over everything. The pressure to repeat is immense.

**Mexico (78)** — Co-hosts. The Round of 16 curse is a national trauma. If Mexico goes out in the group stage on home soil, GRIEF_MEX will hit 100.

## Key Dates

- **June 11** — Opening match: Mexico vs South Africa
- **June 11-27** — Group stage (72 matches)
- **June 28 - July 4** — Round of 32
- **July 4-7** — Round of 16
- **July 9-12** — Quarter-finals
- **July 14-15** — Semi-finals
- **July 19** — Final

Every match is a grief opportunity. The AI agent watches all of them.

## How to Trade

1. Connect OKX Wallet or MetaMask to X Layer Mainnet (Chain ID 196)
2. Browse tokens at [elegymarket.vercel.app/tokens](https://elegymarket.vercel.app/tokens)
3. Buy 1-5 tokens per transaction
4. Watch the grief score. When it spikes, price follows.
5. Sell when grief peaks or fades.

The World Cup starts June 11. The grief is coming.
    `
  },
  {
    slug: "whats-next",
    title: "What's Next: Elegy V2 and the Club Season",
    date: "May 25, 2026",
    tag: "Roadmap",
    excerpt: "The World Cup ends July 19. Elegy doesn't. Here's what's coming next.",
    content: `
The World Cup ends July 19. Elegy doesn't.

The grief market doesn't die when the final whistle blows in New York. It evolves. Version 2 of Elegy expands beyond international tournaments into the most emotionally charged club football seasons on the planet.

## The Vision

Every weekend, millions of fans watch their club lose. A last-minute goal. A relegation battle. A title race that collapses in the final minute. These are grief events. They happen 38 times a season, across hundreds of clubs, in front of billions of fans.

Elegy V2 brings the grief token model to club football.

## The Five Leagues

**Premier League (England)** — 20 clubs. 380 matches. The most-watched league in the world. Manchester United's decade of decline. Arsenal's annual heartbreak. Liverpool vs everyone. GRIEF_MUN, GRIEF_ARS, GRIEF_LIV — the most traded tokens in the market.

**La Liga (Spain)** — Real Madrid vs Barcelona defines an entire country's emotional calendar. But the real grief lives in the middle — clubs fighting relegation, fans watching decades of history evaporate. GRIEF_BAR after an El Clásico loss will be something to watch.

**Serie A (Italy)** — The most emotionally volatile league in Europe. AC Milan, Inter, Juventus, Roma. The Derby della Madonnina. The Derby della Capitale. Italian football culture runs deeper than the sport itself. Peak grief potential.

**Bundesliga (Germany)** — Bayern Munich win everything. That's the grief. Every other fanbase spends the season knowing the outcome. Dortmund fans have built an entire identity around losing at the last moment. GRIEF_BVB is built different.

**Ligue 1 (France)** — PSG spend everything and still can't win Europe. The grief of expectation vs reality, season after season. Meanwhile Lyon, Marseille, and Monaco fans carry their own weight. A market waiting to be built.

## The Timeline

- **July 19** — World Cup Final. Elegy V1 enters post-tournament mode.
- **August 2026** — Club season kickoff. EPL and Bundesliga open first.
- **Q3 2026** — Elegy V2 launches with Premier League and La Liga tokens live.
- **Q4 2026** — Serie A, Bundesliga, and Ligue 1 tokens added.
- **2027** — Full five-league coverage. 100+ club tokens. Year-round grief.

## Why This Works

The World Cup is 32 days. The club season is 10 months. Elegy V2 isn't a seasonal product — it's a permanent grief infrastructure for football.

The AI agent already knows how to score fan sentiment. The oracle already runs. The bonding curve already works. The only thing changing is the teams.

The architecture is built. The grief never stops.
    `
  }
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}
