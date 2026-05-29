# Query.in - API Documentation

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

All protected endpoints require JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints Index

| Method | Endpoint | Description |
|--------|----------|-------------|
| [Auth](#auth) | `/auth/*` | Authentication endpoints |
| [FAQs](#faqs) | `/faqs/*` | FAQ CRUD operations |
| [Queries](#queries) | `/queries/*` | Query submission |
| [Ask AI](#ask-ai) | `/ask/*` | RAG + LLM pipeline |
| [Peer](#peer) | `/peer/*` | Peer queue operations |
| [Ratings](#ratings) | `/ratings/*` | Response rating |
| [Admin](#admin) | `/admin/*` | Admin resolution |
| [Analytics](#analytics) | `/analytics/*` | No-FAQ tracking |
| [Announcements](#announcements) | `/announcements/*` | Admin broadcasts |

---

## Auth

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "intern"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64abc123...",
      "email": "user@example.com",
      "role": "intern"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@query.in",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64abc123...",
      "email": "admin@query.in",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET /auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64abc123...",
      "email": "admin@query.in",
      "role": "admin"
    }
  }
}
```

---

## FAQs

### GET /faqs

Get all FAQs (public endpoint).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `search` | string | Search in question/answer |

**Response (200):**
```json
{
  "success": true,
  "count": 125,
  "data": [
    {
      "_id": "64abc123...",
      "clean_question": "How do I reset my password?",
      "answer": "Click on Forgot Password...",
      "category": "Account",
      "tags": ["password", "reset", "account"],
      "priority": 10
    }
  ]
}
```

---

### GET /faqs/search?q=<query>

Search FAQs with auto-complete.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (min 2 chars) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "clean_question": "How do I reset my password?",
      "category": "Account",
      "score": 0.95
    }
  ]
}
```

---

### POST /faqs

Create a new FAQ (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "clean_question": "How do I update my profile?",
  "answer": "Go to Settings > Profile...",
  "category": "Account",
  "tags": ["profile", "update", "settings"],
  "keywords": ["profile", "update"],
  "search_text": "How do I update my profile? Go to Settings...",
  "intent": "update_profile",
  "priority": 5,
  "related_questions": ["How to change name?", "Update avatar?"],
  "escalate_if_uncertain": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "FAQ created successfully",
  "data": {
    "_id": "64abc123..."
  }
}
```

---

## Queries

### GET /api/queries

Get all queries (admin/moderator only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "64abc123...",
      "intern_id": { "email": "intern1@query.in" },
      "query_text": "How do I export my data?",
      "status": "Pending",
      "is_locked": false,
      "createdAt": "2026-05-28T..."
    }
  ]
}
```

---

### POST /api/queries

Submit a new query (intern only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_text": "How do I export my data to PDF?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Query submitted",
  "data": {
    "_id": "64abc123...",
    "status": "Pending",
    "is_locked": false
  }
}
```

---

## Ask AI

### GET /ask/autocomplete?q=<query>

Get auto-complete suggestions (debounced, 300ms).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Partial query (min 2 chars) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "clean_question": "How do I reset password?", "category": "Account" },
    { "clean_question": "How to update profile?", "category": "Account" }
  ]
}
```

---

### POST /ask

Full AI pipeline: RAG search → LLM fallback → Peer escalation.
Includes query sanity validation - garbage input rejected with `INVALID_QUERY` error.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query": "How do I reset my password?",
  "intern_id": "64abc123..."
}
```

**Response (200) - FAQ Found:**
```json
{
  "success": true,
  "source": "rag",
  "resolution": "pending_feedback",
  "answer": "Click on Forgot Password...",
  "faq_id": "64abc123...",
  "match_confidence": 75,
  "message": "Please upvote if satisfied, or downvote to escalate."
}
```

**Response (200) - LLM Fallback:**
```json
{
  "success": true,
  "source": "grok",
  "resolution": "pending_feedback",
  "answer": "Based on your account settings...",
  "message": "Please upvote if satisfied, or downvote to escalate."
}
```

**Response (200) - Escalated to Peer:**
```json
{
  "success": true,
  "resolution": "escalated",
  "query_id": "64abc123...",
  "message": "Your query has been added to the peer escalation queue."
}
```

**Response (400) - Invalid Query:**
```json
{
  "success": false,
  "error": "Please enter a valid question with at least 6 different letters.",
  "code": "INVALID_QUERY"
}
```

**Response (429) - Query Cap Reached:**
```json
{
  "success": false,
  "error": "Escalation blocked: You have 5 unresolved queries.",
  "code": "QUERY_CAP_REACHED"
}
```

---

## Peer

### GET /peer/queue

Get pending queries for peer answering.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc123...",
      "query_text": "How do I export my data?",
      "intern_id": { "email": "intern1@query.in" },
      "status": "Pending",
      "responses": [],
      "createdAt": "2026-05-28T..."
    }
  ]
}
```

---

### GET /peer/my-escalations

Get queries submitted by current intern.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc123...",
      "query_text": "How do I export my data?",
      "status": "Peer Answered",
      "responses": [
        {
          "_id": "64def456...",
          "response_text": "Go to Settings > Export...",
          "author_id": { "email": "intern2@query.in" },
          "rating": null
        }
      ],
      "is_locked": false
    }
  ]
}
```

---

### POST /peer/answer

Submit a peer answer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123...",
  "response_text": "You can export by going to Settings > Data Export",
  "peer_note": "Optional private note for admins only"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "response": {
      "_id": "64def456...",
      "response_type": "peer"
    },
    "query_status": "Pending"
  }
}
```

---

### POST /peer/skip

Skip a query (no penalty).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Query skipped"
}
```

---

### POST /peer/ambiguous

Mark a query as ambiguous (3 peers = auto-escalate). When 3rd strike is reached, the query author (intern) is notified that their query was marked unclear and they should rephrase and resubmit.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123..."
}
```

**Response (200) - Strike 1 or 2:**
```json
{
  "success": true,
  "message": "Marked as ambiguous. Strike 2/3",
  "data": {
    "ambiguous_count": 2,
    "max_ambiguous": 3
  }
}
```

**Response (200) - Strike 3 (Query becomes Ambiguous):**
```json
{
  "success": true,
  "message": "Query marked as ambiguous (3 strikes). Query is now locked and escalated to admins.",
  "query_status": "Ambiguous",
  "is_locked": true
}
```

**Note:** When a query becomes `Ambiguous`, a notification is sent to the intern who submitted the query.

---

## Ratings

### POST /ratings/:id

Rate a peer response (1-5 stars). Triggers locking logic:

- **4-5 stars (HIGH):** Query immediately locked, escalates to Highly-Rated Queue
- **1-3 stars (LOW):** Query stays open for more peer answers
- **1-3 stars + 5 responses:** Query locked, escalates to Low-Rated Queue

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 4
}
```

**Response (200) - High Rating (locks query):**
```json
{
  "success": true,
  "message": "Rating recorded. Query locked due to: High rating (4 stars)",
  "data": {
    "response_id": "64def456...",
    "rating": 4,
    "query_locked": true,
    "lock_reason": "High rating (4 stars)"
  }
}
```

**Response (200) - Low Rating (query stays open):**
```json
{
  "success": true,
  "message": "Rating recorded successfully",
  "data": {
    "response_id": "64def456...",
    "rating": 3,
    "query_locked": false,
    "lock_reason": null
  }
}
```

---

### GET /ratings/query/:id

Get all ratings for a query (query author only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64def456...",
      "rating": 4,
      "response_text": "Go to Settings...",
      "response_type": "peer",
      "createdAt": "2026-05-28T..."
    }
  ]
}
```

---

## Admin

### GET /admin/escalated?type=<type>

Get escalated queries for admin review. Returns 6-section queue structure:
- **master**: All non-resolved queries
- **stagnant**: Locked queries with 0 responses (sweeper-triggered)
- **unanswered**: Non-resolved queries with 0 responses
- **low**: Queries with 5 responses all rated < 4 stars
- **high**: Queries with responses rated >= 4 stars
- **all**: All escalated queries

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | `high`, `low`, `stagnant`, `ambiguous`, or `all` (default) |

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "queue_type": "high",
  "data": [
    {
      "_id": "64abc123...",
      "query_text": "How do I export my data?",
      "intern_id": { "email": "intern1@query.in" },
      "status": "Peer Answered",
      "responses": [...],
      "is_locked": true
    }
  ]
}
```

---

### POST /admin/approve

Approve a peer response as official answer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123...",
  "response_id": "64def456..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Peer response approved. Query resolved.",
  "data": {
    "query_id": "64abc123...",
    "response_id": "64def456...",
    "resolution_type": "peer_approved",
    "resolved_by": "64xyz789..."
  }
}
```

---

### POST /admin/override

Admin provides own answer (bypasses peer responses).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123...",
  "response_text": "The correct answer is: Go to Settings > Privacy > Export",
  "peer_note": "Updating FAQ based on this query"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Admin override accepted. Query resolved.",
  "data": {
    "query_id": "64abc123...",
    "response_id": "64new123...",
    "resolution_type": "admin_override",
    "resolved_by": "64xyz789..."
  }
}
```

---

### POST /admin/create-faq

Create a permanent FAQ entry from a resolved query. Uses the approved peer response or admin override as the answer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query_id": "64abc123...",
  "category": "General",
  "tags": ["tag1", "tag2"],
  "priority": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "FAQ created successfully from query",
  "data": {
    "faq_id": "64new123...",
    "clean_question": "How do I export my data?",
    "category": "General"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "No approved response found to create FAQ from"
}
```

---

## Analytics

### GET /analytics/faq-suggestions

Get FAQ suggestions (occurrence >= 10).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64abc123...",
      "queryText": "How to delete my account?",
      "occurrenceCount": 15,
      "impactedInterns": ["64i1...", "64i2..."],
      "firstLoggedDate": "2026-05-01T...",
      "lastUpdatedDate": "2026-05-28T..."
    }
  ]
}
```

---

### GET /analytics/no-faq

Get all no_faq records.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

---

### GET /analytics/stats

Get analytics summary.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_no_faq": 150,
    "suggestions_ready": 5,
    "avg_occurrences": 3.2,
    "top_gaps": [...]
  }
}
```

---

### DELETE /analytics/suggestions/:id

Dismiss a FAQ suggestion.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Suggestion dismissed"
}
```

---

### POST /analytics/create-faq

Create FAQ from suggestion.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "suggestion_id": "64abc123...",
  "category": "Account",
  "tags": ["account", "delete"],
  "priority": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "FAQ created from suggestion",
  "data": {
    "faq_id": "64new123..."
  }
}
```

---

## Announcements

### GET /announcements

Get all announcements (public for active users).

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc123...",
      "heading": "System Maintenance",
      "content": "Scheduled maintenance on Saturday...",
      "admin_id": { "email": "admin@query.in" },
      "createdAt": "2026-05-28T..."
    }
  ]
}
```

---

### POST /announcements

Create announcement (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "heading": "New Feature Released",
  "content": "We've added dark mode to the dashboard..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Announcement created",
  "data": {
    "_id": "64abc123..."
  }
}
```

---

## Notifications

### GET /notifications

Get notifications for the current user (paginated).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `unread_only` | boolean | Filter to unread only |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc123...",
      "type": "peer_answer",
      "title": "New Peer Answer",
      "message": "intern2@query.in answered your query...",
      "link_id": "64xyz789...",
      "link_type": "query",
      "is_read": false,
      "createdAt": "2026-05-29T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  },
  "unread_count": 5
}
```

---

### GET /notifications/unread-count

Get the count of unread notifications.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "unread_count": 5
}
```

---

### PATCH /notifications/:id/read

Mark a single notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PATCH /notifications/read-all

Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### DELETE /notifications/:id

Delete a notification.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description",
  "message": "Additional context if available"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Something went wrong |