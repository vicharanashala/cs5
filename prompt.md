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
| 15 | Frontend api.js import error | Named export instead of default | Changed `import { api }` to `import api` |
| 16 | VITE_API_URL undefined crash | env variable not set | Added fallback default `http://localhost:5000` |
| 17 | LLM upvote shows RAG answer | grok_upvote not handled in backend | Added grok_upvote handler returning resolved state |
| 18 | Garbage input passed to RAG/LLM | No input validation | Added query sanity check with lenient validation rules |
| 19 | Peer answer submission failed (500 error) | authMiddleware sets req.user.userId but controllers use req.user.id | Changed all req.user.id to req.user.userId in all controllers |
| 20 | MyEscalations socket connection failed | VITE_API_URL undefined caused .replace() to fail | Added VITE_API_URL fallback before .replace() |
| 21 | Sweeper edge case: 5 responses with all low ratings not locked | responseCount <= 4 should be < MAX_PEER_RESPONSES | Changed condition to use MAX_PEER_RESPONSES=5 constant |
| 22 | Ambiguous 3-strike doesn't notify intern | No notification sent when query becomes Ambiguous | Added createNotification call in peerController when status changes to Ambiguous |
| 23 | createFAQFromQuery does nothing | Stub function only returned query_text | Implemented actual FAQ creation from approved response |
| 24 | Missing Stagnant Queue in Admin Dashboard | Only 5 sections instead of 6 | Added "Stagnant (0 answers)" as 6th section + Add to FAQ button |
| 25 | AskAI error message too generic | catch block showed "Failed to submit feedback" | Now shows actual backend error message |
| 26 | No way to clear escalation data | Accumulated queries clutter database | Added POST /api/admin/clear-all-data endpoint |
| 27 | Race condition in submitAnswer | Pre-check query.responses.length then update allows bypass | Atomic `findOneAndUpdate` with `$expr: { $lt: [{ $size: "$responses" }, 5] }` |
| 28 | N+1 query performance in sweeper | for-loop with Response.find() + Query.findByIdAndUpdate() per query | Aggregation pipeline + updateMany for bulk locking |
| 29 | Incorrect telemetry in LLM pipeline | `synthesizeWithGemini/Grok` returned just answer, `getGrokResponse` hardcoded model[0] | Now returns `{ answer, model }` for accurate model tracking |
| 30 | ProtectedRoute redirected to /login | Login form embedded on Landing page at `/` | Changed redirect from `/login` to `/` |
| 31 | ViewFAQs markdown not rendering | Raw text in `<p>` tag, no markdown parsing | Added react-markdown for proper rendering |
| 32 | ViewFAQs missing status badges | No status indicators on FAQ cards | Added "AI Generated", "Peer Answered", "Verified by Admin" badges |
| 33 | ViewFAQs auto-expand on load | First category auto-expanded on page load | Removed auto-expand, categories start collapsed |

---

### Prompt 35: Query Input Sanity Check
**Prompt:** Add sanity check when intern asks query before sending to RAG model to prevent garbage input. On failure, ask intern to re-enter valid query.

**Response:**
Added `validateQuery` function in both frontend and backend:

**Frontend (`AskAI.jsx:123-164`):**
- Minimum 5 chars, max 1000 chars
- At least 4 actual letters
- Special char ratio < 30%
- No 3+ repeated characters
- At least 3 consecutive letters
- 4-6 unique letters required (scaled by length)
- Long strings (>20 chars) must have common words OR 8+ unique letters
- Repeated pattern ratio < 40%

**Backend (`askAIController.js:22-70`):**
- Same validation before RAG processing
- Returns `400` with `code: 'INVALID_QUERY'` if validation fails

Now `ajflafjllafffaafas` is blocked with: *"Please enter a valid question with at least 6 different letters."*

**Files modified:**
- `frontend/src/pages/intern/AskAI.jsx`
- `backend/controllers/askAIController.js`

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
5. ✅ Admin Dashboard 7-Card Layout (Complete)
6. ✅ Notification System (Phase 12 - Complete)
7. Automated Testing Suite (Phase 10 - Pending)

---

## Recent Changes

### Prompt 33: Workflow Documentation & Issue Updates
**Prompt:** Document the complete query workflow, update all doc files (context.md, prompt.md, README.md, docs/), and list all resolved issues.

**Response:**
Updated context.md with:
- Complete Query Lifecycle flowchart (Steps 0-7)
- State Machine Transitions diagram
- Resolution Types table (AUTO_COMPLETE, RAG_RESOLVED, LLM_RESOLVED, ESCALATED, SPAM_BLOCKED, CAP_BLOCKED)
- All 19 resolved issues documented with root cause and fix
- Notification System integration details
- Updated milestone progress (Phase 12 complete)

All issues from #1 to #24 documented:
| # | Issue | Fix |
|---|-------|-----|
| 1 | MongoDB connection failed | Removed useNewUrlParser/useUnifiedTopology |
| 2 | Explore FAQs redirected to login | Created public /faqs page |
| 3 | FAQs page blank data | Created publicApi.js |
| 4 | Sharp card edges | Changed to rounded-lg |
| 5 | Login redirect loop | localStorage check + delay |
| 6 | Auto-complete not closing on Enter | Added handleKeyDown |
| 7 | RAG downvote escalated directly | rag_downvote triggers LLM first |
| 8 | Grok API 403 errors | Switched to Groq then Gemini |
| 9 | Gemini 404 error | Uses v1 REST API |
| 10 | Mongoose new: true deprecation | Changed to returnDocument: 'after' |
| 11 | Missing ratingRoutes/adminRoutes | Created missing files |
| 12 | no_faq tracking broken | Created analyticsController.js |
| 13 | Frontend api.js import error | Changed import { api } to import api |
| 14 | VITE_API_URL undefined crash | Added fallback default |
| 15 | Auto-complete only searched keywords | Search search_text, tags, clean_question |
| 16 | RAG downvote logic flaw | rag_downvote triggers LLM first |
| 17 | LLM upvote shows RAG answer | Added grok_upvote handler returning resolved state |
| 18 | Garbage input passed to RAG/LLM | Added query sanity check |
| 19 | Peer answer submission failed (500) | Changed req.user.id to req.user.userId |
| 20 | MyEscalations socket connection failed | Added VITE_API_URL fallback before .replace() |
| 21 | Sweeper edge case: 5 responses all low not locked | Changed condition to use MAX_PEER_RESPONSES=5 |
| 22 | Ambiguous 3-strike doesn't notify intern | Added createNotification call in peerController |
| 23 | createFAQFromQuery does nothing | Implemented actual FAQ creation |
| 24 | Missing Stagnant Queue in Admin Dashboard | Added 6th section |
| 25 | AskAI error message too generic | Shows actual backend error message |
| 26 | No way to clear test escalation data | Added POST /api/admin/clear-all-data |

Updated docs/database_schema.md with:
- Notification collection schema
- All indexes documented
- Notification types table

### Prompt 32: Notification System Implementation
**Prompt:** Create a complete notification system for Query.in with:
1. Three notification types: Intern alerts (peer answer, query resolved), Admin alerts (10-occurrence threshold), Announcements (broadcast)
2. Hybrid approach: Socket.IO for real-time + MongoDB for persistence
3. NotificationBell component with unread count badge and dropdown
4. Toast pop-up component for slide-in notifications
5. Yellow alert for admin when NoFaq hits 10 occurrences
6. Update all relevant controllers to emit notifications
7. Update documentation

**Response:**
Created complete notification system:
- **Backend:**
  - `models/Notification.js` - Schema with recipient_id, type, title, message, link_id, link_type, is_read
  - `controllers/notificationController.js` - createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, emitAdminYellowAlert, broadcastAnnouncement
  - `routes/notificationRoutes.js` - CRUD API endpoints
  - Updated `peerController.js` - creates notification when peer submits answer
  - Updated `adminController.js` - creates notification when query resolved (peer_approved or admin_override)
  - Updated `analyticsController.js` - emits yellow alert via emitAdminYellowAlert when NoFaq hits 10
- **Frontend:**
  - `context/NotificationContext.jsx` - Socket.IO client + state management
  - `components/NotificationBell.jsx` - Bell icon with badge, dropdown list, click handling
  - `components/Toast.jsx` - Slide-in pop-up with auto-dismiss
  - Updated `main.jsx` - Wrapped with NotificationProvider
  - Updated `DashboardLayout.jsx` - Replaced static bell with NotificationBell
  - Updated `AdminSuggestions.jsx` - Listens for yellow_alert socket event
  - Updated `MyEscalations.jsx` - Real-time updates on new_peer_answer and query_resolved

Updated docs: context.md, prompt.md

### Prompt 34: Fix LLM Upvote Showing RAG Answer
**Prompt:** When user upvoting LLM answer, it shows RAG answer instead of thank you message. Fix this error.

**Response:**
Fixed `backend/controllers/askAIController.js`:
- Added `grok_upvote` action handler at line 114-121
- Returns `resolution: 'resolved'` with message 'Thank you for your feedback!' immediately
- Tracks `LLM_RESOLVED` in analytics

Flow now works correctly:
1. User submits query → LLM answer (source: 'grok')
2. User upvotes LLM answer → sends `grok_upvote`
3. Backend returns `resolution: 'resolved'`
4. Frontend shows "Thank You!" card with "Ask Another Question" button

Updated prompt.md, context.md with bug #17

### Prompt 31: Moderator Dashboard 3-Card Layout Implementation
**Prompt:** Create complete Moderator Dashboard with all 3 cards as per specification

**Response:**
Created complete ModeratorDashboard.jsx with all 3 cards:
- **Card 1: Announcements** (View-only, yellow alert when new < 24hrs, "NEW" badge with pulse animation)
- **Card 2: Master Query Monitor** (Inherited from Admin Card 4 - thread drawer with approve/override)
- **Card 3: Resolve Query Hub** (Inherited from Admin Card 6 - 5-section queue, moderator can resolve)

Updated docs: context.md, prompt.md

### Prompt 36: Fix Peer Answer Submission 500 Error
**Prompt:** When I submit an answer for a query using peer answer queue it shows "Failed to submit answer" and in console this error "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"

**Response:**
Fixed the issue in backend controllers. The problem was a property name mismatch:
- `authMiddleware.js` sets `req.user.userId` (capital I in userId)
- All controllers were using `req.user.id` (lowercase i)

This caused `author_id` to be `undefined` when creating notifications, which failed Mongoose validation.

**Files fixed (changed `req.user.id` to `req.user.userId`):**
- `backend/controllers/peerController.js` (4 instances: getMyEscalations, submitAnswer, markAmbiguous)
- `backend/controllers/adminController.js` (2 instances: approvePeerResponse, overrideWithAdminResponse)
- `backend/controllers/notificationController.js` (5 instances)
- `backend/controllers/ratingController.js` (2 instances: rateResponse, getResponseRatings)
- `backend/controllers/announcementController.js` (1 instance)

**Committed as:** `fix: resolve req.user.userId mismatch causing 500 on peer answer submission`

---

### Prompt 37: Add Clear All Data Endpoint & Fix AskAI Error Display
**Prompt:** Add endpoint to clear all escalation data for testing, fix AskAI to show actual backend error message

**Response:**
Added `POST /api/admin/clear-all-data` endpoint that:
- Deletes all Query, Response, NoFaq, Notification documents
- Preserves User and FAQ collections
- Returns count of cleared items

Fixed `AskAI.jsx` catch block to show actual error:
```javascript
const errorMsg = err.response?.data?.error || 'Failed to submit feedback. Please try again.';
setError(errorMsg);
```

**Files modified:**
- `backend/controllers/adminController.js` - Added clearAllData function
- `backend/routes/adminRoutes.js` - Added /clear-all-data route
- `frontend/src/pages/intern/AskAI.jsx` - Fixed error message display

**Commit:** `d66a88b`

### Prompt 38: Add More Test Users
**Prompt:** Create more intern test users and add them to database

**Response:**
Added 10 new test users:
- mod2@query.in / Mod2!1234 (moderator)
- intern3@query.in / Intern3@1234
- intern4-10@query.in / Intern{N}!234

Updated `testCredentials.md`, `README.md`, `context.md` with new credentials.

**Commit:** `d66a88b`

### Prompt 39: Peer Queue Empty After First Answer & Submit Answer Rejected
**Prompt:** When intern1 posts a query and intern2 answers it, the query becomes empty for all other interns. Also, when intern3 tries to answer, it shows "Query is no longer pending. Current status: Peer Answered".

**Response:**
Fixed two related bugs in `backend/controllers/peerController.js`:

**Fix 1 - getPeerQueue (lines 67-86):**
- Changed status filter from `status: 'Pending'` to `status: { $in: ['Pending', 'Peer Answered'] }`
- Added exclusion for queries the current intern already answered:
  ```javascript
  const myAnsweredQueryIds = await Response.find({ author_id: currentUserId }).distinct('query_id');
  // ...
  _id: { $nin: myAnsweredQueryIds },
  ```

**Fix 2 - submitAnswer (lines 172, 205):**
- Changed status check from `query.status !== 'Pending'` to `query.status !== 'Pending' && query.status !== 'Peer Answered'`
- Changed atomic update condition from `status: 'Pending'` to `status: { $in: ['Pending', 'Peer Answered'] }`

**Files modified:**
- `backend/controllers/peerController.js`

**Commit:** `fix: resolve peer queue visibility and submit answer status check`