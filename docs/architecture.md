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
│   ├── AuthContext.jsx   # JWT token & user state
│   └── NotificationContext.jsx # Real-time notifications + Socket.IO
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
│   ├── publicApi.js      # Public axios instance (no interceptor)
│   └── navConfig.jsx     # Centralized navigation items for all roles
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
/                        → Landing (public, embedded login)
/faqs                    → FAQs (public, accordion view)
/login                   → Login page
/dashboard               → Role-based dashboard redirect

# Admin Pages
/admin                    → AdminOverview (protected, admin only)
/admin/users             → AdminUserManagement (admin only) - Combined: Registration + Users + Warnings
/admin/announcement      → AdminAnnouncement (admin only)
/admin/faqs              → AdminFaqEditor (admin only)
/admin/resolve           → AdminResolveHub (admin only)

# Moderator Pages
/moderator               → ModeratorOverview (protected, moderator+)
/moderator/announcements → ModeratorAnnouncements (moderator only) - View announcements with priority
/moderator/resolve       → ModeratorResolveHub (moderator only)

# Intern Pages
/intern                  → InternDashboard (protected, intern only)
/intern/ask              → AskAI (protected, intern only)
/intern/peer-queue       → PeerQueue (protected, intern only)
/intern/my-queries       → MyEscalations (protected, intern only)
/intern/faqs             → ViewFAQs (protected, intern only)
/intern/announcements    → Announcements (protected, intern only)
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

## UI Design System (Phase 14)

### Design Tokens (tailwind.config.js)

```javascript
colors: {
  background: '#FAFAFA',    // Page background
  surface: '#FFFFFF',      // Card/modal surfaces
  black: '#000000',         // Primary text
  white: '#FFFFFF',          // Text on dark
  highlight: '#FFD000',      // Yellow highlight for alerts
  error: '#DC2626',         // Error states (red)
}
shadow: {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.12)',
}
borderRadius: {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
}
```

### Component Library

| Component | Purpose | Styling |
|-----------|---------|---------|
| Button | Primary actions | bg-black text-white hover:bg-gray-800 rounded-xl shadow-md |
| Card | Content containers | bg-white rounded-xl shadow-md border border-black |
| Badge | Status indicators | text-xs font-medium rounded-full px-2.5 py-1 |
| Toast | Notifications | Slide-in from bottom-right, shadow-xl, auto-dismiss 5s |
| NotificationBell | Alert indicator | Bell icon with unread count badge |
| FormattedAnswer | AI responses | bg-white rounded-xl p-4 whitespace-pre-wrap |

### UI/UX Modernization Changes

- **Color Scheme**: Strictly black (#000000), white (#FFFFFF), yellow (#FFD000), gold (#FFD700)
- **Typography**: text-sm (14px) body, text-base (16px) emphasis, text-lg (18px) headings
- **Spacing**: 8px rhythm - py-2, py-3, py-4, space-y-4, space-y-6
- **Shadows**: Soft, layered shadows (shadow-sm through shadow-xl)
- **Borders**: 1px solid black borders on cards and buttons
- **Animations**: Smooth transitions (duration-200), hover scale on buttons
- **Layout**: DashboardLayout with sticky header, rounded-xl corners throughout
- **Gold Stars**: Rating stars use #FFD700 color
- **Red Warnings**: Critical warnings use red bg (bg-red-50), red text (text-red-700)
- **User Select**: Disabled globally except for input fields
- **FAQ Navigation**: Popular FAQs link to specific FAQ with scroll-to-highlight

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
│   ├── analyticsController.js
│   └── notificationController.js # Real-time + persistent notifications
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
        │              ↓      Check Similar Resolved Queries
        │              │                │
        │              ↓                ↓
        │      Escalate to Peer    Found resolved?
        │         Queue              │    │
        │                            YES  NO
        │                             │    │
        │                             ↓    ↓
        │                     Show Previously  Create New
        │                       Resolved      Escalation
        │                      Response
```

### Previously Resolved Query Detection

Before creating a new peer queue escalation, the system checks for similar resolved queries:

1. **Search:** Finds queries with matching text (case-insensitive regex)
2. **Filter:** Only queries with `status: 'Resolved'` and `resolution_type: 'peer_approved'` or `'admin_override'`
3. **Response:** Finds the first approved response (`approval: true`)
4. **Return:** Shows original query text + approved response to user

**Response Format:**
```json
{
  "source": "previously_resolved",
  "resolution": "resolved",
  "originalQueryText": "Original intern's question",
  "answer": "Approved response text",
  "message": "This question has been resolved for another intern."
}
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
// Runs every 15 minutes
// Tasks:
const SWEEP_INTERVAL_MINUTES = 15;
const SLA_TIMEOUT_HOURS = 24;
const MAX_PEER_RESPONSES = 5;

// SCENARIO A - STAGNANT (0 answers, 24+ hours):
// Query has 0 responses after 24 hours
// -> is_locked = true
// -> Escalates to "Stagnant Queue"

// SCENARIO B - LOW-RATED (1-4 answers, 24+ hours, all < 4 stars):
// Query has 1-4 responses, all rated 1-3 stars, after 24 hours
// -> is_locked = true
// -> Escalates to "Low-Rated Queue"
```

---

## Query State Machine

```
                     ┌─────────────┐
                     │   PENDING   │ ← Initial state after LLM downvote
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  3-STRIKE  │ │  PEER     │ │  24HR     │
       │  AMBIGUOUS │ │  ANSWERED │ │  SWEEPER  │
       └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
             │            │            │
             │            │            │
             │            ▼            ▼
             │     ┌───────────┐  ┌────────────┐
             │     │LOCK or    │  │ STAGNANT   │
             │     │RATE       │  │ (0 answers)│
             │     └─────┬─────┘  └──────┬─────┘
             │           │               │
             │           ▼               │
             │    ┌──────┴──────┐        │
             │    │             │        │
             │    ▼             ▼        ▼
             │ HIGH-RATED   LOW-RATED  is_locked
             │   QUEUE        QUEUE    true
             │    │             │        │
             │    └─────────┬───┴────────┘
             │              │
             │              ▼
             │     ┌─────────────────┐
             │     │ ADMIN RESOLUTION│
             │     │ (approve/override)
             │     └────────┬────────┘
             │              │
             ▼             ▼
       ┌──────────┐  ┌──────────┐
       │RESOLVED* │  │ RESOLVED │
       └──────────┘  └──────────┘
       *notification
       sent to intern
```

---

## 6-Section Admin/Moderator Resolve Hub

**Admin Resolve Hub (6 sections):**
| Section | Filter Condition | Response Display |
|---------|------------------|------------------|
| Pending Resolution | High-rated queries (responses with rating >= 4), excludes Ambiguous | Only 4-5★ responses shown, sorted 5★ first |
| Ambiguous Queries | status === 'Ambiguous' (3-strike rule triggered), can delete these queries | All responses shown |
| Stagnant (Locked, 24h+) | 1-4 responses, ALL < 4 stars, created 24+ hours ago | All responses shown (sorted 3★→1★) |
| Low-Rated | responses.length >= 5, ALL responses must be < 4 stars | All responses shown (sorted 3★→1★), Approve button available |
| Archive | status === 'Resolved' | Only approved responses shown |
| Moderator Suggested | Pending FAQ suggestions from moderators | Question + suggested answer, "Add to FAQ" or "Dismiss" buttons |

**Moderator Resolve Hub (4 sections):**
| Section | Filter Condition | Response Display |
|---------|------------------|------------------|
| Pending Resolution | High-rated queries (responses with rating >= 4), excludes Ambiguous | Only 4-5★ responses shown, sorted 5★ first |
| Stagnant (Locked, 24h+) | 1-4 responses, ALL < 4 stars, created 24+ hours ago | All responses shown (sorted 3★→1★) |
| Low-Rated | responses.length >= 5, ALL responses must be < 4 stars | All responses shown (sorted 3★→1★), Approve button available |
| Archive | status === 'Resolved' | Only approved responses shown, "Suggest for FAQ Database" button |

**Moderator FAQ Suggestion Workflow:**
1. Moderator resolves a query (approves or overrides)
2. Query moves to Archive
3. In Archive section, Moderator clicks "Suggest for FAQ Database"
4. Modal shows query + approved response for confirmation
5. Suggestion is submitted for admin review
6. Admin sees suggestion in "Moderator Suggested" section
7. Admin can create FAQ (with full modal: category, tags, keywords, priority) or dismiss

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
  - 4-5 stars → immediate lock → Highly-Rated Queue
  - 1-3 stars with 5 responses → lock → Low-Rated Queue
  - 0 answers for 24hrs → sweeper locks → Stagnant Queue
        ↓
Admin reviews locked query
        ↓
Approve peer OR admin override → RESOLVED
        ↓
"Add to FAQ" button → Creates permanent FAQ entry
```

---

## Warning & Credibility System

Admin/Moderator can send warnings to interns from any query detail panel. This system includes:

**User Model Fields:**
- `warning_count`: Number (default: 0, max: 5)
- `is_disabled`: Boolean (auto-enabled at warning_count >= 5)
- `isActive`: Boolean (default: true, admin toggle for soft deactivation)

**Warning Badge Colors (on User Management page):**
- `warning_count === 0`: Green badge (bg-green-100 text-green-800)
- `warning_count >= 1`: Yellow badge (bg-yellow-400 text-black)
- `warning_count >= 5`: Red badge (bg-red-600 text-white)

**Status Indicator Colors:**
- Active (isActive !== false): Green badge (bg-green-100 text-green-800)
- Inactive (isActive === false): Red badge (bg-red-100 text-red-700)

**Admin Endpoints:**
- `POST /api/admin/warn-user` - Send warning to intern
- `GET /api/auth/users` - Get all users with warnings
- `PATCH /api/auth/users/:id/toggle-status` - Toggle user active/inactive

**Warning Flow:**
1. Admin clicks "Send Warning" button in query detail panel
2. Modal appears with optional warning message
3. On submit: `warnIntern()` is called, increments `warning_count`
4. If `warning_count >= 5`: `is_disabled = true`, user cannot log in
5. `intern_warning` notification sent to intern

**Combined User Management Page:**
All user functionality is combined into a single page at `/admin/users`:
- User Registration (Single & Bulk JSON)
- User List with warning levels (color-coded) and status indicators
- Active/Inactive toggle via 3-dot menu (non-admins only)

**Resolved Badge:** All resolved queries (both `peer_approved` and `admin_override`) show "Approved" badge in MyEscalations page.