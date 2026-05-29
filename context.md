# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini + Groq LLM APIs

---

## Current Phase
**Phase 12: Notification System & Workflow Documentation**

### Status: ✅ Complete
- Complete notification system with hybrid real-time + MongoDB persistence
- Notification Model, Controller, Routes, and Frontend components
- Toast pop-ups, NotificationBell with unread badge, Yellow alert for admins
- Comprehensive query workflow documented

---

## Query Lifecycle & Workflow

### Complete Query Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUERY LIFECYCLE                                    │
│                        Intern submits query                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  STEP 0: AUTO-COMPLETE (as user types)
  │
  ├─ User types in AskAI input
  ├─ debounce 300ms → GET /api/ask/autocomplete?q=...
  ├─ RAG keyword search on FAQ keywords, tags, search_text
  ├─ Returns up to 5 matching FAQs
  └─ User can select autocomplete → instant resolution (source: 'autocomplete')

  STEP 1: RAG SEARCH (on submit)
  │
  ├─ User submits full question → POST /api/ask
  ├─ RAG keyword matching (search_text, tags, keywords)
  ├─ Match confidence > 50%?
  │   ├─ YES → Return FAQ answer for upvote/downvote
  │   │       ├─ UPVOTE → Resolution logged (RAG_RESOLVED), query ends
  │   │       └─ DOWNVOTE → Go to STEP 2 (LLM Fallback)
  │   │
  │   └─ NO → Go to STEP 2 (LLM Fallback)

  STEP 2: LLM FALLBACK (Gemini → Groq)
  │
  ├─ Gemini 3.5-flash → synthesize context from matching FAQs
  ├─ If fails → try next model (3.1-pro, 3.1-flash-lite, 2.5-flash, 2.5-pro)
  ├─ All Gemini models fail → try Groq (llama-3.3-70b → llama-3.1-8b → ...)
  ├─ LLM returns answer → user sees answer with upvote/downvote buttons
  │   ├─ UPVOTE → Resolution logged (LLM_RESOLVED), query ends
  │   └─ DOWNVOTE → Go to STEP 3 (Peer Escalation)

  STEP 3: PEER ESCALATION (if LLM fails or downvoted)
  │
  ├─ Check active query cap (max 5 unresolved per intern)
  ├─ Check for similar query spam
  ├─ Create Query document (status: 'Pending')
  ├─ Track in NoFaq collection (for FAQ suggestions)
  └─ Query enters Peer Queue

  STEP 4: PEER ANSWERS (max 5 peers)
  │
  ├─ Other interns see query in Peer Queue
  ├─ Intern submits answer → POST /api/peer/answer
  ├─ Query status changes: 'Pending' → 'Peer Answered'
  ├─ Notification sent to query author (peer_answer)
  └─ Query author rates the response (1-5 stars)

  STEP 5: RATING & LOCKING
  │
  ├─ 4-5 stars (HIGH) → Query immediately locked
  │   └─ Escalates to Admin "Highly-Rated Queue"
  │
  ├─ 1-3 stars (LOW) + 5 responses filled → Query locked
  │   └─ Escalates to Admin "Low-Rated Queue"
  │
  └─ Ambiguous: 3 different peers mark query as ambiguous
      └─ Query status → 'Ambiguous', escalates to Admin

  STEP 6: ADMIN RESOLUTION
  │
  ├─ Admin views escalated queries
  ├─ Options:
  │   ├─ APPROVE PEER RESPONSE → Query resolved (peer_approved)
  │   └─ ADMIN OVERRIDE → Query resolved (admin_override)
  └─ Notification sent to intern (query_resolved)

  STEP 7: RESOLVED (Terminal State)
  │
  └─ Query marked as 'Resolved', is_locked: true
```

---

### State Machine Transitions

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
       │  AMBIGUOUS │ │  ANSWERED  │ │  ESCALATE │
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
      │ (HIGH RATED)   │     │  all < 4 stars│
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

### Resolution Types (Analytics Tracking)

| Type | Trigger | Description |
|------|---------|-------------|
| `AUTO_COMPLETE` | User selects autocomplete suggestion | Instant resolution via FAQ |
| `RAG_RESOLVED` | User upvotes RAG answer | FAQ match accepted |
| `LLM_RESOLVED` | User upvotes LLM answer | AI answered successfully |
| `ESCALATED` | User downvotes LLM or LLM fails | Sent to peer queue |
| `SPAM_BLOCKED` | Similar query in pending state | Spam prevention |
| `CAP_BLOCKED` | Intern has 5 active queries | Query cap reached |

---

## Milestones

1. ✅ Project Architecture & Planning
2. ✅ MERN Stack Setup & Foundation
3. ✅ Database & Backend APIs
4. ✅ Authentication & RBAC
5. ✅ Admin, Moderator & Intern Dashboards
6. ✅ RAG & LLM Integration
7. ✅ Peer Escalation Workflow Engine
8. ✅ AI FAQ Suggestion Engine
9. ✅ Realtime Notifications & Queue System
10. ⬜ Automated Testing Suite (Pending)
11. ✅ Documentation Engine
12. ✅ Notification System (Current)

---

## All Resolved Issues

| # | Issue | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | MongoDB connection failed | Deprecated mongoose options | Removed useNewUrlParser/useUnifiedTopology |
| 2 | Explore FAQs redirected to login | No /faqs route | Created public /faqs page |
| 3 | FAQs page blank data | Axios interceptor on public route | Created publicApi.js |
| 4 | FAQs not grouped | Flat list layout | Accordion with categories |
| 5 | Sharp card edges | rounded-sm | Changed to rounded-lg |
| 6 | Login redirect loop | ProtectedRoute race condition | localStorage check + delay |
| 7 | Auto-complete only searched keywords | Inconsistent RAG matching | Search search_text, tags, clean_question |
| 8 | Auto-complete not closing on Enter | Missing keyDown handler | Added handleKeyDown |
| 9 | RAG downvote escalated directly | Logic flaw | rag_downvote triggers LLM first |
| 10 | Grok API 403 errors | No credits | Switched to Groq then Gemini |
| 11 | Gemini 404 error | v1beta API | Switched to v1 REST API |
| 12 | Mongoose new: true deprecation | Deprecated option | Changed to returnDocument: 'after' |
| 13 | Backend crash | Missing ratingRoutes/adminRoutes | Created missing files |
| 14 | no_faq tracking broken | No analytics controller | Created analyticsController.js with trackNoFaqQuery |
| 15 | Frontend api.js import error | Named export instead of default | Changed `import { api }` to `import api` |
| 16 | VITE_API_URL undefined crash | env variable not set | Added fallback default `http://localhost:5000` |
| 17 | LLM upvote shows RAG answer | grok_upvote not handled in backend | Added grok_upvote handler returning resolved state |
| 18 | Garbage input passed to RAG/LLM | No input validation | Added query sanity check with lenient validation rules |

---

## Key Features

### LLM Pipeline
- **Gemini Models (in order):** 3.5-flash → 3.1-pro → 3.1-flash-lite → 2.5-flash → 2.5-pro
- **Groq Models (fallback, in order):** llama-3.3-70b → llama-3.1-8b → llama-4-scout → qwen3-32b → gpt-oss-120b → gpt-oss-20b
- **Max Output Tokens:** 2000
- **Temperature:** 0.1 (focused, deterministic)
- **Timeout:** 60 seconds
- **Response Rules:** No emojis, no formatting (#, *, bold, italics), plain text only

### Query Protection
- **Active Query Cap:** Max 5 unresolved queries per intern
- **Spam Prevention:** Similar query detection via regex before peer escalation
- **5-Answer Lock:** Max 5 peer responses per query

### Notification System
- **Hybrid Model:** Socket.IO for real-time + MongoDB for persistence
- **Types:** peer_answer, query_resolved, admin_alert, announcement
- **Components:** NotificationBell, Toast, NotificationContext
- **Yellow Alert:** Admin notified when NoFaq hits 10 occurrences

### Query Input Sanity Check
- **Frontend + Backend validation** before RAG/LLM processing
- **Validation rules:**
  - Minimum 4 actual letters required
  - Special character ratio < 30%
  - 3+ consecutive letters required
  - Repeated pattern detection (blocks `aaa`, `ajflafjllafffaafas`)
  - 4-6 unique letters required (scaled by length)
  - Long strings (>20 chars) must have common words OR 8+ unique letters
  - Repeated pattern ratio < 40%
- **Error code:** `INVALID_QUERY`
- **Both frontend and backend validation for defense in depth**

---

## Project Structure

```
query.in/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── socket.js          # Socket.IO configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── faqController.js
│   │   ├── queryController.js
│   │   ├── askAIController.js
│   │   ├── peerController.js
│   │   ├── ratingController.js
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   ├── analyticsController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # protect, authorizeRoles
│   ├── models/
│   │   ├── User.js, Query.js, Response.js
│   │   ├── FAQ.js, NoFaq.js, Announcement.js, Notification.js
│   ├── routes/
│   ├── services/
│   │   └── grokService.js     # LLM service (Gemini + Groq)
│   ├── jobs/
│   │   └── sweeper.js         # 24-hour cron job
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── context/           # AuthContext, NotificationContext
│   │   ├── pages/            # Role-based pages
│   │   ├── utils/            # api.js, publicApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
├── docs/
│   ├── FEATURES.md
│   ├── setup_guide.md
│   ├── architecture.md
│   ├── api_docs.md
│   └── database_schema.md
├── context.md
├── prompt.md
└── README.md
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/bulk-register` - Bulk register (admin)
- `GET /api/auth/users` - Get all users (admin)

### FAQs
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search` - Search FAQs
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs/:id` - Update FAQ (admin)
- `DELETE /api/faqs/:id` - Delete FAQ (admin)

### Queries
- `GET /api/queries` - Get all queries
- `POST /api/queries` - Submit new query

### Ask AI
- `GET /api/ask/autocomplete` - Auto-complete suggestions
- `POST /api/ask` - Full AI pipeline (RAG → LLM → Escalation)

### Peer (Intern)
- `GET /api/peer/queue` - Get pending queries
- `GET /api/peer/my-escalations` - Get my queries
- `POST /api/peer/answer` - Submit answer
- `POST /api/peer/skip` - Skip query
- `POST /api/peer/ambiguous` - Mark ambiguous (3-strike rule)

### Ratings
- `POST /api/ratings/:id` - Rate response (1-5 stars)

### Admin
- `GET /api/admin/escalated` - Get escalated queries
- `GET /api/admin/query/:id` - Get query details
- `POST /api/admin/approve` - Approve peer response
- `POST /api/admin/override` - Admin override

### Analytics
- `GET /api/analytics/faq-suggestions` - Get suggestions (>= 10 hits)
- `GET /api/analytics/no-faq` - Get all no_faq records
- `GET /api/analytics/stats` - Get analytics summary
- `DELETE /api/analytics/suggestions/:id` - Dismiss suggestion
- `POST /api/analytics/create-faq` - Create FAQ from suggestion

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (admin)

### Notifications
- `GET /api/notifications` - Get notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

---

## Admin Dashboard (7-Card Layout)

| Card | Feature |
|------|---------|
| 1 | User Registration (Single + Bulk JSON Upload) |
| 2 | Broadcast Announcement |
| 3 | User Management Directory |
| 4 | Master Query Monitor |
| 5 | FAQ Knowledge Base Editor |
| 6 | Resolve Query Hub (5-section queue) |
| 7 | AI-Assisted FAQ Suggestions (Yellow alert) |

---

## Moderator Dashboard (3-Card Layout)

| Card | Feature |
|------|---------|
| 1 | Announcements (View-only, yellow alert < 24hrs) |
| 2 | Master Query Monitor |
| 3 | Resolve Query Hub |

---

## Intern Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /intern | Overview |
| Ask AI | /intern/ask | Submit queries |
| Peer Queue | /intern/peer-queue | Answer others' queries |
| My Escalations | /intern/my-queries | Track my queries, rate responses |
| View FAQs | /intern/faqs | Browse knowledge base |
| Announcements | /intern/announcements | View admin broadcasts |

---

## Configuration

| Setting | Value |
|---------|-------|
| MongoDB Atlas URI | mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation |
| Max Output Tokens | 2000 |
| LLM Timeout | 60 seconds |
| Max Unresolved Queries per Intern | 5 |
| Max Peer Responses per Query | 5 |
| Ambiguous Strike Threshold | 3 |
| FAQ Suggestion Threshold | 10 occurrences |
| Auto-complete Debounce | 300ms |
| Toast Auto-dismiss | 5 seconds |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin@123 |
| Moderator | mod@query.in | Mod@123 |
| Intern 1 | intern1@query.in | Intern1@123 |
| Intern 2 | intern2@query.in | Intern2@123 |

---

## Next Actions

1. Automated Testing Suite (Phase 10)
2. Production deployment optimization
3. Performance tuning for large FAQ collections