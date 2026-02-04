# BountyHub

A decentralized Q&A platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana.

## 🚀 Features

- **Decentralized Bounty System**: Create bounties with BBUX tokens to incentivize quality answers
- **Virtual Token Economy**: Earn and spend BBUX tokens through community participation
- **Real-Time Global Chat**: Community-wide chat with emoji and GIF support
- **Governance & Staking**: Participate in platform governance and earn staking rewards
- **Bug Bounty Campaigns**: Create and manage bug bounty campaigns for open source projects
- **GitHub Integration**: Connect GitHub repositories and track contributions
- **Integrity Rating System**: Community-driven reputation and integrity scoring
- **Light/Dark Mode**: Beautiful, responsive UI with theme support
- **Mobile Responsive**: Optimized experience across all devices
- **PWA Support**: Installable progressive web app for desktop and mobile

## 📖 Documentation

- [Deployment Guide](./docs/deployment.md) – Cloudflare Pages & Workers, DNS, troubleshooting
- [Tech Stack](./docs/tech-stack.md) – Current stack and optional upgrades
- **In-app docs** (when running the app): [Platform](/docs/platform), [User Guide](/docs/user-guide), [Developer Guide](/docs/developer-guide), [API Reference](/docs/api-reference)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono, Drizzle ORM
- **Database**: Cloudflare D1 (SQLite)
- **Blockchain**: Solana Web3.js
- **Deployment**: Cloudflare Pages (auto-deploy) + Cloudflare Workers

## 🚢 Deployment

This project uses **auto-deployment from GitHub** for Cloudflare Pages and **manual deployment** for Cloudflare Workers.

See [docs/deployment.md](./docs/deployment.md) for complete deployment instructions.

## 📝 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev:full

# Build for production
npm run build

# Deploy Workers (manual)
npm run deploy:workers
```

## 📄 License

Private project - All rights reserved 