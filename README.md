# Query.in

> **Crowd-sourced FAQ Generation & P2P Query Resolution Platform**

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-000000.svg)
![Gemini](https://img.shields.io/badge/Gemini-3.5--flash-4285F4.svg)
![Groq](https://img.shields.io/badge/Groq-LLM-F42434.svg)

**Query.in** is a MERN stack platform where interns ask questions that can't be answered by the knowledge base. Questions escalate through a peer-review pipeline, get rated, and ultimately get resolved by moderators or admins.

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Stack** | MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini + Groq LLM APIs |
| **Design** | Strict Black (#000000) & White (#FFFFFF) theme with Yellow (#FFD000) highlight for alerts, Gold (#FFD700) for rating stars, Red (#DC2626) for critical warnings, rounded-xl corners (16px), soft shadows, modern SaaS aesthetic |
| **Auth** | JWT-based with bcrypt password hashing |
| **Roles** | Admin, Moderator, Intern |
| **Max Output Tokens** | 2000 per LLM response |
| **Query Cap** | 5 unresolved queries per intern |

---

## Core Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUERY LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  STEP 0: AUTO-COMPLETE (as user types)
  │
  ├─ User types in AskAI input
  ├─ debounce 300ms → GET /api/ask/autocomplete?q=...
  ├─ RAG keyword search on FAQ keywords, tags, search_text
  ├─ Returns up to 5 matching FAQs
  └─ User selects → instant resolution (source: 'autocomplete')

  STEP 1: RAG SEARCH (on submit)
  │
  ├─ User submits full question → POST /api/ask
  ├─ RAG keyword matching (search_text, tags, keywords)
  ├─ Match confidence > 50%?
  │   ├─ YES → Return FAQ answer for upvote/downvote
  │   │       ├─ UPVOTE → Resolution logged (RAG_RESOLVED), query ends
  │   │       └─ DOWNVOTE → Go to STEP 2 (LLM Fallback)
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
  ├─ 4 stars (HIGH) → Query escalates to Highly-Rated Queue (NOT locked)
  ├─ 5 stars → Query immediately locked, escalates to Highly-Rated Queue
  ├─ 1-3 stars (LOW) + 5 responses filled → Query locked, escalates to Low-Rated Queue
  └─ Ambiguous: 3 different peers mark query as ambiguous
      └─ Query status → 'Ambiguous', is_locked: true
      └─ Intern notified: "Your query was unclear. Please rephrase."

  STEP 6: ADMIN RESOLUTION
  │
  ├─ Admin views escalated queries (Resolve Hub)
  ├─ Options:
  │   ├─ APPROVE PEER RESPONSE → Query resolved (peer_approved)
  │   ├─ ADMIN OVERRIDE → Query resolved (admin_override)
  │   ├─ SEND WARNING → Warning sent to intern (warning_count++)
  │   └─ ADD TO FAQ → Creates permanent FAQ entry
  └─ Notification sent to intern (query_resolved)

  STEP 7: RESOLVED (Terminal State)
  │
  └─ Query marked as 'Resolved', is_locked: true
  └─ "Add to FAQ" button available for knowledge base expansion
  └─ Intern sees "Approved" badge for both peer_approved and admin_override
```

---

## Resolution Flow (Admin/Moderator)

```
                    ┌─────────────┐
                    │   PENDING   │ ← Initial state after LLM downvote
                    └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
        ┌───────────┐          ┌─────────────┐
        │  3-STRIKE  │          │  PEER        │
        │  AMBIGUOUS │          │  ANSWERED    │
        └─────┬─────┘          └──────┬──────┘
              │                      │
              ▼                      ▼
       ┌──────────┐         ┌──────────────┐
       │ AMBIGUOUS│         │    RATING    │
       │ (locked) │         └───────┬──────┘
       └──────────┘                 │
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
           ┌───────────────┐                  ┌───────────────┐
           │  rating = 4   │                  │  rating = 5   │
           │  (HIGH RATED │                  │  (IMMEDIATE    │
           │   NOT locked)│                  │    LOCK)      │
           └───────┬───────┘                  └───────┬───────┘
                   │                                │
                   │         ┌─────────────────────┘
                   │         │
                   │         ▼              5 responses
                   │  ┌───────────────┐   all < 4 stars
                   │  │ is_locked=true│──────────┐
                   │  └───────┬───────┘          │
                   │          │                  ▼
                   │          │          ┌───────────────┐
                   │          │          │  LOW-RATED    │
                   │          │          │    QUEUE      │
                   │          │          └───────┬───────┘
                   │          │                │
                   └──────────┴────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
        ┌─────────────────────────────┐
        │     ADMIN RESOLUTION        │
        │  (approve, override, warn)  │
        └─────────────┬───────────────┘
                      │
                      ▼
                ┌──────────┐
                │ APPROVED │ ← Both peer_approved and admin_override
                └──────────┘   show "Approved" badge to intern
```

---

## LLM Model Fallback

**Gemini Models (in order):**
| Model | Use Case |
|-------|----------|
| `gemini-3.5-flash` | Default - text, multimodal, agentic tasks |
| `gemini-3.1-pro-preview` | Complex reasoning, advanced coding |
| `gemini-3.1-flash-lite` | Cost-efficient, high-frequency, simple tasks |
| `gemini-2.5-flash` | Legacy stable |
| `gemini-2.5-pro` | Legacy heavy-lifter |

**Groq Models (free tier, in order):**
| Model | Use Case |
|-------|----------|
| `llama-3.3-70b-versatile` | Summarization, complex logic, deep reasoning |
| `llama-3.1-8b-instant` | High-volume, quick chat, basic tasks |
| `llama-4-scout-17b` | **Multimodal (images!)**, 128k context |
| `qwen3-32b` | Coding, multilingual reasoning |
| `gpt-oss-120b` | Heavy-duty step-by-step reasoning |
| `gpt-oss-20b` | Lighter reasoning tasks |

**LLM Response Rules:**
- No emojis
- No special formatting (bold, italics, #, *)
- Plain text only
- Concise, short answers
- Max 2000 output tokens

---

## Documentation Directory

| Document | Description |
|----------|-------------|
| [./docs/FEATURES.md](./docs/FEATURES.md) | Complete feature breakdown with flagship highlights |
| [./docs/setup_guide.md](./docs/setup_guide.md) | Installation, configuration, and startup instructions |
| [./docs/architecture.md](./docs/architecture.md) | System architecture, React/Vite, Express routing, Socket.IO |
| [./docs/api_docs.md](./docs/api_docs.md) | REST API endpoint reference with request/response formats |
| [./docs/database_schema.md](./docs/database_schema.md) | Mongoose model reference with ObjectId relationships |

---

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/faq_escalation
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin@1234 |
| Moderator | mod@query.in | Mod@1234 |
| Moderator | mod2@query.in | Mod2!1234 |
| Intern 1 | intern1@query.in | Intern1@1234 |
| Intern 2 | intern2@query.in | Intern2@1234 |
| Intern 3 | intern3@query.in | Intern3@1234 |
| Intern 4-10 | intern{N}@query.in | Intern{N}!234 |

---

## Analytics Tracking

All query resolutions are tracked with ResolutionType:

| Type | Description |
|------|-------------|
| `AUTO_COMPLETE` | Resolved via auto-complete suggestion |
| `RAG_RESOLVED` | RAG found answer, user upvoted |
| `LLM_RESOLVED` | LLM answered (Gemini or Groq) |
| `ESCALATED` | Downvoted, sent to peer queue |
| `SPAM_BLOCKED` | Similar query already in queue |
| `CAP_BLOCKED` | 5 active queries reached |
| `MODERATOR_OVERRIDE` | Moderator resolved query (not yet implemented) |

---

## Recent Fixes

| # | Issue | Fix |
|---|-------|-----|
| 20 | MyEscalations socket connection failed | Added VITE_API_URL fallback before .replace() |
| 21 | Sweeper edge case | Fixed responseCount <= 4 to use MAX_PEER_RESPONSES constant |
| 22 | Ambiguous 3-strike notification | Intern now notified when query marked ambiguous |
| 23 | createFAQFromQuery stub | Now actually creates FAQ from approved response |
| 24 | Missing Stagnant Queue | Added 6th section in Admin Resolution Hub |
| 25 | AskAI generic error message | Now shows actual backend error (e.g., "Escalation blocked: You have 5 unresolved queries.") |
| 26 | No way to clear test escalation data | Added POST /api/admin/clear-all-data endpoint |
| 27 | Race condition in submitAnswer | Atomic `findOneAndUpdate` with `$expr` checks responses.length < 5 DURING update |
| 28 | N+1 query in sweeper | Aggregation pipeline + `updateMany` instead of for-loop with sequential queries |
| 29 | Incorrect telemetry logging | `synthesizeWithGemini/Grok` now return `{ answer, model }` instead of just answer |
| 30 | ProtectedRoute redirected to /login | Login form embedded on Landing page at `/`, redirect now to `/` |
| 31 | ViewFAQs markdown not rendering | Added react-markdown for proper rendering |
| 32 | ViewFAQs missing status badges | Added "AI Generated", "Peer Answered", "Verified by Admin" badges |
| 33 | ViewFAQs auto-expand on load | Removed auto-expand, categories start collapsed |
| 34 | Peer queue empty after first answer | getPeerQueue now queries status: { $in: ['Pending', 'Peer Answered'] } |
| 35 | Intern who answered sees own response in queue | Added exclusion for queries user already answered |
| 36 | Submit answer rejected for Peer Answered status | Atomic update now matches both 'Pending' and 'Peer Answered' status |
| 37 | Notifications not stored before client response | Moved await createNotification before res.json() in all controllers |
| 38 | MyEscalations rating UI - can rate multiple times | "Rate this response" button only shows if rating === null, added rater_note field |
| 39 | 4-star rating locks query immediately | Changed MIN_HIGH_RATING to 5; 4 stars = Highly-Rated Queue (not locked) |
| 40 | Ambiguous marked query still visible in peer queue | Added ambiguous_marked_by filter to exclude queries user marked ambiguous |
| 41 | 3-strike ambiguous query shows "Pending" status on MyEscalations | Added `query_resolved` socket emit when query becomes Ambiguous |
| 46 | No warning system for intern misuse | Added warning_count and is_disabled to User model, warnIntern endpoint, Spoiled Users page |
| 47 | Failed to send warning (500 error) | Added 'intern_warning' to Notification type enum |
| 48 | MyEscalations shows "Resolved" instead of "Approved" | Both peer_approved and admin_override show "Approved" badge |
| 49 | Sidebar shows only current page nav items | Created centralized navConfig.jsx, DashboardLayout auto-detects nav items by user role |
| 50 | Intern dashboard stats incorrect | Active queries showed all queries not just user's, peer responses included skipped/ambiguous | Created GET /api/peer/stats endpoint with accurate counts, Active Queries and Resolved cards now link to My Escalations |
| 51 | Ask AI page input limitations | Single-line input couldn't handle multiline questions; "Get Answer" button separate from input | Replaced input with textarea (Shift+Enter for new line, Enter to submit), replaced bulb icon with send button (right arrow) on input bar |
| 63 | Pending Resolution showed all responses | Low-rated responses (1-3★) were visible in Pending Resolution section | Filter to show only 4-5★ responses in Pending Resolution, sorted 5★ first |
| 64 | Low-Rated queue showed mixed queries | Queries with some high ratings were shown in Low-Rated queue | Low-Rated now shows only queries with ALL responses rated 1-3★, responses sorted descending with Approve button |

---

## Notification System

Hybrid real-time + MongoDB persistence model for instant and offline alerts.

| Type | Trigger | Recipient |
|------|---------|-----------|
| `peer_answer` | Peer submits answer | Query author (intern) |
| `query_resolved` | Admin resolves OR query marked ambiguous | Query author (intern) |
| `admin_alert` | NoFaq hits 10 occurrences | All admins |
| `announcement` | Admin creates broadcast | All interns |
| `faq_added` | Admin adds new FAQ | All interns |
| `intern_warning` | Admin sends warning to intern for misuse | Targeted intern |

**Components:**
- `NotificationBell` - Top bar bell icon with unread badge and dropdown
- `Toast` - Slide-in pop-up from bottom-right (auto-dismiss 5s)
- `NotificationContext` - Socket.IO client + state management

**Real-time Events:**
- `new_notification` - Broadcast to user room
- `yellow_alert` - Broadcast to admin room when NoFaq hits threshold
- `query_resolved` - Intern notified when their query is resolved
- `new_peer_answer` - Intern notified when peer answers their query

---

## Warning & Credibility System

Admins/Moderators can send warnings to interns from any query detail panel.

| Feature | Description |
|---------|-------------|
| `warning_count` | User field (default: 0, max: 5) |
| `is_disabled` | Auto-enabled when warning_count >= 5 |
| Login Block | Disabled users cannot log in (403 error) |
| Spoiled Users Page | `/admin/spoiled-users` lists all users with warnings |
| Warning Badge | Query detail panels show warning count next to intern email |
| Warning Banner | MyEscalations page shows warning count if user has warnings |

**Warning Flow:**
1. Admin clicks "Send Warning" in query detail panel
2. Modal appears with optional warning message
3. On submit: `warnIntern()` increments `warning_count`
4. If `warning_count >= 5`: `is_disabled = true`, user cannot log in
5. `intern_warning` notification sent to intern

---

## Admin Dashboard Pages

The Admin Dashboard now uses a page-based structure with sidebar navigation:

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /admin | Overview with navigation cards (7 cards) |
| User Management | /admin/users | Combined: Registration, User list with warnings (0=green, 1+=yellow, 5=red), Active/Inactive toggle (green/red) |
| Announcements | /admin/announcement | Publish announcements |
| Query Monitor | /admin/queries | Master query feed |
| FAQ Editor | /admin/faqs | FAQ CRUD operations |
| Resolve Hub | /admin/resolve | Resolution queue (includes Pending Resolution, Ambiguous, Stagnant, Unanswered, Low-Rated, Archive) |
| AI Suggestions | /admin/suggestions | FAQ gap suggestions |
| Ambiguous | /admin/ambiguous | Queries marked unclear by 3 peers |

## Moderator Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /moderator | Overview with navigation cards |
| Query Monitor | /moderator/queries | Master query feed |
| Resolve Hub | /moderator/resolve | Resolution queue (includes Pending Resolution, Unanswered, Low-Rated, Archive) |

---

## 6-Section Admin Resolution Hub

The Admin Dashboard presents 6 sections for managing escalated queries:

| Section | Condition |
|---------|-----------|
| Pending Resolution | High-rated queries (rating >= 4), excludes Ambiguous and Resolved. **Only 4-5★ responses shown, sorted 5★ first** |
| Ambiguous Queries | Queries marked unclear by 3 peers (3-strike rule), can delete these |
| Stagnant (0 answers) | is_locked: true, 0 responses (sweeper-triggered) |
| Unanswered | status != 'Resolved', 0 responses |
| Low-Rated | Queries with 5+ responses ALL rated < 4 stars. **All responses shown (sorted 3★→1★) with Approve button** |
| Archive | status = 'Resolved' |

**FAQ Creation Bridge:** Admin can click "+ Add to FAQ Database" on any resolved query to create a permanent FAQ entry.

---

## License

Internal project - All rights reserved.