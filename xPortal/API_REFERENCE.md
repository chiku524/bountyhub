# portal.ask API Reference

This document provides a comprehensive reference for all API endpoints in the portal.ask platform.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Posts](#posts)
4. [Answers](#answers)
5. [Comments](#comments)
6. [Bounties](#bounties)
7. [Voting](#voting)
8. [Wallet](#wallet)
9. [Integrity](#integrity)
10. [Media](#media)
11. [Legal Documents](#legal-documents)
12. [Error Handling](#error-handling)

---

## Authentication

### POST /login

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
    "id": "507f1f77bcf86cd799439011",
    "username": "username",
    "email": "user@example.com",
    "profilePicture": "https://example.com/avatar.jpg",
    "reputationPoints": 150,
    "integrityScore": 8.5
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid credentials",
  "status": 401
}
```

### POST /signup

Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "username",
    "email": "user@example.com"
  }
}
```

**Error Response:**
```json
{
  "error": "Username already exists",
  "status": 400
}
```

### POST /logout

Logout user and destroy session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### GET /profile

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "username",
    "email": "user@example.com",
    "profilePicture": "https://example.com/avatar.jpg",
    "bio": "Software developer passionate about blockchain",
    "location": "San Francisco, CA",
    "website": "https://example.com",
    "socialLinks": {
      "github": "https://github.com/username",
      "twitter": "https://twitter.com/username"
    },
    "reputationPoints": 150,
    "integrityScore": 8.5,
    "totalRatings": 25,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "posts": 15,
    "answers": 42,
    "comments": 128,
    "bountiesCreated": 8,
    "bountiesWon": 12
  }
}
```

### GET /:username

Get public profile of a specific user.

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "username",
    "profilePicture": "https://example.com/avatar.jpg",
    "bio": "Software developer passionate about blockchain",
    "location": "San Francisco, CA",
    "website": "https://example.com",
    "socialLinks": {
      "github": "https://github.com/username",
      "twitter": "https://twitter.com/username"
    },
    "reputationPoints": 150,
    "integrityScore": 8.5,
    "totalRatings": 25,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "recentPosts": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "How to implement Solana wallet integration?",
      "createdAt": "2024-01-01T00:00:00Z",
      "visibilityVotes": 15,
      "comments": 8
    }
  ],
  "recentActivity": [
    {
      "type": "POST_CREATED",
      "points": 10,
      "description": "Created post: How to implement Solana wallet integration?",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### PUT /settings/profile

Update user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "location": "New York, NY",
  "website": "https://newwebsite.com",
  "socialLinks": {
    "github": "https://github.com/newusername",
    "twitter": "https://twitter.com/newusername"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "username",
    "bio": "Updated bio",
    "location": "New York, NY",
    "website": "https://newwebsite.com",
    "socialLinks": {
      "github": "https://github.com/newusername",
      "twitter": "https://twitter.com/newusername"
    }
  }
}
```

### POST /api/profile/picture

Upload profile picture.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'image' field containing image file
```

**Response:**
```json
{
  "success": true,
  "profilePicture": "https://res.cloudinary.com/example/image/upload/v1234567890/profile.jpg"
}
```

---

## Posts

### GET /community

Get community feed with posts.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page
- `sort` (string, default: "newest"): Sort order ("newest", "trending", "bounty")
- `search` (string, optional): Search query

**Response:**
```json
{
  "posts": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "How to implement Solana wallet integration?",
      "content": "I'm trying to integrate Solana wallet into my React app...",
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "username": "username",
        "profilePicture": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "visibilityVotes": 15,
      "qualityUpvotes": 8,
      "qualityDownvotes": 2,
      "comments": 8,
      "answers": 3,
      "hasBounty": true,
      "bounty": {
        "id": "507f1f77bcf86cd799439013",
        "amount": 10.5,
        "status": "ACTIVE",
        "expiresAt": "2024-12-31T23:59:59Z"
      },
      "media": [
        {
          "id": "507f1f77bcf86cd799439014",
          "type": "image",
          "url": "https://example.com/image.jpg",
          "thumbnailUrl": "https://example.com/thumb.jpg"
        }
      ],
      "userVoted": 1,
      "userQualityVote": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /posts/:postId

Get specific post with answers and comments.

**Response:**
```json
{
  "post": {
    "id": "507f1f77bcf86cd799439012",
    "title": "How to implement Solana wallet integration?",
    "content": "I'm trying to integrate Solana wallet into my React app...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "username",
      "profilePicture": "https://example.com/avatar.jpg",
      "reputationPoints": 150,
      "integrityScore": 8.5
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "visibilityVotes": 15,
    "qualityUpvotes": 8,
    "qualityDownvotes": 2,
    "userVote": 1,
    "userQualityVote": 1,
    "hasBounty": true,
    "bounty": {
      "id": "507f1f77bcf86cd799439013",
      "amount": 10.5,
      "status": "ACTIVE",
      "expiresAt": "2024-12-31T23:59:59Z"
    },
    "media": [
      {
        "id": "507f1f77bcf86cd799439014",
        "type": "image",
        "url": "https://example.com/image.jpg",
        "thumbnailUrl": "https://example.com/thumb.jpg"
      }
    ],
    "codeBlocks": [
      {
        "id": "507f1f77bcf86cd799439015",
        "language": "javascript",
        "code": "const wallet = new Wallet();"
      }
    ]
  },
  "answers": [
    {
      "id": "507f1f77bcf86cd799439016",
      "content": "Here's how to integrate Solana wallet...",
      "author": {
        "id": "507f1f77bcf86cd799439017",
        "username": "expert",
        "profilePicture": "https://example.com/expert.jpg",
        "reputationPoints": 500,
        "integrityScore": 9.2
      },
      "createdAt": "2024-01-01T01:00:00Z",
      "upvotes": 12,
      "downvotes": 1,
      "isAccepted": false,
      "userVote": 1
    }
  ],
  "comments": [
    {
      "id": "507f1f77bcf86cd799439018",
      "content": "Great question! I had the same issue.",
      "author": {
        "id": "507f1f77bcf86cd799439019",
        "username": "helper",
        "profilePicture": "https://example.com/helper.jpg"
      },
      "createdAt": "2024-01-01T00:30:00Z",
      "upvotes": 3,
      "downvotes": 0,
      "userVote": 1
    }
  ]
}
```

### POST /posts/create

Create new post.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with:
- title: string
- content: string
- bounty.amount: number (optional)
- bounty.expiresAt: string (optional)
- media: File[] (optional)
- codeBlocks: string (JSON array)
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "507f1f77bcf86cd799439012",
    "title": "How to implement Solana wallet integration?",
    "content": "I'm trying to integrate Solana wallet into my React app...",
    "createdAt": "2024-01-01T00:00:00Z",
    "bounty": {
      "id": "507f1f77bcf86cd799439013",
      "amount": 10.5,
      "status": "ACTIVE"
    }
  }
}
```

### DELETE /api/posts/delete

Delete a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "postId": "507f1f77bcf86cd799439012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## Answers

### POST /posts/:postId/answers

Add answer to a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Here's how to solve your problem...",
  "codeBlocks": [
    {
      "language": "javascript",
      "code": "const wallet = new Wallet();"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "answer": {
    "id": "507f1f77bcf86cd799439016",
    "content": "Here's how to solve your problem...",
    "author": {
      "id": "507f1f77bcf86cd799439017",
      "username": "expert",
      "profilePicture": "https://example.com/expert.jpg"
    },
    "createdAt": "2024-01-01T01:00:00Z",
    "upvotes": 0,
    "downvotes": 0,
    "isAccepted": false
  }
}
```

### POST /api/answers/:answerId/vote

Vote on an answer.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "value": 1,
  "voteType": "ANSWER"
}
```

**Response:**
```json
{
  "success": true,
  "upvotes": 12,
  "downvotes": 1,
  "userVote": 1
}
```

---

## Comments

### POST /posts/:postId/comments

Add comment to a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Great question! I had the same issue."
}
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "507f1f77bcf86cd799439018",
    "content": "Great question! I had the same issue.",
    "author": {
      "id": "507f1f77bcf86cd799439019",
      "username": "helper",
      "profilePicture": "https://example.com/helper.jpg"
    },
    "createdAt": "2024-01-01T00:30:00Z",
    "upvotes": 0,
    "downvotes": 0
  }
}
```

### POST /api/comments/:commentId/vote

Vote on a comment.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "value": 1,
  "voteType": "COMMENT"
}
```

**Response:**
```json
{
  "success": true,
  "upvotes": 3,
  "downvotes": 0,
  "userVote": 1
}
```

---

## Bounties

### POST /api/bounty/claim

Claim bounty for accepted answer.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "bountyId": "507f1f77bcf86cd799439013",
  "answerId": "507f1f77bcf86cd799439016"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bounty claimed successfully",
  "bounty": {
    "id": "507f1f77bcf86cd799439013",
    "status": "CLAIMED",
    "winnerId": "507f1f77bcf86cd799439017",
    "amount": 10.5
  }
}
```

### GET /api/bounty/:bountyId

Get bounty information.

**Response:**
```json
{
  "bounty": {
    "id": "507f1f77bcf86cd799439013",
    "amount": 10.5,
    "status": "ACTIVE",
    "expiresAt": "2024-12-31T23:59:59Z",
    "post": {
      "id": "507f1f77bcf86cd799439012",
      "title": "How to implement Solana wallet integration?"
    },
    "winner": null
  }
}
```

---

## Voting

### POST /api/posts/:postId/vote

Vote on a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "value": 1,
  "voteType": "POST"
}
```

**Response:**
```json
{
  "success": true,
  "visibilityVotes": 16,
  "userVote": 1
}
```

### POST /api/posts/:postId/quality-vote

Vote on post quality.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "value": 1
}
```

**Response:**
```json
{
  "success": true,
  "qualityUpvotes": 9,
  "qualityDownvotes": 2,
  "userQualityVote": 1
}
```

---

## Wallet

### GET /wallet

Get user wallet information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "wallet": {
    "id": "507f1f77bcf86cd799439020",
    "balance": 100.5,
    "totalDeposited": 200.0,
    "totalWithdrawn": 50.0,
    "totalEarned": 75.0,
    "totalSpent": 25.0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "transactions": [
    {
      "id": "507f1f77bcf86cd799439021",
      "type": "DEPOSIT",
      "amount": 50.0,
      "balanceBefore": 50.5,
      "balanceAfter": 100.5,
      "description": "Deposit",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/wallet/deposit

Deposit funds to virtual wallet.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 50.0,
  "signature": "transaction_signature_here"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "507f1f77bcf86cd799439021",
    "type": "DEPOSIT",
    "amount": 50.0,
    "status": "COMPLETED",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "wallet": {
    "balance": 150.5,
    "totalDeposited": 250.0
  }
}
```

### POST /api/wallet/withdraw

Withdraw funds from virtual wallet.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 25.0,
  "walletAddress": "wallet_address_here"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "507f1f77bcf86cd799439022",
    "type": "WITHDRAWAL",
    "amount": 25.0,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "wallet": {
    "balance": 125.5,
    "totalWithdrawn": 75.0
  }
}
```

### GET /transactions

Get user transaction history.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `type` (string, optional): Filter by transaction type

**Response:**
```json
{
  "transactions": [
    {
      "id": "507f1f77bcf86cd799439021",
      "type": "DEPOSIT",
      "amount": 50.0,
      "description": "Deposit",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439022",
      "type": "BOUNTY_CREATED",
      "amount": 10.5,
      "description": "Created bounty for post",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T01:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

## Integrity

### POST /api/integrity/rate

Rate user integrity.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "targetUserId": "507f1f77bcf86cd799439017",
  "rating": 8,
  "reason": "Provided excellent answer with clear explanations",
  "context": "ANSWER_QUALITY",
  "referenceId": "507f1f77bcf86cd799439016",
  "referenceType": "ANSWER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating": {
    "id": "507f1f77bcf86cd799439023",
    "rating": 8,
    "reason": "Provided excellent answer with clear explanations",
    "context": "ANSWER_QUALITY",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/integrity/contexts

Get available rating contexts.

**Response:**
```json
{
  "contexts": [
    {
      "value": "BOUNTY_REJECTION",
      "label": "Bounty Rejection",
      "description": "User rejected a valid answer to their bounty question"
    },
    {
      "value": "ANSWER_QUALITY",
      "label": "Answer Quality",
      "description": "User provided poor quality or incorrect answers"
    },
    {
      "value": "COMMUNICATION",
      "label": "Communication",
      "description": "User was unresponsive or difficult to communicate with"
    },
    {
      "value": "SPAM",
      "label": "Spam",
      "description": "User posted spam or irrelevant content"
    },
    {
      "value": "HARASSMENT",
      "label": "Harassment",
      "description": "User engaged in harassing behavior"
    },
    {
      "value": "GENERAL",
      "label": "General Behavior",
      "description": "General behavior or conduct issues"
    }
  ]
}
```

### POST /api/integrity/report

Report integrity violation.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "targetUserId": "507f1f77bcf86cd799439017",
  "violationType": "SPAM",
  "description": "User posted promotional content in multiple posts",
  "evidence": "https://example.com/screenshot.jpg",
  "referenceId": "507f1f77bcf86cd799439012",
  "referenceType": "POST"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Violation reported successfully",
  "report": {
    "id": "507f1f77bcf86cd799439024",
    "violationType": "SPAM",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Media

### POST /api/media/upload

Upload media file.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'file' field containing media file
```

**Response:**
```json
{
  "success": true,
  "media": {
    "id": "507f1f77bcf86cd799439014",
    "type": "image",
    "url": "https://res.cloudinary.com/example/image/upload/v1234567890/file.jpg",
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1234567890/thumb.jpg",
    "filename": "screenshot.png",
    "size": 1024000,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Legal Documents

### GET /privacy

Get privacy policy page.

**Response:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - portal.ask</title>
</head>
<body>
    <!-- Privacy policy content -->
</body>
</html>
```

### GET /terms

Get terms of service page.

**Response:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Terms of Service - portal.ask</title>
</head>
<body>
    <!-- Terms of service content -->
</body>
</html>
```

### GET /api/privacy.pdf

Download privacy policy as PDF.

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="portal-ask-privacy-policy.pdf"

[PDF binary data]
```

### GET /api/terms.pdf

Download terms of service as PDF.

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="portal-ask-terms-of-service.pdf"

[PDF binary data]
```

---

## Error Handling

### Error Response Format

All API endpoints return errors in a consistent format:

```json
{
  "error": "Error message describing what went wrong",
  "status": 400,
  "details": "Additional error details (optional)",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate username)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Validation Errors

When validation fails, the response includes field-specific errors:

```json
{
  "error": "Validation failed",
  "status": 422,
  "errors": {
    "email": ["Email is required", "Email format is invalid"],
    "username": ["Username must be between 3 and 20 characters"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

```json
{
  "error": "Rate limit exceeded",
  "status": 429,
  "retryAfter": 60,
  "message": "Too many requests. Please try again in 60 seconds."
}
```

### Authentication Errors

When authentication fails:

```json
{
  "error": "Authentication required",
  "status": 401,
  "message": "Please log in to access this resource"
}
```

### Permission Errors

When user lacks permissions:

```json
{
  "error": "Insufficient permissions",
  "status": 403,
  "message": "You don't have permission to perform this action"
}
```

---

## Rate Limits

### Default Limits
- **Authentication endpoints**: 5 requests per minute
- **Content creation**: 10 requests per minute
- **Voting**: 30 requests per minute
- **API endpoints**: 100 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

### Pagination Format
All list endpoints support pagination with consistent format:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Pagination Parameters
- `page` (number, default: 1): Page number
- `limit` (number, default: 10, max: 100): Items per page

---

## Webhooks

### Webhook Events

The platform supports webhooks for real-time notifications:

#### Event Types
- `post.created`: New post created
- `answer.created`: New answer posted
- `bounty.claimed`: Bounty claimed
- `user.registered`: New user registered

#### Webhook Payload
```json
{
  "event": "post.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "postId": "507f1f77bcf86cd799439012",
    "title": "How to implement Solana wallet integration?",
    "authorId": "507f1f77bcf86cd799439011"
  }
}
```

---

## SDKs and Libraries

### JavaScript/TypeScript SDK

```javascript
import { PortalAPI } from '@portal/sdk';

const api = new PortalAPI({
  baseURL: 'https://portal.ask',
  token: 'your_jwt_token'
});

// Get community posts
const posts = await api.posts.getCommunity({
  page: 1,
  limit: 10,
  sort: 'trending'
});

// Create a post
const post = await api.posts.create({
  title: 'My Question',
  content: 'Question content...',
  bounty: {
    amount: 10.5
  }
});
```

---

## Support

For API support and questions:

- **Email**: bountybucks524@gmail.com
- **Documentation**: https://portal.ask/docs/api
- **Discord**: https://discord.gg/zvB9gwhq
- **GitHub Issues**: https://github.com/portal/issues

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Content management (posts, answers, comments)
- Bounty system
- Voting system
- Wallet management
- Integrity system
- Media uploads
- Legal document endpoints

### Planned Features
- Real-time notifications
- Advanced search API
- Analytics endpoints
- Admin API
- Webhook system
- Rate limiting improvements 