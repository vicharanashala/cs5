# Query.in - Prompt History & Project Summary

## Project Overview
**Query.in** is a MERN stack crowd-sourced FAQ generation and P2P query resolution platform.
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API
- **Design:** Strict Black & White theme with light background (#FAFAFA), rounded-lg corners

---

## Prompts Given & Responses Provided

---

### Prompt 29: LLM Improvements & Groq Integration
**Prompt:** Add Groq API as Gemini fallback, implement multi-model switching, increase max tokens to 2000, add image error logging, enforce plain text LLM responses

**Response:**
Updated grokService.js (LLM service):
- Added Groq API integration with API key REDACTED_GROQ_KEY
- Gemini model order: 3.5-flash -> 3.1-pro -> 3.1-flash-lite -> 2.5-flash -> 2.5-pro
- Groq model order: llama-3.3-70b -> llama-3.1-8b -> llama-4-scout -> qwen3-32b -> gpt-oss-120b -> gpt-oss-20b
- MAX_OUTPUT_TOKENS increased from 800 to 2000
- Timeout increased from 30s to 60s
- Enhanced logging: logs model name, response length, image error "Cannot read image.png (this model does not support image input)"
- Timeout handling: auto-switch to next model on timeout
- LLM response rules: no emojis, no formatting (#, *, bold, italics), plain text only, concise answers

Updated askAIController.js and queryController.js:
- Added active query cap check (max 5 unresolved per intern)
- Added spam prevention (similar query regex check)
- Added analytics tracking with ResolutionType enum

---

### Prompt 28: Phase 11 - Documentation Engine
**Prompt:** Execute Milestone 11: Documentation Engine

**Response:**
Created comprehensive documentation suite:
- **README.md:** Project overview, core workflow, documentation directory, quick start guide, test accounts, environment variables
- **docs/FEATURES.md:** Flagship feature highlights (Gemini pipeline, 5-answer lock, 3-strike rule, FAQ suggestion engine), full feature list, role permission matrix
- **docs/setup_guide.md:** Step-by-step installation, environment configuration, project structure, troubleshooting, production deployment
- **docs/architecture.md:** System architecture diagrams, React + Vite structure, Express routing, Socket.IO integration, RBAC middleware, query state machine
- **docs/api_docs.md:** Complete REST API reference with request/response formats for all endpoints
- **docs/database_schema.md:** MongoDB schema reference with ObjectId relationships, validation rules, lifecycle diagrams

All documents use professional formatting with code blocks, tables, and diagrams.

**Commit:** `78eb4a4` - "docs: implement master README, feature breakdown, and comprehensive technical documentation"

---

### Prompt 27: Phase 9 - Realtime Notifications & Queue System
**Prompt:** Execute Milestone 9: Realtime Notifications & Queue System

**Response:**
Created backend files:
- **config/socket.js:** Socket.IO server initialization with getIO() export
- **jobs/sweeper.js:** Query status management job

Integrated Socket.IO events in controllers:
- **peerController.js:** Emits `new_peer_answer` event after submitAnswer
- **adminController.js:** Emits `query_resolved` event after approvePeerResponse and overrideWithAdminResponse

Both events emit to intern's personal room `user:{intern_id}` for targeted notifications.

**Commit:** `e307d71` - "feat: Phase 9 - Socket.IO realtime notifications"

---

### Prompt 26: Phase 8 - AI FAQ Suggestion Engine
**Prompt:** Execute Milestone 8: AI FAQ Suggestion Engine

**Response:**
Created backend analytics controller and routes:
- **analyticsController.js:** trackNoFaqQuery (with anti-inflation logic), getFaqSuggestions (>=10 hits), dismissFaqSuggestion, createFaqFromSuggestion, getAllNoFaqQueries, getNoFaqStats
- **analyticsRoutes.js:** GET /analytics/faq-suggestions, DELETE /analytics/suggestions/:id, POST /analytics/create-faq

Created frontend AdminSuggestions page (Card 7):
- Yellow border alert when new unread suggestions exist (occurrenceCount >= 10)
- "Dismiss" action to clear suggestions
- "Add to FAQs" button that opens modal with pre-populated question
- Stats display: suggestions ready, total gaps, avg occurrences

Updated askAIController to use trackNoFaqQuery when LLM fails

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
| 14 | no_faq tracking broken | No analytics controller | Created analyticsController.js with trackNoFaqQuery |

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
│   │   ├── peerController.js
│   │   ├── ratingController.js
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   └── analyticsController.js (NEW)
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js, Query.js, Response.js
│   │   ├── FAQ.js, NoFaq.js, Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js, faqRoutes.js, queryRoutes.js, askAIRoutes.js
│   │   ├── peerRoutes.js, ratingRoutes.js, adminRoutes.js
│   │   ├── announcementRoutes.js, analyticsRoutes.js (NEW)
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
│   │   ├── admin/AdminDashboard.jsx, AdminSuggestions.jsx (NEW)
│   │   ├── moderator/ModeratorDashboard.jsx
│   │   └── intern/
│   │       ├── InternDashboard.jsx, AskAI.jsx
│   │       ├── PeerQueue.jsx, MyEscalations.jsx (NEW)
│   │       ├── ViewFAQs.jsx, Announcements.jsx (NEW)
│   ├── utils/api.js, publicApi.js
│   ├── App.jsx, main.jsx, index.css
├── docs/
│   ├── FEATURES.md
│   ├── setup_guide.md
│   ├── architecture.md
│   ├── api_docs.md
│   └── database_schema.md
├── context.md
└── prompt.md
```

---

## Git Commit History

| Commit | Description |
|--------|-------------|
| `e191db8` | feat: add Groq API fallback, multi-model switching, 2000 tokens, analytics tracking, plain text LLM responses |
| `78eb4a4` | docs: implement master README, feature breakdown, and comprehensive technical documentation |
| `3b1d3d7` | docs: update prompt.md with Phase 9 Socket.IO realtime notifications |
| `e307d71` | feat: Phase 9 - Socket.IO realtime notifications |
| `4afcf4a` | feat: implement AI FAQ suggestion engine with 10-occurrence threshold... |
| `169d831` | feat: implement peer escalation workflow engine with 3-strike rules... |
| `2e1e130` | feat: fix downvote flow, update Gemini API to v1 with gemini-2.5-flash... |
| `fe265c9` | feat: switch LLM from Grok to Gemini, fix RAG downvote flow... |
| `30970d9` | fix: use consistent RAG matching for auto-complete... |
| `fd931f6` | fix: embed login form directly in Landing page... |
| `005eeee` | fix: simplify auth flow... |
| `42a4b5d` | fix: use window.location.href for hard redirect after login... |
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
1. ✅ Build AI FAQ Suggestion Engine (Phase 8 - Complete)
2. ✅ Implement Realtime Notifications & Queue System (Phase 9 - Complete)
3. ✅ Documentation Engine (Phase 11 - Complete)
4. ✅ LLM Improvements & Groq Integration (Complete)
5. Automated Testing Suite (Phase 10 - Pending)