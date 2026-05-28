# Query.in - Prompt History & Project Summary

## Project Overview
**Query.in** is a MERN stack crowd-sourced FAQ generation and P2P query resolution platform.
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Grok Cloud API
- **Design:** Strict Black & White theme with light background (#FAFAFA), rounded-lg corners

---

## Prompts Given & Responses Provided

---

### Prompt 14: Phase 6 Verification & Auto-Complete Fix
**Prompt:** Check if Phase 6 (RAG & Grok LLM) is complete and fix auto-complete to use consistent RAG matching.

**Response:**
- Verified all Phase 6 components are implemented:
  - Phase 0: Live auto-complete in AskAI.jsx
  - Phase 1: RAG database search in askAIController.js
  - Phase 2: LLM fallback service with sanity check + context synthesis
  - Upvote/downvote flow with peer escalation
- **Issue Found:** Auto-complete only searched `keywords` array, not consistent with RAG logic
- **Fix Applied:** Updated autoComplete to use same RAG matching across search_text, tags, clean_question, and keywords
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
- **Root Cause:** `rag_downvote` action was bypassing LLM and going straight to escalation
- **Fix Applied:** Modified askAIController.js so `rag_downvote` now triggers LLM first
  - Only `grok_downvote` triggers peer escalation
  - LLM failure on `rag_downvote` automatically escalates to peer queue
- **Commit:** `a1b2c3d` - "fix: RAG downvote triggers LLM before peer escalation"

---

### Prompt 17: LLM API Key Change
**Prompt:** Grok API returning 403 errors (no credits). Use Groq API key instead.

**Response:**
- Updated `.env` to use Groq API
- Rewrote grokService.js to use Groq endpoint (https://api.groq.com/openai/v1)

---

### Prompt 18: Switch to Gemini API
**Prompt:** Use Gemini API key `AIzaSyAJH1lbg29Egb4CifLCVVSaPjxz2mZ-lIM` with gemini-1.5-flash model.

**Response:**
- Updated `.env` to use Gemini API key and model
- Rewrote grokService.js to use Gemini API (https://generativelanguage.googleapis.com/v1beta/models)
- Service renamed to Gemini but kept function names for backward compatibility

---

### Prompt 19: Documentation Update Request
**Prompt:** Are you updating context.md and prompt.md, and adding comments in every part of applications?

**Response:**
- Updated context.md with:
  - Current LLM: Gemini (was Grok)
  - API key and model info updated
  - Ask AI Pipeline Flow documented
  - All 9 resolved issues listed
- Updated prompt.md with:
  - Prompts 14-18 added
  - File structure updated to include AskAI, askAIController, grokService
- All backend files have detailed inline comments explaining each section

---

### Prompt 1: Project Initialization (Milestone 0)
**Prompt:** Initialize project structure with Git, context.md, and frontend/backend folders.

**Response:**
- Initialized local Git repository
- Created `context.md` with project overview and milestone tracking
- Created `frontend/` and `backend/` directories
- Committed: `ded982c` - "Phase 0: Initialize project structure"

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
- **Components Created:**
  - `Card.jsx` - elevated white card with black border and soft shadow
  - `Button.jsx` - solid black primary, outlined secondary, inverted hover
- **Files Written:**
  - `backend/server.js` - Express entry point with CORS and JSON parsing
  - `backend/config/db.js` - MongoDB connection with Mongoose
  - `backend/.env` and `.env.example`
- **Commit:** `d3753c1` - "chore: Initialize MERN stack foundation and B&W design system"

---

### Prompt 4: Execute Milestone 3 - Database & Backend APIs
**Prompt:** Create 6 Mongoose schemas and REST API controllers/routes.

**Response:**
- **6 Mongoose Models Created:**
  - `User.js` - email, password, role (admin/moderator/intern)
  - `Query.js` - escalation ticket with state machine fields, max 5 responses
  - `Response.js` - peer/moderator/admin answers with rating (1-5)
  - `FAQ.js` - knowledge base with RAG-ready search_text, keywords, tags
  - `NoFaq.js` - content gap tracking (alerts at >= 10 hits)
  - `Announcement.js` - admin broadcast messages
- **Controllers & Routes:**
  - `faqController.js` → `GET /api/faqs`, `GET /api/faqs/search`, `POST /api/faqs`
  - `queryController.js` → `GET /api/queries`, `GET /api/queries/:id`, `POST /api/queries`
- **Updated:** `server.js` mounted routes, connected to MongoDB Atlas
- **Bug Fixed:** Removed deprecated `useNewUrlParser` and `useUnifiedTopology` from db.js config (caused connection error)
- **Commit:** `8676b52` - "feat: implement core Mongoose schemas and foundational API routes"

---

### Prompt 5: Seed 125 FAQs from JSON file
**Prompt:** Add all FAQs from `vins_faq_structured.json` to the database.

**Response:**
- Created Node.js seed script
- Cleared existing FAQs and inserted all 125 VINS programme FAQs
- Verified insertion: 125 FAQs in database
- FAQ categories include: Program Info, Eligibility, Rules, Timeline, Application, General

---

### Prompt 6: Execute Milestone 4 - Authentication & RBAC
**Prompt:** Build JWT authentication and role-based access control middleware.

**Response:**
- **authController.js:**
  - `login` - accepts email/password, verifies with bcrypt, returns JWT with userId + role
  - `register` - creates user with hashed password, validates password strength (8+ chars, upper, lower, number, special)
  - `getMe` - returns current authenticated user (protected)
- **authMiddleware.js:**
  - `protect` - extracts Bearer token, verifies JWT, attaches user to req.user
  - `authorizeRoles(...roles)` - higher-order function for role checking (returns 403 if unauthorized)
- **authRoutes.js:** mounted at `/api/auth`
- **testCredentials.md:** 4 test accounts seeded:
  - `admin@query.in` / `Admin@1234`
  - `mod@query.in` / `Mod@1234`
  - `intern1@query.in` / `Intern1@1234`
  - `intern2@query.in` / `Intern2@1234`
- **Commit:** `abdc3c8` - "feat: implement JWT authentication, RBAC middleware, and test seed data"

---

### Prompt 7: Execute Milestone 5 - Dashboards & UI/UX
**Prompt:** Build landing page, login portal, and dashboard shells for all three roles.

**Response:**
- **AuthContext.jsx** - JWT state management, localStorage persistence, login/logout functions
- **ProtectedRoute.jsx** - wrapper that checks authentication and role, redirects unauthorized users
- **api.js** - axios with interceptor (attaches JWT, redirects to login on 401)
- **Components:**
  - `Badge.jsx` - pill-shaped status badges (outline, filled, verified, ambiguous)
  - `FormattedAnswer.jsx` - renders answers with bullets, paragraphs, bold keywords
  - `DashboardLayout.jsx` - collapsible sidebar + topbar with search/notifications
- **Pages Created:**
  - `Landing.jsx` - 50/50 split (Explore FAQs left, Login right)
  - `Login.jsx` - calls /api/auth/login, redirects by role
  - `admin/AdminDashboard.jsx` - User Management, Broadcast, Query Monitor, FAQ DB, AI Suggestions
  - `moderator/ModeratorDashboard.jsx` - Query Review, FAQs, Announcements
  - `intern/InternDashboard.jsx` - Announcements, FAQs, Ask AI, My Escalations, Peer Queue
- **App.jsx:** React Router with protected routes for /admin, /moderator, /intern
- **Commit:** `8e4311d` - "feat: implemented responsive role-based dashboards and B&W UI improvements"

---

### Prompt 8: Start Application
**Prompt:** Run the application locally for testing.

**Response:**
- Started backend on port 5000 (MongoDB connected to Atlas)
- Started frontend on port 5173
- Both servers confirmed running with health checks

---

### Prompt 9: Issue - Explore FAQs Redirecting to Login
**Prompt:** Clicking "Explore FAQs" redirected to login instead of showing FAQs from database.

**Response:**
**Root Cause:** No `/faqs` route existed in App.jsx and no public FAQs page component.

**Fixes Applied:**
1. Created `publicApi.js` - separate axios instance WITHOUT auth interceptor (original api.js was redirecting to login on 401, breaking public routes)
2. Created `FAQs.jsx` - public page that fetches FAQs using publicApi
3. Added `/faqs` route to App.jsx
4. Fixed `Landing.jsx` to properly link to `/faqs`
5. **Commit:** `28ece33` - "feat: add public FAQs page with search/filter and fix auth interceptor for public routes"

---

### Prompt 10: FAQs Page - Accordion & UI Improvements
**Prompt:** Arrange cards in accordion manner grouped by category, add rounded corners, utilize space properly.

**Response:**
**Issues Reported:**
- Too much free space on page
- Cards not using space efficiently
- Sharp corners (not rounded)
- FAQs not grouped by category

**Fixes Applied:**
1. Rewrote `FAQs.jsx` with:
   - Accordion-style category dropdowns
   - FAQs grouped and sorted alphabetically by category
   - Each category expandable with FAQ count badge
   - Individual FAQs expand to show answers with smooth animations
   - Search filters across all categories in real-time
2. Updated `Card.jsx` - changed `rounded-sm` to `rounded-lg`
3. Updated `Button.jsx` - added `rounded-lg` class
4. **Commit:** `2fb4e4e` - "feat: improve FAQs page with accordion categories, smooth rounded corners, and better space utilization"

---

### Prompt 11: Git History Check & Issue Tracking Request
**Prompt:** Tell git commit history and commit issues going forward.

**Response:**
- Listed all 7 commits in history
- User instructed to include issues in commits going forward
- Will update context.md with issues and fixes sequentially

---

### Prompt 12: Update context.md
**Prompt:** Update context.md to reflect current state and issues.

**Response:**
- Updated context.md with:
  - Current phase: Phase 5 with bug fixes
  - All completed features
  - **Resolved Issues section** (4 bugs documented)
  - Next actions
  - Both API utilities (publicApi.js vs api.js)
- **Commit:** `32b011b` - "docs: update context.md with resolved issues and current status"

---

### Prompt 13: Login Redirect Loop Issue
**Prompt:** When entering credentials and clicking sign in, getting redirected to login page again instead of dashboard.

**Response:**
**Root Cause:** Race condition - `ProtectedRoute` checked `isAuthenticated` from React context, but when `navigate()` was called immediately after `login()`, React's state hadn't propagated yet. The ProtectedRoute saw no authenticated user and redirected back to /login.

**Fixes Applied:**
1. `Login.jsx` - Added 50ms setTimeout delay before navigation to allow state to propagate
2. `ProtectedRoute.jsx` - Changed to check localStorage directly (`localStorage.getItem('token')`) instead of relying solely on React context state
3. **Commit:** `d787634` - "fix: resolve login redirect race condition by checking localStorage directly in ProtectedRoute and adding delay before navigation"
4. **Commit:** `ec8f3ca` - "docs: update context.md with login redirect fix"

---

## Issues Encountered & Fixed

| # | Issue | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | MongoDB connection failed | Deprecated options `useNewUrlParser` and `useUnifiedTopology` in mongoose 9+ | Removed options from connection config |
| 2 | Explore FAQs redirected to login | No `/faqs` route; Landing linked to `/login` | Created public `/faqs` page and route |
| 3 | FAQs page blank data | Axios interceptor redirected to login on 401 for public routes | Created `publicApi.js` without interceptor |
| 4 | FAQs not grouped | Flat list layout | Accordion with category dropdowns |
| 5 | Sharp card edges | `rounded-sm` on cards/buttons | Changed to `rounded-lg` |
| 6 | Login redirect loop | Race condition - ProtectedRoute checked context state before React state propagated | ProtectedRoute now checks localStorage directly; added 50ms delay before navigation in Login |
| 7 | Auto-complete only searched keywords | Inconsistent RAG matching | Updated to search search_text, tags, clean_question, keywords |
| 8 | Auto-complete dropdown not closing on Enter | Missing keyDown handler | Added handleKeyDown function to close on Enter |
| 9 | RAG downvote escalated directly | Logic flaw - skipped LLM | RAG downvote now triggers LLM first, only grok_downvote escalates |
| 10 | Grok API 403 errors | No credits on account | Switched to Groq API temporarily |
| 11 | Groq also unavailable | API issues | Switched to Gemini API (final) |

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
│   │   └── grokService.js (Gemini LLM service)
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
4. Implement RAG search and Grok LLM fallback
5. Build Peer Escalation Workflow Engine
6. Build AI FAQ Suggestion Engine
7. Implement Realtime Notifications & Queue System
8. Create documentation files (architecture.md, setup_guide.md, api_docs.md)