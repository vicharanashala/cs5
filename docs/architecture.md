# Query.in - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                         React + Vite                            │
│                    Tailwind CSS (B&W Theme)                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST + Socket.IO
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js + Express)                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Auth   │  │   FAQ    │  │  Query   │  │   Ask    │        │
│  │  Routes  │  │  Routes  │  │  Routes  │  │   AI     │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │            │             │             │                │
│  ┌────┴────────────┴─────────────┴─────────────┴────┐           │
│  │              Controllers Layer                   │           │
│  │  authController, faqController, queryController   │           │
│  │  askAIController, peerController, ratingController│           │
│  │  adminController, announcementController         │           │
│  │  analyticsController                            │           │
│  └────────────────────┬───────────────────────────┘           │
│                       │                                       │
│  ┌────────────────────┴───────────────────────────┐         │
│  │              Services Layer                       │         │
│  │  grokService.js (Gemini + Groq LLM integration)  │         │
│  └──────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Mongoose ODM
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas Cluster                       │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  User   │  │  Query  │  │Response │  │   FAQ   │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│  ┌─────────┐  ┌─────────┐                                    │
│  │  NoFaq  │  │Announce │                                    │
│  └─────────┘  └─────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (React + Vite)

### Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── Badge.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── DashboardLayout.jsx
│   ├── FormattedAnswer.jsx
│   └── ProtectedRoute.jsx
├── context/              # React Context for state management
│   └── AuthContext.jsx   # JWT token & user state
├── pages/                # Page components by role
│   ├── Landing.jsx
│   ├── FAQs.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   └── AdminSuggestions.jsx
│   ├── moderator/
│   │   └── ModeratorDashboard.jsx
│   └── intern/
│       ├── InternDashboard.jsx
│       ├── AskAI.jsx
│       ├── PeerQueue.jsx
│       ├── MyEscalations.jsx
│       ├── ViewFAQs.jsx
│       └── Announcements.jsx
├── utils/                # Utility functions
│   ├── api.js            # Protected axios instance
│   └── publicApi.js      # Public axios instance (no interceptor)
├── App.jsx               # Router configuration
├── main.jsx              # Entry point
└── index.css             # Global styles (B&W theme)
```

### State Management

**AuthContext.jsx**
```javascript
// Manages:
// - JWT token storage in localStorage
// - User authentication state
// - Login/logout functions
// - Auto-redirect on token expiry
```

### Routing (App.jsx)

```
/                  → Landing (public, embedded login)
/faqs              → FAQs (public, accordion view)
/login             → Login page
/dashboard         → Role-based dashboard redirect
/admin             → AdminDashboard (protected, admin only)
/admin/suggestions → AdminSuggestions (protected, admin only)
/moderator         → ModeratorDashboard (protected, moderator+)
/intern            → InternDashboard (protected, intern only)
/intern/ask        → AskAI (protected, intern only)
/intern/queue      → PeerQueue (protected, intern only)
/intern/escalations→ MyEscalations (protected, intern only)
/intern/faqs       → ViewFAQs (protected, intern only)
/intern/announcements→ Announcements (protected, intern only)
```

### Protected Routes

```javascript
// ProtectedRoute.jsx wraps routes requiring authentication
// Checks:
// 1. Token exists in localStorage
// 2. User role matches allowed roles
// 3. Redirects to / on unauthorized
```

### Axios Configuration

**api.js (Protected)**
```javascript
// Interceptor adds:
// - Authorization: Bearer <token>
// - Handles 401 → redirect to login
```

**publicApi.js (Public)**
```javascript
// No auth header
// No 401 redirect
// Used for /faqs public endpoint
```

---

## Backend Architecture (Express + Node.js)

### Directory Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB Atlas connection
│   └── socket.js          # Socket.IO initialization
├── controllers/           # Request handlers
│   ├── authController.js  # login, register, getMe
│   ├── faqController.js   # CRUD for FAQs
│   ├── queryController.js # Query submission
│   ├── askAIController.js # RAG + Gemini pipeline
│   ├── peerController.js  # Peer queue operations
│   ├── ratingController.js# 1-5 star rating logic
│   ├── adminController.js # Escalation resolution
│   ├── announcementController.js
│   └── analyticsController.js
├── jobs/
│   └── sweeper.js         # 24-hour cron job
├── middleware/
│   └── authMiddleware.js  # protect, authorizeRoles
├── models/                # Mongoose schemas
├── routes/                # Express routers
├── services/
│   └── grokService.js   # LLM service (Gemini + Groq)
├── server.js              # Entry point
└── package.json
```

### Server Entry Point (server.js)

```javascript
// 1. Initialize Express + HTTP server
// 2. Initialize Socket.IO with JWT auth
// 3. Configure CORS
// 4. Mount all route prefixes
// 5. Start server + MongoDB connection + Cron job
```

---

## RBAC Middleware

```javascript
// protect middleware
// - Verifies JWT from Authorization header
// - Attaches req.user with { id, email, role }

// authorizeRoles(roles)
// - Checks req.user.role against allowed roles
// - Returns 403 if not authorized

// Roles hierarchy:
admin > moderator > intern
```

### Role Permissions

| Endpoint | Admin | Moderator | Intern |
|----------|-------|-----------|--------|
| `GET /api/auth/me` | ✅ | ✅ | ✅ |
| `POST /api/faqs` | ✅ | ❌ | ❌ |
| `GET /api/peer/queue` | ✅ | ✅ | ✅ |
| `POST /api/peer/answer` | ✅ | ✅ | ✅ |
| `POST /api/ratings/:id` | ❌ | ❌ | ✅ |
| `POST /api/admin/approve` | ✅ | ✅ | ❌ |
| `POST /api/admin/override` | ✅ | ✅ | ❌ |
| `POST /api/announcements` | ✅ | ❌ | ❌ |
| `GET /api/analytics/*` | ✅ | ❌ | ❌ |

---

## Socket.IO Integration

### Initialization (config/socket.js)

```javascript
// 1. Create Server with CORS config
// 2. JWT middleware on every socket connection
// 3. User joins personal room on connect
// 4. Admins join admin room
```

### Authentication Flow

```
Client connects with token
        ↓
Socket middleware extracts token
        ↓
jwt.verify(token, JWT_SECRET)
        ↓
Valid? → Extract user { id, role, email }
         ↓
        Join room user:{id}
        Join room room:admins (if admin/mod)
        ↓
Invalid? → Reject connection
```

### Rooms

| Room | Members | Purpose |
|------|---------|---------|
| `user:{userId}` | Specific user | Personal notifications |
| `room:admins` | Admin + Moderator | Admin broadcasts |
| `query:{queryId}` | Query participants | Query-specific updates |

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `new_peer_answer` | Server → Client | `{query_id, query_text, response_id, responder_email}` | Peer submitted answer |
| `query_resolved` | Server → Client | `{query_id, query_text, resolution_type, resolved_by}` | Query resolved by admin |

---

## RAG + LLM Pipeline (Multi-Provider)

```
User Question (intern)
        ↓
Auto-complete suggestions (as typing)
        ↓
Full question submitted
        ↓
RAG Search (MongoDB text index)
        ↓
Match found? ──NO──→ LLM Pipeline
        │                    │
       YES                   ↓
        │              ┌─────┴─────┐
        │              │           │
        │         Gemini API   Groq API
        │         (5 models)   (6 models)
        │              │           │
        │              └─────┬─────┘
        │                    ↓
        │              Return Answer?
        │                    │
        │              ┌─────┴─────┐
        │              │           │
        │             YES          NO
        │              │           │
        │              ↓      Escalate to Peer Queue
 Return FAQ Answer
```

### LLM Service Configuration

```javascript
// Gemini Models (in order): 3.5-flash -> 3.1-pro -> 3.1-flash-lite -> 2.5-flash -> 2.5-pro
// Groq Models (in order): llama-3.3-70b -> llama-3.1-8b -> llama-4-scout -> qwen3-32b -> gpt-oss-120b -> gpt-oss-20b
// Max Output Tokens: 2000
// Temperature: 0.1 (focused, deterministic)
// Timeout: 60 seconds
// Response: Plain text only (no emojis, no formatting)
```

---

## Cron Job (24-hour Sweeper)

```javascript
// Jobs/sweeper.js
// Runs every 24 hours
// Tasks:
// 1. Find stale queries (no activity > X days)
// 2. Mark as ambiguous or escalate
// 3. Cleanup old no_faq entries
// 4. Generate analytics reports
```

---

## Query State Machine

```
                    ┌─────────────┐
                    │   PENDING   │ ← Initial state after LLM downvote
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  3-STRIKE  │ │  PEER     │ │  TIMEOUT  │
       │  AMBIGUOUS │ │  ANSWERED │ │  ESCALATE │
       └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
             │            │            │
             ▼            ▼            ▼
      ┌──────────┐  ┌─────────────┐ ┌──────────┐
      │ AMBIGUOUS │  │LOCK or RATE │ │ AUTO     │
      │ (terminal)│  └──────┬──────┘ │ ESCALATE │
      └──────────┘         │         └──────────┘
                           │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      ┌───────────────┐     ┌───────────────┐
      │ is_locked=true │     │  5 responses  │
      │ (HIGH RATED)   │     │  all < 4 stars │
      └───────┬───────┘     └───────┬───────┘
              │                     │
              ▼                     ▼
      ┌─────────────────────────────┐
      │     ADMIN RESOLUTION       │
      │  (approve or override)      │
      └─────────────┬───────────────┘
                    │
                    ▼
              ┌──────────┐
              │ RESOLVED │ ← Terminal state
              └──────────┘
```

---

## Response Flow

```
Intern submits query
        ↓
No FAQ match → LLM downvote
        ↓
Query created in PENDING state
        ↓
Peers answer (max 5)
        ↓
Intern rates responses (1-5 stars)
        ↓
Lock triggers:
  - 4-5 stars → immediate lock
  - 1-3 stars with 5 responses → lock
        ↓
Admin reviews locked query
        ↓
Approve peer OR admin override
        ↓
Query = RESOLVED
```