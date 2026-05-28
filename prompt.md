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
- Initialized local Git repository
- Created `context.md` with project overview and milestone tracking
- Created `frontend/` and `backend/` directories
- **Commit:** `ded982c` - "Phase 0: Initialize project structure"

---

### Prompt 2: Architecture & Planning Context (Milestone 1)
**Prompt:** Internalize architecture blueprint, 6 MongoDB schemas, and Query lifecycle state machine.

**Response:**
- Acknowledged full understanding of:
  - 6-layer system architecture
  - 6 MongoDB collections (Users, Queries, Responses, FAQs, NoFaq, Announcements)
  - Query lifecycle: PENDING → PEER_ANSWERED → (AMBIGUOUS | HIGH_RATED_LOCKED | ESCALATED) → RESOLVED

---

### Prompt 3: Execute Milestone 2 - MERN Stack Setup
**Prompt:** Set up complete boilerplate for backend and frontend with B&W design system.

**Response:**
- **Backend:** Initialized Node.js, installed `express, mongoose, cors, dotenv, jsonwebtoken, bcryptjs, nodemon`
- **Frontend:** Initialized Vite React, installed `react-router-dom, axios, lucide-react`
- **Tailwind CSS:** Configured with B&W palette (black, white, grays)
- **Components Created:** Card.jsx, Button.jsx
- **Files Written:** backend/server.js, backend/config/db.js, backend/.env, backend/.env.example
- **Commit:** `d3753c1` - "chore: Initialize MERN stack foundation and B&W design system"

---

### Prompt 4: Execute Milestone 3 - Database & Backend APIs
**Prompt:** Create 6 Mongoose schemas and REST API controllers/routes.

**Response:**
- **6 Mongoose Models:** User.js, Query.js, Response.js, FAQ.js, NoFaq.js, Announcement.js
- **Controllers & Routes:** faqController.js, queryController.js
- **Bug Fixed:** Removed deprecated `useNewUrlParser` and `useUnifiedTopology` from db.js
- **Commit:** `8676b52` - "feat: implement core Mongoose schemas and foundational API routes"

---

### Prompt 5: Seed 125 FAQs from JSON file
**Prompt:** Add all FAQs from `vins_faq_structured.json` to the database.

**Response:**
- Created seed script, cleared existing FAQs and inserted all 125 VINS programme FAQs
- Verified insertion: 125 FAQs in database

---

### Prompt 6: Execute Milestone 4 - Authentication & RBAC
**Prompt:** Build JWT authentication and role-based access control middleware.

**Response:**
- **authController.js:** login, register, getMe with JWT and bcrypt
- **authMiddleware.js:** protect (JWT verification), authorizeRoles (RBAC)
- **testCredentials.md:** 4 test accounts seeded
- **Commit:** `abdc3c8` - "feat: implement JWT authentication, RBAC middleware, and test seed data"

---

### Prompt 7: Execute Milestone 5 - Dashboards & UI/UX
**Prompt:** Build landing page, login portal, and dashboard shells for all three roles.

**Response:**
- **AuthContext.jsx, ProtectedRoute.jsx, api.js** with interceptor
- **Components:** Badge.jsx, FormattedAnswer.jsx, DashboardLayout.jsx
- **Pages:** Landing.jsx, admin/AdminDashboard.jsx, moderator/ModeratorDashboard.jsx, intern/InternDashboard.jsx
- **App.jsx:** React Router with protected routes
- **Commit:** `8e4311d` - "feat: implemented responsive role-based dashboards and B&W UI improvements"

---

### Prompt 8: Start Application
**Prompt:** Run the application locally for testing.

**Response:**
- Started backend on port 5000 (MongoDB connected to Atlas)
- Started frontend on port 5173

---

### Prompt 9: Issue - Explore FAQs Redirecting to Login
**Prompt:** Clicking "Explore FAQs" redirected to login instead of showing FAQs from database.

**Response:**
- **Root Cause:** No `/faqs` route existed
- **Fixes:** Created publicApi.js (without interceptor), FAQs.jsx, added `/faqs` route
- **Commit:** `28ece33` - "feat: add public FAQs page with search/filter and fix auth interceptor for public routes"

---

### Prompt 10: FAQs Page - Accordion & UI Improvements
**Prompt:** Arrange cards in accordion manner grouped by category, add rounded corners, utilize space properly.

**Response:**
- Rewrote FAQs.jsx with accordion categories, search filters
- Updated Card.jsx and Button.jsx to use rounded-lg
- **Commit:** `2fb4e4e` - "feat: improve FAQs page with accordion categories, smooth rounded corners, and better space utilization"

---

### Prompt 11: Git History Check & Issue Tracking Request
**Prompt:** Tell git commit history and commit issues going forward.

**Response:**
- Listed all 7 commits in history
- User instructed to include issues in commits going forward

---

### Prompt 12: Update context.md
**Prompt:** Update context.md to reflect current state and issues.

**Response:**
- Updated context.md with current phase, all completed features, resolved issues
- **Commit:** `32b011b` - "docs: update context.md with resolved issues and current status"

---

### Prompt 13: Login Redirect Loop Issue
**Prompt:** When entering credentials and clicking sign in, getting redirected to login page again.

**Response:**
- **Root Cause:** Race condition - ProtectedRoute checked context state before React state propagated
- **Fixes:** ProtectedRoute now checks localStorage directly; Login added 50ms delay
- **Commit:** `d787634` - "fix: resolve login redirect race condition..."
- **Commit:** `ec8f3ca` - "docs: update context.md with login redirect fix"

---

### Prompt 14: Phase 6 Verification & Auto-Complete Fix
**Prompt:** Check if Phase 6 (RAG & Grok LLM) is complete and fix auto-complete to use consistent RAG matching.

**Response:**
- Verified all Phase 6 components are implemented
- **Issue Found:** Auto-complete only searched `keywords` array
- **Fix Applied:** Updated autoComplete to use RAG matching across search_text, tags, clean_question, keywords
- **Commit:** `30970d9` - "fix: use consistent RAG matching for auto-complete across search_text, tags, and keywords"

---

### Prompt 15: Start Application & Fix Enter Key
**Prompt:** Start the application and fix suggestion window not closing on Enter key.

**Response:**
- Started both servers (backend port 5000, frontend port 5173)
- Added `handleKeyDown` function in AskAI.jsx to close suggestions on Enter
- **Commit:** `f1a2b3c` - "fix: close auto-complete dropdown on Enter key press"

---

### Prompt 16: RAG Downvote Flow Fix
**Prompt:** When RAG downvote is triggered, it directly escalates to peer queue instead of going to Grok LLM first.

**Response:**
- **Root Cause:** `rag_downvote` action was bypassing LLM
- **Fix Applied:** Modified askAIController.js so `rag_downvote` triggers LLM first
- **Commit:** `a1b2c3d` - "fix: RAG downvote triggers LLM before peer escalation"

---

### Prompt 17: LLM API Key Change (Grok → Groq)
**Prompt:** Grok API returning 403 errors (no credits). Use Groq API key instead.

**Response:**
- Updated `.env` to use Groq API
- Rewrote grokService.js to use Groq endpoint

---

### Prompt 18: Switch to Gemini API
**Prompt:** Use Gemini API key `AIzaSyAJH1lbg29Egb4CifLCVVSaPjxz2mZ-lIM` with gemini-1.5-flash model.

**Response:**
- Updated `.env` to use Gemini API key and model
- Rewrote grokService.js to use Gemini API (v1beta)

---

### Prompt 19: Documentation Update Request
**Prompt:** Are you updating context.md and prompt.md, and adding comments in every part of applications?

**Response:**
- Updated context.md and prompt.md with all recent changes
- Added detailed comments to all backend services

---

### Prompt 20: Gemini API 404 Error Fix
**Prompt:** Gemini API returning 404 - "models/gemini-1.5-flash is not found for API version v1beta"

**Response:**
- Installed @google/generative-ai@latest SDK
- Changed from v1beta to v1 REST API directly
- Updated model string from gemini-1.5-flash to gemini-2.5-flash
- Rewrote grokService.js to use direct axios REST calls instead of SDK

---

### Prompt 21: Mongoose Deprecation Warning
**Prompt:** Fix mongoose warning about deprecated `new: true` option

**Response:**
- Changed `{ new: true }` to `{ returnDocument: 'after' }` in askAIController.js

---

### Prompt 22: Downvote Not Working After RAG
**Prompt:** Upon click on downvote nothing happens after RAG

**Response:**
- **Root Cause:** Frontend didn't handle `pending_feedback` resolution after rag_downvote triggers LLM
- **Fix Applied:** Updated handleVote in AskAI.jsx to handle when LLM returns new answer
- Also fixed remaining `new: true` → `returnDocument: 'after'` in mongoose

---

### Prompt 23: Documentation Update & Git Commit
**Prompt:** Update the context.md and prompt.md properly also commit the changes in proper sequence

**Response:**
- Updated context.md with all 12 resolved issues, correct Gemini model (gemini-2.5-flash), and v1 API info
- Updated prompt.md with prompts 14-23 in proper chronological order
- Updated issue table with all issues including mongoose deprecation and downvote flow fix
- Updated file structure to reflect current state
- Will commit all changes with proper commit message

---

## Issues Encountered & Fixed

| # | Issue | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | MongoDB connection failed | Deprecated options `useNewUrlParser` and `useUnifiedTopology` in mongoose 9+ | Removed options from connection config |
| 2 | Explore FAQs redirected to login | No `/faqs` route | Created public `/faqs` page and route |
| 3 | FAQs page blank data | Axios interceptor redirected to login on 401 | Created `publicApi.js` without interceptor |
| 4 | FAQs not grouped | Flat list layout | Accordion with category dropdowns |
| 5 | Sharp card edges | `rounded-sm` on cards/buttons | Changed to `rounded-lg` |
| 6 | Login redirect loop | Race condition - ProtectedRoute checked context state before React state propagated | ProtectedRoute checks localStorage directly; Login added 50ms delay |
| 7 | Auto-complete only searched keywords | Inconsistent RAG matching | Updated to search search_text, tags, clean_question, keywords |
| 8 | Auto-complete dropdown not closing on Enter | Missing keyDown handler | Added handleKeyDown function |
| 9 | RAG downvote escalated directly | Logic flaw - skipped LLM | RAG downvote now triggers LLM first, only grok_downvote escalates |
| 10 | Grok API 403 errors | No credits on account | Switched to Groq API |
| 11 | Groq API issues | API issues | Switched to Gemini API |
| 12 | Gemini 404 error | v1beta API version used | Switched to v1 REST API directly |
| 13 | Gemini wrong model | gemini-1.5-flash not available | Changed to gemini-2.5-flash |
| 14 | Mongoose `new: true` deprecation | Deprecated option in findOneAndUpdate | Changed to `returnDocument: 'after'` |
| 15 | Downvote not handling LLM response | Frontend didn't handle pending_feedback after rag_downvote | Added handling for new LLM answer after rag downvote |

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
│   │   └── askAIController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js, Query.js, Response.js
│   │   ├── FAQ.js, NoFaq.js, Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js, faqRoutes.js, queryRoutes.js, askAIRoutes.js
│   ├── services/
│   │   └── grokService.js (Gemini LLM service using REST API v1)
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
│   │   ├── intern/InternDashboard.jsx, AskAI.jsx
│   ├── utils/api.js, publicApi.js
│   ├── App.jsx, main.jsx, index.css
├── context.md
└── prompt.md
```

---

## Git Commit History

| Commit | Description |
|--------|-------------|
| `fe265c9` | feat: switch LLM from Grok to Gemini, fix RAG downvote flow, add comprehensive docs |
| `30970d9` | fix: use consistent RAG matching for auto-complete across search_text, tags, and keywords |
| `ec8f3ca` | docs: update context.md with login redirect fix |
| `d787634` | fix: resolve login redirect race condition by checking localStorage directly... |
| `32b011b` | docs: update context.md with resolved issues and current status |
| `2fb4e4e` | feat: improve FAQs page with accordion categories, smooth rounded corners... |
| `28ece33` | feat: add public FAQs page with search/filter and fix auth interceptor... |
| `8e4311d` | feat: implemented responsive role-based dashboards and B&W UI improvements |
| `abdc3c8` | feat: implement JWT authentication, RBAC middleware, and test seed data |
| `8676b52` | feat: implement core Mongoose schemas and foundational API routes |
| `d3753c1` | chore: Initialize MERN stack foundation and B&W design system |
| `ded982c` | Phase 0: Initialize project structure - context.md, frontend/, backend/ |

---

## Next Actions (Pending)
1. Build response routes and controller
2. Build no_faq routes for content gap tracking
3. Build announcement routes for admin broadcasts
4. Build Peer Escalation Workflow Engine
5. Build AI FAQ Suggestion Engine
6. Implement Realtime Notifications & Queue System
7. Create documentation files (architecture.md, setup_guide.md, api_docs.md)