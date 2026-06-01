# BountyHub

A decentralized Q&A platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana.

## Features

- **Bounty System** — Create questions with BBUX bounties; accept answers to distribute rewards
- **Virtual Token Economy** — Earn and spend BBUX through community participation
- **Real-Time Chat** — Global chat, team hubs, and per-post chat rooms via WebSockets
- **Governance & Staking** — Stake BBUX, vote on refund requests, earn daily rewards
- **Bug Bounty Campaigns** — Create campaigns for open source projects
- **GitHub Integration** — Connect repositories and track contributions
- **Integrity Rating** — Community-driven reputation scoring
- **Desktop App** — Native Windows, macOS, and Linux app ([Download](https://bountyhub.tech/download))

## Documentation

| Doc | Description |
|-----|-------------|
| **[docs/ESSENTIALS.md](./docs/ESSENTIALS.md)** | Start here — architecture, quick start, env vars |
| **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** | Cloudflare Pages + Workers deployment |
| **[docs/DESKTOP.md](./docs/DESKTOP.md)** | Tauri desktop builds and releases |
| **In-app [/docs](https://bountyhub.tech/docs)** | User guide, API reference, legal |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7
- **Backend:** Cloudflare Workers, Hono 4, Drizzle ORM
- **Database:** Cloudflare D1 · **Realtime:** Durable Objects + WebSockets
- **Blockchain:** Solana Web3.js
- **Desktop:** Tauri 2

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev:full        # frontend + API
npm run build           # production build
npm run deploy:workers  # deploy API (manual)
```

See [docs/ESSENTIALS.md](./docs/ESSENTIALS.md) for full commands and environment setup.

## Desktop App

```bash
npm run desktop         # dev mode
npm run desktop:build   # production installers
```

Release workflow, signing, and auto-updates: [docs/DESKTOP.md](./docs/DESKTOP.md).

## Brand Assets

```bash
node scripts/generate-brand-images.js
```

Sources: `public/logo.svg`, `og-image.svg`, `social-banner.svg`, `social-square.svg`

## License

Private project — All rights reserved
