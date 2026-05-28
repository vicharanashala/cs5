# Query.in

> **Crowd-sourced FAQ Generation & P2P Query Resolution Platform**

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-000000.svg)

**Query.in** is a MERN stack platform where interns ask questions that can't be answered by the knowledge base. Questions escalate through a peer-review pipeline, get rated, and ultimately get resolved by moderators or admins.

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Stack** | MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API |
| **Design** | Strict Black & White theme with light background (#FAFAFA), rounded-lg corners |
| **Auth** | JWT-based with bcrypt password hashing |
| **Roles** | Admin, Moderator, Intern |

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
                         (gemini-2.5-flash)          │
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
                                      │  stars (intern)     │
                                      └────────────────────┘
                                              │
                               ┌──────────────┴──────────────┐
                               │                             │
                          4-5 Stars                    1-3 Stars
                          (HIGH LOCK)                   (LOW LOCK @ 5)
                               │                             │
                               ▼                             ▼
                      ADMIN HIGHLY-RATED           ADMIN LOW-RATED
                          QUEUE                        QUEUE
                               │                             │
                               ▼                             ▼
                     Admin approves              Admin overrides
                     peer answer                  or disconnects
                               │                             │
                               └──────────────┬──────────────┘
                                              ▼
                                         RESOLVED
```

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

## Project Timeline

| Date | Milestone | Description |
|------|-----------|-------------|
| 2026-05-27 | Phase 0-1 | Project initialization, MERN stack setup |
| 2026-05-27 | Phase 2-4 | Database schemas, Auth & RBAC, Dashboards |
| 2026-05-28 | Phase 5-7 | RAG/LLM integration, Peer escalation workflow |
| 2026-05-28 | Phase 8-9 | AI FAQ suggestion engine, Realtime notifications |
| 2026-05-28 | Phase 11 | Documentation engine (current) |

---

## Project Origin

This project was initiated **24 hours ago** as an onboarding/internal tool for a team evaluating AI-driven FAQ generation and P2P query resolution patterns using the MERN stack.

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

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin@123 |
| Moderator | mod@query.in | Mod@123 |
| Intern 1 | intern1@query.in | Intern1@123 |
| Intern 2 | intern2@query.in | Intern2@123 |

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/faq_escalation
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Available Scripts

### Backend
```bash
npm run dev    # Start with nodemon
npm start      # Production start
```

### Frontend
```bash
npm run dev    # Vite dev server
npm run build  # Production build
```

---

## License

Internal project - All rights reserved.