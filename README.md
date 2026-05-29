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
| **Design** | Strict Black & White theme with light background (#FAFAFA), rounded-lg corners |
| **Auth** | JWT-based with bcrypt password hashing |
| **Roles** | Admin, Moderator, Intern |
| **Max Output Tokens** | 2000 per LLM response |
| **Query Cap** | 5 unresolved queries per intern |

---

## Core Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           QUERY LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────────────┘

  INTERN ASKS ──▶ RAG SEARCH ──▶ FAQ Found? ──▶ YES ──▶ Return Answer
                                         │
                                         NO
                                         ▼
                              ┌──────────┴──────────┐
                              │                     │
                         LLM FALLBACK           LLM DOWNVOTE
                         (Gemini → Groq)              │
                              │                     │
                         Return Answer         Track in no_faq
                              │                     │
                         ┌────┴────┐               │
                         │         │               ▼
                    UPVOTE     DOWNVOTE      ┌────────────┐
                         │         │         │  PEER       │
                         │         └────────▶│  ESCALATION │
                         │                   │  QUEUE      │
                         │                   └────────────┘
                         ▼                         │
RESOLVED                       ▼
                                        ┌────────────────────┐
                                        │  Intern rates 1-5  │
                                        │  stars (intern)    │
                                        └────────────────────┘
                                                │
                                ┌───────────────┴───────────────┐
                                │                               │
                           4 Stars                         5 Stars
                    (HIGHLY-RATED QUEUE)              (IMMEDIATE LOCK)
                           NOT locked                         │
                                │                               │
                                │         ┌────────────────────┘
                                │         │
                                │         ▼
                                │   ADMIN HIGHLY-RATED
                                │       QUEUE
                                │                               │
                                ▼                               ▼
                       ADMIN HIGHLY-RATED           Admin approves
                           QUEUE                   peer answer
                                │                               │
                                ▼                               ▼
                      Admin approves              Admin overrides
                      peer answer                  or disconnects
                                │                               │
                                └───────────────┬───────────────┘
                                                ▼
                                           RESOLVED
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

---

## Notification System

Hybrid real-time + MongoDB persistence model for instant and offline alerts.

| Type | Trigger | Recipient |
|------|---------|-----------|
| `peer_answer` | Peer submits answer | Query author (intern) |
| `query_resolved` | Admin resolves OR query marked ambiguous | Query author (intern) |
| `admin_alert` | NoFaq hits 10 occurrences | All admins |
| `announcement` | Admin creates broadcast | All interns |

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

## 6-Section Admin Resolution Hub

The Admin Dashboard presents 6 sections for managing escalated queries:

| Section | Condition |
|---------|-----------|
| Master Queue | All non-resolved queries |
| Stagnant (0 answers) | is_locked: true, 0 responses (sweeper-triggered) |
| Unanswered | status != 'Resolved', 0 responses |
| Low-Rated | 5 responses, all rated < 4 stars |
| Highly-Rated | Has response with rating >= 4 |
| Archive | status = 'Resolved' |

**FAQ Creation Bridge:** Admin can click "+ Add to FAQ Database" on any resolved query to create a permanent FAQ entry.

---

## License

Internal project - All rights reserved.