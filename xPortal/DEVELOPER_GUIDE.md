# portal.ask Developer Guide

This guide is for developers who want to understand, contribute to, or extend the portal.ask platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Development Workflow](#development-workflow)
6. [Key Components](#key-components)
7. [Database Schema](#database-schema)
8. [API Reference](#api-reference)
9. [Blockchain Integration](#blockchain-integration)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

---

## Architecture Overview

portal.ask is built as a full-stack web application with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Remix/React)                   │
├─────────────────────────────────────────────────────────────┤
│  Components  │  Routes  │  Utils  │  Styles  │  Types      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Database  │  Blockchain  │  Media  │  PDF        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  MongoDB  │  Cloudinary  │  Solana  │  JWT  │  Puppeteer   │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

- **Server-Side Rendering**: Remix provides SSR for better SEO and performance
- **Type Safety**: TypeScript throughout the application
- **Component-Based**: Reusable React components
- **API-First**: RESTful API design
- **Blockchain-Native**: Solana integration for decentralized features
- **Scalable**: Modular architecture for easy extension

---

## Tech Stack

### Frontend
- **Framework**: Remix 2.8 (React-based)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Icons**: React Icons 5.0
- **Syntax Highlighting**: React Syntax Highlighter
- **Animations**: GSAP 3.12

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Cloudinary
- **PDF Generation**: Puppeteer

### Blockchain
- **Network**: Solana
- **SDK**: @solana/web3.js
- **Framework**: Anchor
- **Wallet Integration**: @solana/wallet-adapter
- **Token**: SPL Token

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Vite
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Database**: Prisma CLI

---

## Project Structure

```
xPortal/
├── app/
│   ├── components/              # React components
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── nav.tsx             # Navigation component
│   │   ├── Footer.tsx          # Footer component
│   │   ├── BountyForm.tsx      # Bounty creation form
│   │   ├── CodeBlockEditor.tsx # Code editor component
│   │   ├── MediaUpload.tsx     # File upload component
│   │   ├── IntegrityDisplay.tsx # Integrity rating display
│   │   └── ...                 # Other components
│   ├── routes/                 # Remix routes (pages)
│   │   ├── _index.tsx          # Home page
│   │   ├── login.tsx           # Login page
│   │   ├── signup.tsx          # Signup page
│   │   ├── profile.tsx         # User profile
│   │   ├── community.tsx       # Community feed
│   │   ├── posts.create.tsx    # Create post
│   │   ├── posts.$postId.tsx   # Post detail
│   │   ├── wallet.tsx          # Wallet management
│   │   ├── settings.tsx        # User settings
│   │   ├── privacy.tsx         # Privacy policy
│   │   ├── terms.tsx           # Terms of service
│   │   └── api/                # API routes
│   ├── utils/                  # Utility functions
│   │   ├── auth.server.ts      # Authentication utilities
│   │   ├── db.server.ts        # Database utilities
│   │   ├── prisma.server.ts    # Prisma client
│   │   ├── reputation.server.ts # Reputation system
│   │   ├── integrity.server.ts # Integrity system
│   │   ├── virtual-wallet.server.ts # Wallet management
│   │   ├── cloudinary.server.ts # Media upload
│   │   ├── pdf.server.ts       # PDF generation
│   │   ├── solana.server.ts    # Blockchain utilities
│   │   └── validators.server.ts # Input validation
│   ├── styles/                 # CSS files
│   ├── types/                  # TypeScript type definitions
│   ├── root.tsx                # Root component
│   ├── entry.client.tsx        # Client entry point
│   ├── entry.server.tsx        # Server entry point
│   └── tailwind.css            # Main CSS file
├── prisma/
│   └── schema.prisma           # Database schema
├── programs/                   # Solana programs
│   └── bounty-program/         # Bounty smart contract
├── public/                     # Static assets
├── docs/                       # Documentation
└── package.json                # Dependencies and scripts
```

---

## Setup & Installation

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Latest version
- **MongoDB**: Local installation or MongoDB Atlas account
- **Solana CLI**: For blockchain development
- **Anchor Framework**: For smart contract development

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xPortal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portal?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# Cloudinary (Media Upload)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Solana Configuration
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"

# Application
NODE_ENV="development"
PORT="3000"
```

### Database Setup

1. **Create MongoDB database**
   - Use MongoDB Atlas or local MongoDB
   - Create a new database named `portal`

2. **Run Prisma migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

---

## Development Workflow

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Define types for all data structures
- Use interfaces for object shapes
- Avoid `any` type when possible

#### ESLint Configuration
```json
{
  "extends": [
    "@remix-run/eslint-config",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

#### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Routes**: kebab-case (e.g., `user-profile.tsx`)
- **Utilities**: camelCase (e.g., `authUtils.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build or tool changes

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run typecheck

# Database operations
npx prisma studio          # Open database GUI
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema changes
npx prisma migrate dev     # Create and apply migration
```

---

## Key Components

### Authentication System

#### Implementation
```typescript
// app/utils/auth.server.ts
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');
  
  return createUserSession(user.id, '/profile');
}
```

#### Usage
```typescript
// In route files
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) throw redirect('/login');
  return json({ user });
};
```

### Database Layer

#### Prisma Schema Example
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  username  String   @unique
  password  String
  solanaAddress String? @unique
  reputationPoints Int @default(0)
  integrityScore Float @default(5.0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile   Profile?
  posts     Posts[]
  comments  Comment[]
  answers   Answer[]
  votes     Vote[]
  virtualWallet VirtualWallet?
}
```

#### Database Operations
```typescript
// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    username: 'username',
    password: hashedPassword,
  },
});

// Find user with relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: true,
    profile: true,
    virtualWallet: true,
  },
});
```

### Blockchain Integration

#### Solana Connection
```typescript
// app/utils/solana.server.ts
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl('devnet')
);

export async function getBalance(publicKey: string) {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / LAMPORTS_PER_SOL;
}
```

#### Wallet Integration
```typescript
// app/components/WalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Media Upload System

#### Cloudinary Integration
```typescript
// app/utils/cloudinary.server.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: Buffer, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file);
  });
}
```

### PDF Generation

#### Puppeteer Integration
```typescript
// app/utils/pdf.server.ts
import puppeteer from 'puppeteer';

export class PDFService {
  static async generatePDF(htmlContent: string, options = {}) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      ...options,
    });
    
    await browser.close();
    return pdfBuffer;
  }
}
```

---

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  username  String   @unique
  password  String
  solanaAddress String? @unique
  tokenAccountAddress String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  profile   Profile?
  posts     Posts[]
  comments  Comment[]
  answers   Answer[]
  votes     Vote[]
  reputationHistory ReputationHistory[]
  bountyWinners Bounty[] @relation("BountyWinners")
  virtualWallet VirtualWallet?
  walletTransactions WalletTransaction[]
  
  // Integrity system
  integrityScore Float @default(5.0)
  totalRatings Int @default(0)
  integrityViolations IntegrityViolation[] @relation("ViolationTarget")
  integrityHistory IntegrityHistory[] @relation("HistoryTarget")
  ratingsGiven UserRating[] @relation("RatingGiver")
  ratingsReceived UserRating[] @relation("RatingReceiver")
}
```

#### Posts Model
```prisma
model Posts {
  id              String      @id @default(auto()) @map("_id") @db.ObjectId
  title           String
  content         String
  authorId        String      @db.ObjectId
  author          User        @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  status          PostStatus  @default(OPEN)
  
  // Relations
  comments        Comment[]
  answers         Answer[]
  votes           Vote[]
  bounty          Bounty?
  media           Media[]
  codeBlocks      CodeBlock[]
  
  // Computed fields
  visibilityVotes Int @default(0)
  qualityUpvotes  Int @default(0)
  qualityDownvotes Int @default(0)
}
```

#### Bounty Model
```prisma
model Bounty {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  postId        String    @db.ObjectId
  post          Posts     @relation(fields: [postId], references: [id], onDelete: Cascade)
  amount        Float
  status        BountyStatus @default(ACTIVE)
  winnerId      String?   @db.ObjectId
  winner        User?     @relation("BountyWinners", fields: [winnerId], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  expiresAt     DateTime?
  signature     String?
  mintAddress   String?
  tokenDecimals Int      @default(9)
  walletTransactions WalletTransaction[]

  @@unique([postId])
  @@index([winnerId])
  @@map("bounties")
}
```

### Indexes and Performance

#### Database Indexes
```prisma
// User indexes
@@index([email])
@@index([username])
@@index([solanaAddress])

// Post indexes
@@index([authorId])
@@index([createdAt])
@@index([status])

// Vote indexes
@@index([userId, postId])
@@index([userId, answerId])
@@index([userId, commentId])

// Bounty indexes
@@index([status])
@@index([expiresAt])
@@index([winnerId])
```

---

## API Reference

### Authentication Endpoints

#### POST /login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com"
  }
}
```

#### POST /signup
Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

### Content Endpoints

#### GET /community
Get community feed with posts.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort order (newest, trending, bounty)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "title": "Post Title",
      "content": "Post content",
      "author": {
        "id": "author_id",
        "username": "username",
        "profilePicture": "url"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "visibilityVotes": 10,
      "comments": 5,
      "hasBounty": true,
      "bounty": {
        "id": "bounty_id",
        "amount": 10.5,
        "status": "ACTIVE"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### POST /posts/create
Create new post.

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content",
  "bounty": {
    "amount": 10.5,
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### Bounty Endpoints

#### POST /api/bounty/claim
Claim bounty for accepted answer.

**Request Body:**
```json
{
  "bountyId": "bounty_id",
  "answerId": "answer_id"
}
```

### Wallet Endpoints

#### GET /wallet
Get user wallet information.

**Response:**
```json
{
  "wallet": {
    "id": "wallet_id",
    "balance": 100.5,
    "totalDeposited": 200.0,
    "totalWithdrawn": 50.0,
    "totalEarned": 75.0,
    "totalSpent": 25.0
  },
  "transactions": [
    {
      "id": "tx_id",
      "type": "DEPOSIT",
      "amount": 50.0,
      "description": "Deposit",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/wallet/deposit
Deposit funds to virtual wallet.

**Request Body:**
```json
{
  "amount": 50.0,
  "signature": "transaction_signature"
}
```

### Voting Endpoints

#### POST /api/posts/:postId/vote
Vote on post.

**Request Body:**
```json
{
  "value": 1,
  "voteType": "POST"
}
```

### Integrity Endpoints

#### POST /api/integrity/rate
Rate user integrity.

**Request Body:**
```json
{
  "targetUserId": "user_id",
  "rating": 8,
  "reason": "Helpful answer",
  "context": "ANSWER_QUALITY"
}
```

---

## Blockchain Integration

### Solana Program (Smart Contract)

#### Program Structure
```
programs/bounty-program/
├── Cargo.toml
└── src/
    └── lib.rs
```

#### Key Functions
```rust
// Create bounty
pub fn create_bounty(
    ctx: Context<CreateBounty>,
    amount: u64,
    expires_at: i64,
) -> Result<()> {
    // Implementation
}

// Claim bounty
pub fn claim_bounty(
    ctx: Context<ClaimBounty>,
) -> Result<()> {
    // Implementation
}

// Refund bounty
pub fn refund_bounty(
    ctx: Context<RefundBounty>,
) -> Result<()> {
    // Implementation
}
```

### Wallet Integration

#### Wallet Adapter Setup
```typescript
// app/components/WalletProvider.tsx
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [new PhantomWalletAdapter()];

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
```

#### Transaction Handling
```typescript
// app/utils/solana.server.ts
export async function createBountyTransaction(
  userWallet: PublicKey,
  amount: number,
  bountyId: string
) {
  const transaction = new Transaction();
  
  // Add instruction to create bounty
  const createBountyIx = await program.methods
    .createBounty(new BN(amount), new BN(Date.now() + 86400000))
    .accounts({
      user: userWallet,
      bounty: bountyPDA,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  
  transaction.add(createBountyIx);
  
  return transaction;
}
```

---

## Testing

### Testing Strategy

#### Unit Tests
- **Utilities**: Test individual functions
- **Components**: Test React components in isolation
- **API Routes**: Test route handlers

#### Integration Tests
- **Database**: Test database operations
- **Authentication**: Test login/signup flows
- **API**: Test complete API endpoints

#### E2E Tests
- **User Flows**: Test complete user journeys
- **Critical Paths**: Test bounty creation and claiming

### Test Setup

#### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapping: {
    '^~/(.*)$': '<rootDir>/app/$1',
  },
};
```

#### Test Examples
```typescript
// test/auth.test.ts
describe('Authentication', () => {
  test('should create user account', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };
    
    const user = await createUser(userData);
    expect(user.email).toBe(userData.email);
    expect(user.username).toBe(userData.username);
  });
});

// test/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PostCard } from '~/components/PostCard';

describe('PostCard', () => {
  test('should display post title and author', () => {
    const post = {
      id: '1',
      title: 'Test Post',
      author: { username: 'testuser' },
    };
    
    render(<PostCard post={post} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
```

---

## Deployment

### Production Setup

#### Environment Configuration
```env
NODE_ENV=production
DATABASE_URL=production_mongodb_url
CLOUDINARY_CLOUD_NAME=production_cloud_name
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret
JWT_SECRET=production_jwt_secret
SOLANA_RPC_URL=production_solana_url
```

#### Build Process
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Start production server
npm start
```

#### Deployment Platforms

**Vercel (Frontend)**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build/client",
  "installCommand": "npm ci",
  "framework": "remix"
}
```

**Railway (Backend)**
```json
// railway.json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "on_failure"
  }
}
```

### Monitoring & Analytics

#### Error Tracking
```typescript
// app/utils/error.server.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export function captureError(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context,
  });
}
```

#### Performance Monitoring
```typescript
// app/utils/performance.server.ts
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`${name} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`${name} failed after ${duration}ms:`, error);
    throw error;
  }
}
```

---

## Contributing

### Development Guidelines

#### Code Quality
- Write clean, readable code
- Add comments for complex logic
- Use meaningful variable names
- Follow TypeScript best practices

#### Testing Requirements
- Write tests for new features
- Maintain test coverage above 80%
- Test both success and error cases
- Update tests when modifying existing code

#### Documentation
- Update documentation for new features
- Add JSDoc comments for functions
- Keep README files current
- Document API changes

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**
   - Write code following guidelines
   - Add tests for new functionality
   - Update documentation

3. **Test locally**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

4. **Submit pull request**
   - Provide clear description
   - Include screenshots if UI changes
   - Link related issues

5. **Code review**
   - Address reviewer feedback
   - Make requested changes
   - Ensure CI passes

### Issue Reporting

#### Bug Reports
- Provide clear description of the issue
- Include steps to reproduce
- Add screenshots if relevant
- Specify browser and OS

#### Feature Requests
- Explain the problem you're solving
- Describe the desired solution
- Consider implementation complexity
- Check if similar features exist

---

## Conclusion

This developer guide provides a comprehensive overview of the portal.ask platform architecture and development process. For additional information, refer to:

- [Platform Documentation](./PLATFORM_DOCUMENTATION.md)
- [User Guide](./USER_GUIDE.md)
- [Legal Documents](./LEGAL_DOCUMENTS_README.md)
- [API Reference](./API_REFERENCE.md)

### Getting Help

- **Documentation**: Check this guide and related docs
- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join our Discord for real-time help

### Resources

- [Remix Documentation](https://remix.run/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Solana Documentation](https://docs.solana.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

Happy coding! 🚀 