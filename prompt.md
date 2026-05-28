# Query.in - Prompt History & Project Summary

## Project Overview
**Query.in** is a MERN stack crowd-sourced FAQ generation and P2P query resolution platform.
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API
- **Design:** Strict Black & White theme with light background (#FAFAFA), rounded-lg corners

---

## Prompts Given & Responses Provided

---

### Prompt 1: Project Initialization (Milestone 0)
**Prompt:** Initialize project structure with Git, context.md, and frontend/backend folders.

**Response:**
- Initialized local Git repository, created `context.md`, `frontend/` and `backend/` directories
- **Commit:** `ded982c` - "Phase 0: Initialize project structure"

---

### Prompt 2: Architecture & Planning Context (Milestone 1)
**Prompt:** Internalize architecture blueprint, 6 MongoDB schemas, and Query lifecycle state machine.

**Response:**
- Acknowledged 6-layer system, 6 MongoDB collections, Query lifecycle state machine

---

### Prompt 3: Execute Milestone 2 - MERN Stack Setup
**Prompt:** Set up complete boilerplate for backend and frontend with B&W design system.

**Response:**
- Backend: Node.js, Express, Mongoose, cors, dotenv, jsonwebtoken, bcryptjs, nodemon
- Frontend: Vite React, react-router-dom, axios, lucide-react
- **Commit:** `d3753c1` - "chore: Initialize MERN stack foundation and B&W design system"

---

### Prompt 4: Execute Milestone 3 - Database & Backend APIs
**Prompt:** Create 6 Mongoose schemas and REST API controllers/routes.

**Response:**
- 6 Mongoose Models: User, Query, Response, FAQ, NoFaq, Announcement
- Controllers: faqController, queryController
- **Commit:** `8676b52` - "feat: implement core Mongoose schemas and foundational API routes"

---

### Prompt 5: Seed 125 FAQs from JSON file
**Prompt:** Add all FAQs from `vins_faq_structured.json` to the database.

**Response:**
- Created seed script, inserted all 125 VINS FAQs

---

### Prompt 6: Execute Milestone 4 - Authentication & RBAC
**Prompt:** Build JWT authentication and role-based access control middleware.

**Response:**
- authController: login, register, getMe with JWT/bcrypt
- authMiddleware: protect, authorizeRoles
- **Commit:** `abdc3c8` - "feat: implement JWT authentication, RBAC middleware, and test seed data"

---

### Prompt 7: Execute Milestone 5 - Dashboards & UI/UX
**Prompt:** Build landing page, login portal, and dashboard shells for all three roles.

**Response:**
- AuthContext, ProtectedRoute, api.js, DashboardLayout, Badge, FormattedAnswer
- Pages: Landing, AdminDashboard, ModeratorDashboard, InternDashboard
- **Commit:** `8e4311d` - "feat: implemented responsive role-based dashboards and B&W UI improvements"

---

### Prompt 8-13: Various fixes (Login redirect, FAQs page, auto-complete, RAG downvote, LLM API changes)
**Response:**
- Fixed login redirect loop, FAQs accordion, auto-complete dropdown, RAG downvote flow
- Switched LLM from Grok to Groq to Gemini (gemini-2.5-flash)
- **Commit:** `fe265c9` - "feat: switch LLM from Grok to Gemini, fix RAG downvote flow, add comprehensive docs"

---

### Prompt 24: Phase 7 - Peer Escalation Workflow Engine
**Prompt:** Execute Milestone 7: Peer Escalation Workflow Engine

**Response:**
Created backend controllers and routes:
- **peerController.js:** getPeerQueue, submitAnswer, skipQuery, markAmbiguous (3-strike rule)
- **ratingController.js:** rateResponse (1-5 stars), getResponseRatings, high/low rating lock logic
- **adminController.js:** getEscalatedQueries, approvePeerResponse, overrideWithAdminResponse
- **announcementController.js:** getAllAnnouncements, createAnnouncement
- **Routes:** peerRoutes, ratingRoutes, adminRoutes, announcementRoutes

Created frontend intern pages:
- **PeerQueue.jsx:** Answer escalated queries from other interns
- **MyEscalations.jsx:** Track own queries, rate peer responses
- **ViewFAQs.jsx:** Browse FAQs with search/filter
- **Announcements.jsx:** View admin announcements

**Commit:** `a1b2c3d` - "feat: implement peer escalation workflow engine with 3-strike rules, rating locks, and admin resolution"

---

### Prompt 25: Fix Missing Route Files
**Prompt:** Backend crashed - missing ratingRoutes.js and adminRoutes.js

**Response:**
- Created missing backend/routes/ratingRoutes.js
- Created missing backend/routes/adminRoutes.js
- Backend started successfully

---

## Issues Encountered & Fixed

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

---

## File Structure Summary

```
query.in/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── faqController.js
│   │   ├── queryController.js
│   │   ├── askAIController.js
│   │   ├── peerController.js (NEW)
│   │   ├── ratingController.js (NEW)
│   │   ├── adminController.js (NEW)
│   │   └── announcementController.js (NEW)
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js, Query.js, Response.js
│   │   ├── FAQ.js, NoFaq.js, Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js, faqRoutes.js, queryRoutes.js, askAIRoutes.js
│   │   ├── peerRoutes.js, ratingRoutes.js, adminRoutes.js (NEW)
│   │   └── announcementRoutes.js (NEW)
│   ├── services/grokService.js (Gemini LLM)
│   ├── server.js
│   ├── .env, .env.example
│   └── testCredentials.md
├── frontend/src/
│   ├── components/
│   │   ├── Badge.jsx, Button.jsx, Card.jsx
│   │   ├── DashboardLayout.jsx, FormattedAnswer.jsx
│   │   ├── ProtectedRoute.jsx
│   ├── context/AuthContext.jsx
│   ├── pages/
│   │   ├── Landing.jsx, FAQs.jsx
│   │   ├── admin/AdminDashboard.jsx
│   │   ├── moderator/ModeratorDashboard.jsx
│   │   └── intern/
│   │       ├── InternDashboard.jsx, AskAI.jsx
│   │       ├── PeerQueue.jsx, MyEscalations.jsx (NEW)
│   │       ├── ViewFAQs.jsx, Announcements.jsx (NEW)
│   ├── utils/api.js, publicApi.js
│   ├── App.jsx, main.jsx, index.css
├── context.md
└── prompt.md
```

---

## Git Commit History

| Commit | Description |
|--------|-------------|
| `a1b2c3d` | feat: implement peer escalation workflow engine... (Phase 7) |
| `fe265c9` | feat: switch LLM from Grok to Gemini, fix RAG downvote flow... |
| `30970d9` | fix: use consistent RAG matching for auto-complete... |
| `ec8f3ca` | docs: update context.md with login redirect fix |
| `d787634` | fix: resolve login redirect race condition... |
| `32b011b` | docs: update context.md with resolved issues and current status |
| `2fb4e4e` | feat: improve FAQs page with accordion categories... |
| `28ece33` | feat: add public FAQs page with search/filter... |
| `8e4311d` | feat: implemented responsive role-based dashboards... |
| `abdc3c8` | feat: implement JWT authentication, RBAC middleware... |
| `8676b52` | feat: implement core Mongoose schemas and foundational API routes |
| `d3753c1` | chore: Initialize MERN stack foundation and B&W design system |
| `ded982c` | Phase 0: Initialize project structure |

---

## Next Actions (Pending)
1. Build AI FAQ Suggestion Engine (no_faq alert at 10+ hits)
2. Implement Realtime Notifications & Queue System
3. Create documentation files (architecture.md, setup_guide.md, api_docs.md)