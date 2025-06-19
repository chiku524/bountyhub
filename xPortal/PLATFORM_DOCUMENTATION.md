# portal.ask Platform Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [User Guide](#user-guide)
5. [Developer Guide](#developer-guide)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

portal.ask is a decentralized knowledge-sharing platform built on the Solana blockchain. It combines traditional Q&A functionality with blockchain-powered bounties, reputation systems, and virtual currency to create an incentivized learning environment.

### Key Concepts

- **Knowledge Sharing**: Users can ask questions, provide answers, and share insights
- **Bounty System**: Question creators can offer rewards for accepted answers
- **Reputation System**: Users earn reputation points for quality contributions
- **Integrity System**: Community-driven rating system to maintain quality
- **Virtual Wallet**: In-platform currency management for bounties and rewards

### Technology Stack

- **Frontend**: React 18, Remix 2.8, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB with Prisma ORM
- **Blockchain**: Solana (Web3.js, Anchor Framework)
- **Styling**: Tailwind CSS
- **Media**: Cloudinary for file uploads
- **PDF Generation**: Puppeteer

---

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Remix/React) │◄──►│   (Node.js)     │◄──►│   (Solana)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudinary    │    │   MongoDB       │    │   Virtual       │
│   (Media)       │    │   (Database)    │    │   Wallet        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema

#### Core Models
- **User**: Authentication, profiles, reputation
- **Posts**: Questions and content
- **Answers**: Responses to questions
- **Comments**: Discussion threads
- **Bounty**: Reward system for questions
- **VirtualWallet**: In-platform currency management
- **Vote**: Voting system for content quality
- **UserRating**: Integrity and reputation ratings

#### Key Relationships
- Users can create posts, answers, and comments
- Posts can have bounties attached
- Users can vote on content and rate each other
- Virtual wallets track user balances and transactions

---

## Features

### 1. User Authentication & Profiles

#### Registration & Login
- Email-based authentication
- Username uniqueness validation
- Password security with bcrypt
- Session management with JWT

#### Profile Management
- Customizable profile pictures
- Bio and personal information
- Social media links
- Reputation score display
- Activity history

#### Social Features
- Follow other users
- View user activity feeds
- Profile picture uploads
- Social media integration

### 2. Content Creation & Management

#### Posts (Questions)
- Rich text editor with markdown support
- Code block syntax highlighting
- Media uploads (images, videos, screen recordings)
- Tags and categorization
- Draft saving and editing

#### Answers
- Rich text responses
- Code examples with syntax highlighting
- Media attachments
- Voting system
- Acceptance by question author

#### Comments
- Threaded discussions
- Voting system
- Rich text support
- Real-time updates

### 3. Bounty System

#### Creating Bounties
- Attach rewards to questions
- Set bounty amounts in PORTAL tokens
- Optional expiration dates
- Automatic escrow of funds

#### Claiming Bounties
- Question author accepts answers
- Automatic payout to answer author
- Transaction history tracking
- Dispute resolution system

#### Bounty Management
- Active bounty tracking
- Expired bounty handling
- Refund mechanisms
- Bounty history

### 4. Reputation System

#### Earning Points
- **Post Creation**: +10 points
- **Answer Creation**: +5 points
- **Answer Acceptance**: +15 points
- **Upvotes Received**: +2 points
- **Downvotes Received**: -1 point
- **Quality Upvotes**: +5 points
- **Quality Downvotes**: -2 points

#### Reputation Levels
- **Beginner**: 0-99 points
- **Contributor**: 100-499 points
- **Expert**: 500-999 points
- **Master**: 1000+ points

#### Reputation History
- Detailed point tracking
- Action-based history
- Time-based analytics
- Achievement badges

### 5. Integrity System

#### User Ratings
- 1-10 rating scale
- Context-based ratings
- Rating categories:
  - Bounty Rejection
  - Answer Quality
  - Communication
  - Spam
  - Harassment
  - General Behavior

#### Rating Features
- Anonymous rating system
- Context-specific ratings
- Rating history tracking
- Community moderation tools

#### Integrity Score
- Average rating calculation
- Total ratings count
- Score impact on reputation
- Community trust indicators

### 6. Virtual Wallet System

#### Wallet Features
- Virtual balance tracking
- Transaction history
- Deposit/withdrawal capabilities
- Bounty management
- Earnings tracking

#### Transaction Types
- **DEPOSIT**: Add funds to wallet
- **WITHDRAWAL**: Remove funds from wallet
- **BOUNTY_CREATED**: Create new bounty
- **BOUNTY_CLAIMED**: Win bounty reward
- **BOUNTY_REFUNDED**: Get bounty refund

#### Balance Management
- Real-time balance updates
- Transaction confirmations
- Error handling
- Audit trail

### 7. Voting System

#### Content Voting
- Upvote/downvote posts
- Upvote/downvote answers
- Upvote/downvote comments
- Quality voting for posts

#### Voting Features
- One vote per user per item
- Vote change capabilities
- Vote history tracking
- Vote impact on reputation

### 8. Media Management

#### Upload Support
- Images (JPG, PNG, GIF)
- Videos (MP4, WebM)
- Screen recordings
- File size limits
- Format validation

#### Media Features
- Automatic thumbnails
- Cloudinary integration
- CDN delivery
- Responsive display
- Lazy loading

### 9. Search & Discovery

#### Content Discovery
- Community feed
- Trending posts
- Bounty highlights
- User activity feeds
- Tag-based filtering

#### Search Features
- Full-text search
- User search
- Tag search
- Advanced filters
- Search history

---

## User Guide

### Getting Started

#### 1. Account Creation
1. Visit portal.ask
2. Click "Sign Up"
3. Enter email and username
4. Create password
5. Verify email (if required)

#### 2. Profile Setup
1. Upload profile picture
2. Add bio and personal information
3. Connect social media accounts
4. Set privacy preferences

#### 3. First Steps
1. Explore the community feed
2. Read existing posts and answers
3. Vote on content you find helpful
4. Create your first post or answer

### Creating Content

#### Writing a Post
1. Click "Create Post"
2. Enter title and content
3. Add code blocks if needed
4. Upload media files
5. Add tags for categorization
6. Optionally add a bounty
7. Publish your post

#### Providing Answers
1. Navigate to a question
2. Click "Add Answer"
3. Write your response
4. Include code examples if relevant
5. Submit your answer

#### Adding Comments
1. Scroll to comments section
2. Click "Add Comment"
3. Write your comment
4. Submit to join the discussion

### Bounty System

#### Creating a Bounty
1. Create a new post
2. Click "Add Bounty"
3. Enter bounty amount
4. Set expiration date (optional)
5. Confirm bounty creation

#### Claiming a Bounty
1. Provide a quality answer
2. Wait for question author to accept
3. Receive automatic payout
4. Check transaction history

### Reputation & Integrity

#### Building Reputation
- Create quality content
- Provide helpful answers
- Vote on content appropriately
- Maintain good community standing

#### Rating Other Users
1. Click integrity rating button
2. Select rating context
3. Choose rating (1-10)
4. Provide reason for rating
5. Submit rating

### Wallet Management

#### Depositing Funds
1. Navigate to wallet page
2. Click "Deposit"
3. Choose deposit method
4. Enter amount
5. Complete transaction

#### Withdrawing Funds
1. Go to wallet page
2. Click "Withdraw"
3. Enter amount
4. Confirm withdrawal
5. Check transaction status

---

## Developer Guide

### Project Structure

```
xPortal/
├── app/
│   ├── components/          # React components
│   ├── routes/             # Remix routes
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS files
│   └── types/              # TypeScript types
├── prisma/                 # Database schema
├── programs/               # Solana programs
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Setup Instructions

#### Prerequisites
- Node.js 20+
- MongoDB database
- Solana CLI tools
- Anchor Framework

#### Installation
```bash
# Clone repository
git clone <repository-url>
cd xPortal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

#### Environment Variables
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/portal"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_jwt_secret

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Key Components

#### Authentication System
- JWT-based authentication
- Session management
- Password hashing with bcrypt
- User validation

#### Database Layer
- Prisma ORM
- MongoDB connection
- Schema management
- Migration handling

#### Blockchain Integration
- Solana Web3.js
- Anchor Framework
- Wallet adapter integration
- Transaction handling

#### Media Management
- Cloudinary integration
- File upload handling
- Image optimization
- Video processing

### Development Workflow

#### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

#### Testing
- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Performance testing

#### Deployment
- Vercel for frontend
- Railway for backend
- MongoDB Atlas for database
- Solana devnet/mainnet

---

## API Reference

### Authentication Endpoints

#### POST /login
Authenticate user and create session.

**Request:**
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

**Request:**
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

#### POST /posts/create
Create new post.

**Request:**
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

#### GET /posts/:postId
Get specific post with answers and comments.

#### POST /posts/:postId/answers
Add answer to post.

### Bounty Endpoints

#### POST /api/bounty/claim
Claim bounty for accepted answer.

**Request:**
```json
{
  "bountyId": "bounty_id",
  "answerId": "answer_id"
}
```

### Wallet Endpoints

#### GET /wallet
Get user wallet information.

#### POST /api/wallet/deposit
Deposit funds to virtual wallet.

#### POST /api/wallet/withdraw
Withdraw funds from virtual wallet.

### Voting Endpoints

#### POST /api/posts/:postId/vote
Vote on post.

**Request:**
```json
{
  "value": 1,
  "voteType": "POST"
}
```

#### POST /api/answers/:answerId/vote
Vote on answer.

### Integrity Endpoints

#### POST /api/integrity/rate
Rate user integrity.

**Request:**
```json
{
  "targetUserId": "user_id",
  "rating": 8,
  "reason": "Helpful answer",
  "context": "ANSWER_QUALITY"
}
```

---

## Deployment

### Production Setup

#### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy application

#### Backend Deployment (Railway)
1. Connect repository
2. Configure Node.js environment
3. Set environment variables
4. Deploy application

#### Database Setup (MongoDB Atlas)
1. Create cluster
2. Configure network access
3. Create database user
4. Get connection string

#### Solana Program Deployment
1. Build Anchor program
2. Deploy to devnet/mainnet
3. Update program IDs
4. Test functionality

### Environment Configuration

#### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL=production_mongodb_url
CLOUDINARY_CLOUD_NAME=production_cloud_name
CLOUDINARY_API_KEY=production_api_key
CLOUDINARY_API_SECRET=production_api_secret
JWT_SECRET=production_jwt_secret
SOLANA_RPC_URL=production_solana_url
```

#### Security Considerations
- Use strong JWT secrets
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Monitor for security issues

### Monitoring & Analytics

#### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- User analytics
- Database monitoring

#### Blockchain Monitoring
- Transaction monitoring
- Wallet balance tracking
- Gas fee optimization
- Network status monitoring

---

## Troubleshooting

### Common Issues

#### Authentication Problems
- **Issue**: Login not working
- **Solution**: Check JWT secret and database connection
- **Prevention**: Regular secret rotation

#### Database Issues
- **Issue**: Connection timeouts
- **Solution**: Check MongoDB connection string and network
- **Prevention**: Connection pooling and monitoring

#### Blockchain Issues
- **Issue**: Transaction failures
- **Solution**: Check Solana RPC endpoint and network status
- **Prevention**: Multiple RPC endpoints and retry logic

#### Media Upload Issues
- **Issue**: File upload failures
- **Solution**: Check Cloudinary credentials and file size limits
- **Prevention**: File validation and size restrictions

### Performance Optimization

#### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

#### Backend Optimization
- Database indexing
- Query optimization
- Caching layers
- Rate limiting

#### Blockchain Optimization
- Transaction batching
- Gas fee optimization
- RPC endpoint selection
- Connection pooling

### Security Best Practices

#### Authentication Security
- Strong password requirements
- Rate limiting on auth endpoints
- Session timeout configuration
- CSRF protection

#### Data Security
- Input validation
- SQL injection prevention
- XSS protection
- Data encryption

#### Blockchain Security
- Private key management
- Transaction signing security
- Wallet connection validation
- Smart contract auditing

---

## Support & Resources

### Documentation
- [API Documentation](./API_REFERENCE.md)
- [Legal Documents](./LEGAL_DOCUMENTS_README.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Community
- [Discord Server](https://discord.gg/zvB9gwhq)
- [GitHub Repository](https://github.com/portal)
- [X (Twitter)](https://x.com/portal_ask)

### Contact
- **Email**: bountybucks524@gmail.com
- **Platform**: portal.ask
- **Support**: Available through Discord and email

---

## Version History

### v1.0.0 (Current)
- Initial platform release
- Core Q&A functionality
- Bounty system
- Reputation and integrity systems
- Virtual wallet
- Media uploads
- PDF generation for legal documents

### Planned Features
- Mobile application
- Advanced search functionality
- AI-powered content moderation
- Multi-language support
- Advanced analytics dashboard
- Community governance tools

---

**Note**: This documentation is continuously updated. For the latest information, please check the repository or contact the development team. 