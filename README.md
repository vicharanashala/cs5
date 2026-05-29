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
                          4-5 Stars                      1-3 Stars
                          (HIGH LOCK)                   (LOW LOCK @ 5)
                               │                               │
                               ▼                               ▼
                      ADMIN HIGHLY-RATED           ADMIN LOW-RATED
                          QUEUE                        QUEUE
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
| Admin | admin@query.in | Admin@123 |
| Moderator | mod@query.in | Mod@123 |
| Intern 1 | intern1@query.in | Intern1@123 |
| Intern 2 | intern2@query.in | Intern2@123 |

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

---

## Notification System

Hybrid real-time + MongoDB persistence model for instant and offline alerts.

| Type | Trigger | Recipient |
|------|---------|-----------|
| `peer_answer` | Peer submits answer | Query author (intern) |
| `query_resolved` | Admin/moderator resolves query | Query author (intern) |
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

---

## License

Internal project - All rights reserved.