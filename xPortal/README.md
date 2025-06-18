# xPortal - Solana-Powered Community Platform

A modern community platform built with Remix, featuring Solana blockchain integration for bounties and rewards.

## Features

- User authentication and profiles
- Post creation with media uploads
- Code block support
- Voting and reputation system
- Solana-powered bounty system
- Real-time interactions

## Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Solana wallet (Phantom, Solflare, etc.)
- Access to Solana devnet/mainnet

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portal?retryWrites=true&w=majority"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Solana Program

The bounty system uses a custom Solana program built with Anchor. To deploy:

1. Install Anchor CLI
2. Build the program:
   ```bash
   anchor build
   ```

3. Deploy to devnet:
   ```bash
   anchor deploy --provider.cluster devnet
   ```

## Usage

1. Connect your Solana wallet
2. Create posts with optional bounties
3. Vote on posts and answers
4. Claim bounties for accepted answers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
