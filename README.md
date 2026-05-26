# Elegy — Trade the Grief

> The first on-chain sentiment market for World Cup fan grief. Every team gets a Grief Token. An AI agent scores real fan sentiment every 30 minutes and pushes it on-chain. Price moves with grief.

**Live:** [elegymarkets.xyz](https://elegymarkets.xyz)  
**Chain:** X Layer Mainnet (Chain ID 196)  
**Twitter:** [@elegyxyz](https://twitter.com/elegyxyz)

---

## What is Elegy?

Elegy turns World Cup fan emotion into a tradeable asset. When a team loses, gets a controversial VAR decision, or gets eliminated — their fans grieve. That grief is scored by an AI agent, pushed on-chain, and reflected in the token price via a bonding curve.

There are three grief triggers:

- **Match Loss** — a team loses in the group stage. Not eliminated yet, but fans are suffering. Grief score spikes, price moves.
- **Controversy** — VAR overturns a goal, a red card ruins a match, a referee makes a terrible call. Acute grief event, traders pile in.
- **Elimination** — the terminal grief event. Team is out. Token stays live — grief peaks and stays high.

---

## Tech Stack

### Frontend
- Next.js 16, wagmi v2, RainbowKit, Recharts, Tailwind, shadcn/ui
- 5 pages: Dashboard, Tokens, Market, Leaderboard, Portfolio
- Live ticker bar (real buy/sell events from chain)
- Trade modal (buy/sell 1–5 tokens per tx)
- Token detail page with bonding curve chart
- Wallet connect (OKX Wallet + MetaMask via RainbowKit)

### Smart Contracts
- Solidity 0.8.28, Hardhat, OpenZeppelin
- `GriefToken.sol` — ERC-20 per team, operator mint/burn
- `SentimentOracle.sol` — ECDSA-signed grief scores 0–100
- `GriefBondingCurve.sol` — linear curve × sentiment multiplier, 1–5 tokens per tx, 5% platform fee, 10,000 max supply per token

### Backend
- Node.js, Express, node-cron, ethers.js
- AI sentiment agent (Claude)
- Scores all 48 teams every 30 minutes
- ECDSA signs scores and pushes to oracle on-chain
- REST API: `/api/update/:teamCode` and `/api/update-all`
- Hosted on Render

---

## Deployed Contracts — X Layer Mainnet (Chain ID 196)

| Contract | Address |
|---|---|
| SentimentOracle | `0x234200FF134ddA9B36a1F13E83dEA006aE8A2443` |
| GriefBondingCurve | `0x113aC3D59766DC82604d748ff00E9a80cEF00ee6` |

All 48 qualified 2026 World Cup teams have deployed Grief Tokens. See `contracts/deployed_v2.json` for the full list of token addresses.

---

## Pricing Formula

**Buying:**
```
price = (0.008 + 0.000001 × supply) × sentimentMultiplier
sentimentMultiplier = 1 + (score / 100) × 2   →   1x to 3x
```

Tokens start at ~$1–$2.50 depending on pre-tournament grief score. Price rises as more tokens are bought and shifts when the oracle pushes a new sentiment score.

**Selling:**
```
sell payout = (amount / total supply) × reserve × 95%
```

Sell payouts are proportional to your share of the reserve. The more buyers enter at higher grief prices, the larger the reserve — and the more your share is worth when you exit. This model ensures sells are always covered regardless of sentiment score movement.

---

## Project Structure

```
elegy/
├── app/                    # Next.js pages
│   ├── page.tsx            # Dashboard
│   ├── tokens/             # Token list + detail
│   ├── market/             # Price charts
│   ├── leaderboard/        # Top grief tokens
│   ├── portfolio/          # User holdings
│   ├── blog/               # Blog posts
│   └── docs/               # Protocol documentation
├── components/
│   └── dashboard/          # UI components, ticker, trade modal
├── context/
│   └── elegy-context.tsx   # Global state (tokens + portfolio)
├── hooks/
│   ├── use-grief-tokens.ts # On-chain token data
│   └── use-portfolio.ts    # User holdings
├── lib/
│   ├── contracts.ts        # ABIs + contract addresses
│   ├── posts.ts            # Blog + docs content
│   └── web3.ts             # Wagmi + RainbowKit config
├── backend/
│   └── src/
│       ├── index.ts        # Express server + cron
│       ├── agent.ts        # AI sentiment scoring
│       ├── signer.ts       # ECDSA oracle signer
│       ├── football.ts     # Match result polling
│       └── teams.ts        # All 48 team codes
└── contracts/
    └── contracts/
        ├── GriefToken.sol
        ├── GriefBondingCurve.sol
        └── SentimentOracle.sol
```

---

## Running Locally

### Prerequisites
- Node.js 18+, pnpm
- OKX Wallet or MetaMask connected to X Layer Mainnet (Chain ID 196)

### Frontend
```bash
pnpm install
pnpm dev
```

### Backend
```bash
cd backend
npm install
npx tsx src/index.ts
```

### Environment Variables
```env
NEXT_PUBLIC_XLAYER_MAINNET_RPC=https://rpc.xlayer.tech
NEXT_PUBLIC_XLAYER_MAINNET_CHAIN_ID=196
NEXT_PUBLIC_SENTIMENT_ORACLE=0x234200FF134ddA9B36a1F13E83dEA006aE8A2443
NEXT_PUBLIC_BONDING_CURVE=0xd03dfa9133c19b12ad81320bdc0d3810295b6a21
# ... 48 NEXT_PUBLIC_GRIEF_TOKEN_XXX addresses (see .env.local)
```

### Deploying Contracts
```bash
cd contracts
npx hardhat run scripts/deploy_curve_v2.ts --network xlayer_mainnet
```

---

## Roadmap

### Now (Pre-Tournament — deployed)
- [x] 48 Grief Tokens live on X Layer Mainnet
- [x] AI sentiment agent scoring all teams every 30 minutes
- [x] Pre-tournament grief scores (fan anxiety, expectations, historical heartbreak)
- [x] Bonding curve trading live
- [x] Portfolio tracking
- [x] Live trade ticker
- [x] Docs section with protocol explainers

### When the World Cup Starts (June 11, 2026)
- [ ] Match result polling — detects finished matches and triggers immediate sentiment updates
- [ ] Sentiment spike automation — loss, elimination, or controversy triggers grief score update within minutes
- [ ] Auto-controversy detection — VAR decisions, red cards, disputed penalties

### V2 — Club Season (Post World Cup)
- [ ] Premier League, La Liga, Serie A, Bundesliga, Ligue 1 support
- [ ] 100+ club tokens across the top 5 leagues
- [ ] Year-round grief — 38 matchdays per season, 10 months of trading
- [ ] 24h price change indexer
- [ ] Historical grief chart per team
- [ ] Grief leaderboard with live rank changes during matches
- [ ] Social feed — fan tweets driving sentiment in real time

---

## Built for X Layer Build XCup Hackathon

Elegy was built for the OKX X Layer Build XCup hackathon (deadline May 28, 2026). The concept demonstrates how on-chain sentiment markets can capture real human emotion — not just price speculation — making DeFi feel alive during major sporting events.

The World Cup starts June 11, 2026. The product is live and ready.
