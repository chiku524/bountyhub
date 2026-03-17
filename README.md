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
- **Desktop App**: Native app for Windows, macOS, and Linux — [Download](https://bountyhub.tech/download) (Tauri)

## 📖 Documentation

- [Project docs](./docs/README.md) – Deployment (Cloudflare Pages & Workers, DNS, troubleshooting) and tech stack
- **In-app docs**: [Documentation](/docs) – single page with table of contents (Overview, Platform Features, User Guide, Developer Guide, API Reference, Deployment, Legal, Refund System)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono, Drizzle ORM
- **Database**: Cloudflare D1 (SQLite)
- **Blockchain**: Solana Web3.js
- **Deployment**: Cloudflare Pages (auto-deploy) + Cloudflare Workers

## 🚢 Deployment

This project uses **auto-deployment from GitHub** for Cloudflare Pages and **manual deployment** for Cloudflare Workers.

See [docs/README.md](./docs/README.md#deployment-guide) for complete deployment instructions.

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