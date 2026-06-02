# Query.in - Prompt History & Project Summary

## Project Overview
**Query.in** is a MERN stack crowd-sourced FAQ generation and P2P query resolution platform.
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API
- **Design:** Strict Black (#000000) & White (#FFFFFF) theme with Yellow (#FFD000) highlight, rounded-xl corners, soft shadows, modern SaaS aesthetic

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
| 34 | Peer queue empty after first answer | getPeerQueue only queried status: 'Pending' | Changed to query status: { $in: ['Pending', 'Peer Answered'] } |
| 35 | Intern who answered sees own response in queue | No filter to exclude queries user already answered | Added query_id exclusion for current user's answered queries |
| 36 | Submit answer rejected for Peer Answered status | Atomic update condition only matched status: 'Pending' | Changed to status: { $in: ['Pending', 'Peer Answered'] } |
| 37 | Notifications not stored before client response | createNotification called after res.json() without await | Moved await createNotification before res.json() in all controllers |
| 38 | MyEscalations - Rating UI issues | "Rate this response" shows incorrectly, user can rate multiple times | Fixed: "Rate this response" button only shows if rating === null, added rater_note field, one-time rating enforcement |
| 39 | 4-star rating locks query immediately | Query should stay open on 4-star, only 5-star locks | Changed MIN_HIGH_RATING from 4 to 5 for locking; 4 stars = Highly-Rated Queue (not locked) |
| 40 | Ambiguous marked query still visible in peer queue | getPeerQueue only excluded answered queries, not ambiguous-marked | Added ambiguous_marked_by filter to exclude queries user marked ambiguous |
| 41 | 3-strike ambiguous query shows "Pending" status on MyEscalations | markAmbiguous sent notification but no socket event to refresh frontend | Added `query_resolved` socket emit when query becomes Ambiguous |
| 42 | Approved queries still visible in High Rated/Ambiguous pages | Pages queried same data but didn't filter resolved queries | High Rated and Ambiguous now part of Resolve Hub "Pending Resolution" section |
| 43 | Approve/Override doesn't remove query from admin view | No page refresh after action | Added `window.location.reload()` after approve/override |
| 44 | MyEscalations shows "Resolved" instead of "Approved" | No distinction between resolution types | Shows "Approved" badge when `resolution_type === 'peer_approved'` |
| 45 | High Rated card shown separately in Admin dashboard | Redundant with Resolve Hub | Removed separate High Rated card from Admin/Moderator Overview |
| 46 | No warning system for intern misuse | No way to warn or disable misbehaving users | Added warning_count and is_disabled to User model, warnIntern endpoint, intern_warning notification, Spoiled Users page |
| 47 | Failed to send warning (500 error) | Notification model enum missing 'intern_warning' type | Added 'intern_warning' to Notification type enum |
| 48 | MyEscalations shows "Resolved" instead of "Approved" | Only peer_approved showed "Approved", admin_override showed "Resolved" | Changed to show "Approved" for ALL resolved queries regardless of resolution_type |
| 49 | Sidebar shows only current page nav items | Each page defined its own navItems subset | Created centralized navConfig.jsx, DashboardLayout auto-detects nav items by user role |
| 50 | Intern dashboard stats incorrect | Active queries showed all queries not just user's, peer responses included skipped/ambiguous | Created GET /api/peer/stats endpoint with accurate counts, Active Queries and Resolved cards now link to My Escalations |
| 51 | Ask AI page input limitations | Single-line input couldn't handle multiline questions; "Get Answer" button separate from input | Replaced input with textarea (Shift+Enter for new line, Enter to submit), replaced bulb icon with send button (right arrow) on input bar |
| 52 | Auto-complete suggestions dropdown stays open on Enter | handleKeyDown didn't close suggestions when Enter was pressed | Added setShowSuggestions(false) and setSuggestions([]) in handleKeyDown, added e.stopPropagation() |
| 53 | Thumbs up/down icons improper on Ask AI page | Old SVG paths were broken/not proper | Replaced with clean, proper thumbs up/down Material Design icons |
| 54 | Browse FAQs button not properly styled | Button had border-white making it invisible on black background | Changed to variant="secondary" with proper black border |
| 55 | Question mark icon not centered in Explore FAQs card | Icon was slightly off-center visually | Adjusted icon size to w-12 h-12, reduced strokeWidth to 1.75, proper viewBox alignment |
| 56 | Ask AI and Browse FAQs buttons lacked hover effect | No visual feedback on mouse hover | Added hover:scale-105 transition-transform for tactile feedback |
| 57 | Multiple pages lacked hover effects | Cards, buttons, and inputs felt static | Added hover effects across pages - scale, shadow, and background transitions |
| 58 | Read-only stars shown when not rated yet | View-only stars displayed for unrated responses | Wrapped read-only stars in `response.rating !== null` condition |
| 59 | Suggestions dropdown stays open after submit | Debounced search could fire after submit | Added cancelDebounce() to clear pending timeout on submit |
| 60 | Escalated/Resolved cards had yellow checkmark and button | Color scheme inconsistent with success state | Changed to green checkmark (bg-green-500) and black button (variant="primary") |
| 61 | Star ratings and status badges had inconsistent colors | text-yellow-600 hardcoded, no color-coded status | Changed to text-yellow-500, added pending (blue) and peer (yellow) badge variants |
| 62 | Separate User Registration, User Management, and Spoiled Users pages | Three different pages for related functionality | Combined into single AdminUserManagement page with registration accordion, user table with warnings column, and 3-dot menu for active/inactive toggle |
| 63 | Pending Resolution showed all responses | Low-rated responses (1-3★) were visible in Pending Resolution section | Filter to show only 4-5★ responses in Pending Resolution, sorted 5★ first |
| 64 | Low-Rated queue showed mixed queries | Queries with some high ratings were shown in Low-Rated queue | Low-Rated now shows only queries with ALL responses rated 1-3★, responses sorted descending with Approve button |
| 65 | "Stagnant" category misleading name and criteria | Named "Stagnant (0 answers)" but new criteria is different | Renamed to "Stagnant (Locked, 24h+)", now requires 1-4 low-rated responses (1-3★) AND 24+ hours old |
| 66 | "Unanswered" category redundant | Unanswered and Stagnant were overlapping/confusing | Removed "Unanswered" category |
| 67 | Archive section showed all responses | When viewing resolved queries in Archive, all responses were shown instead of just approved | Filter Archive section to only show `approval === true` response |
| 68 | "Add to FAQ Database" too basic | Simple confirm() dialog didn't allow customization of tags, keywords, priority, category | Replaced with full modal form with category dropdown, tags, keywords, priority fields |
| 69 | Category dropdown hardcoded | Category list was hardcoded in frontend instead of using existing database categories | Added GET /api/faqs/categories endpoint, dropdown dynamically populated from database |
| 70 | Moderator couldn't suggest archived queries for FAQ | No way for moderator to suggest useful queries from Archive for FAQ database | Added "Suggest for FAQ Database" button in Moderator Resolve Hub Archive section; Admin sees suggestions in "Moderator Suggested" section with "Add to FAQ" and "Dismiss" options |
| 71 | Missing closing div in AdminResolveHub | `vite` server threw `[PARSE_ERROR] Unexpected token` in `AdminResolveHub.jsx` | Fixed missing `</div>` tag |
| 72 | Ngrok CORS blocked by backend | Non-localhost ngrok origins were blocked | Updated `cors` config with `origin: true` |
| 73 | Ngrok free tier browser warning | Free tier ngrok requires a specific header | Added `ngrok-skip-browser-warning: true` header in `api.js` and `publicApi.js` |
| 74 | Vite blocking ngrok hosts | `Invalid Host header` from Vite when accessed via ngrok | Added `server.allowedHosts: true` to `vite.config.js` |
| 75 | Show password toggle missing | No way to see password while typing | Added show/hide password toggle with eye icons on Landing page login form |
| 76 | Login page refreshes on wrong password | 401 interceptor redirected to /login on all 401 errors including login attempts | Modified api.js to skip redirect when URL contains `/auth/login` |
| 77 | Demo credentials visible on login card | Security risk - credentials shown publicly | Removed demo credentials section from Landing page login card |
| 78 | Login card missing border | Explore FAQs card had border but Login card didn't | Added `border border-gray-200` to Login card for consistency |
| 79 | Moderator response shown as "Admin" in intern's MyEscalations | Backend didn't populate resolved_by for admin/moderator approval | Added populate('resolved_by', 'email role') in getMyEscalations; Response badges now show Admin/Moderator Approved vs Override based on approval flag and resolved_by.role |
| 80 | Duplicate "Approved" badge on responses | Redundant badge showing for approved responses | Removed duplicate badge; first badge now correctly shows "Admin Approved", "Moderator Approved", or "Admin/Moderator Override" |
| 81 | Database schema not updated with response approval states | Missing documentation for response approval states | Added Response Type & Approval States table in database_schema.md |
| 82 | peer_note not visible in AdminResolveHub | Response detail panel didn't show internal note | Added peer_note display in AdminResolveHub.jsx with "Peer Note:" label |
| 83 | Announcement priority missing | No way to set urgency level for announcements | Added priority field (low/medium/high) with color coding: dark green/yellow/red |
| 84 | Admin dropdown included Admin role | Only one admin should exist per application | Removed Admin option from role dropdown in user registration page |
| 85 | Moderator suggestion didn't show sender | Admin couldn't see which moderator suggested FAQ | Added "From: {email} ({role})" display in moderator suggestion header and response section |
| 86 | rater_note not visible in admin query views | Admin couldn't see intern's review note when approving responses | Added "Author's Review Note:" display with blue styling in all admin/moderator query detail views |
| 87 | Moderator Suggested list missing "From" field | Admin couldn't identify moderator from query list, only in detail panel | Added "From: {email} ({role})" display in query list items, shows question_text instead of suggestion text, role badge instead of response count |
| 88 | Query Monitor still in moderator dashboard | Query Monitor route and card still existed after removal attempt | Completely removed Query Monitor: deleted ModeratorQueries component, route, nav card, and overview card |
| 89 | Stagnant queries with 0 responses not appearing in Stagnant tab | Stagnant filter excluded queries with 0 responses (required responses.length >= 1 and all low-rated) | Fixed filter to handle 0 responses case: if no responses and 24+ hours old, query is stagnant |
| 90 | Similar query blocking doesn't notify interested interns | When intern A's similar query is blocked, they aren't notified when intern B's query is resolved | Added SimilarQueryInterest model, track interests on block, create shadow query and notify when original query is resolved |
| 91 | Announcements page not dynamic | Announcements page only fetched on mount, didn't show new announcements without refresh | Added Socket.IO listener for 'new_notification' events with type 'announcement', new announcements prepend to list |
| 92 | Moderator suggested query not removed after FAQ creation | After adding moderator suggestion to FAQ database, it remained in "Moderator Suggested" list | Backend now updates ModeratorFaqSuggestion status to 'approved' after FAQ creation; frontend removes suggestion from list after successful FAQ creation |

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
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 71: Moderator FAQ Suggestion Workflow
**Prompt:** On the admin dashboard, remove the "Query Monitor" and "Ambiguous queries" also remove them from the page navigation from the left side. Change name of "Resolve Hub" to "Query Management" and update the description accordingly making it easy for the user to understand that all query related things are managed from here. also fix the logo of "User Management" card as it is not correct. The moderator can not query from the "Archive" Category into the faq database, instead add a button for the moderator by which it can suggest the admin for queries in the "Archive" category which should be added to the faq database. in the admin's resolve hub, add a new category as "Moderator Suggested" which shows the suggested query which should be added to the Faq databse with the a button "Add to FAQ database" for the admin along with all the options for adding a query (category,tags, etc.)

**Response:**
Implemented complete Moderator FAQ Suggestion workflow:

1. **Created Backend Model:**
   - `backend/models/ModeratorFaqSuggestion.js` - Tracks moderator FAQ suggestions with query_id, suggested_by, question_text, suggested_answer, status (pending/approved/dismissed)

2. **Added Backend Endpoints:**
   - `POST /admin/suggest-faq` (moderator only) - Submit suggestion for archived query
   - `GET /admin/moderator-suggestions` (admin only) - Get pending suggestions
   - `PATCH /admin/moderator-suggestions/:id/dismiss` (admin only) - Dismiss suggestion

3. **Updated AdminResolveHub.jsx:**
   - Removed "Query Monitor" and "Ambiguous Queries" cards from overview
   - Renamed "Resolve Hub" → "Query Management"
   - Added "Moderator Suggested" section in Query Management
   - Shows pending suggestions with "Add to FAQ" button (opens full FAQ creation modal) and "Dismiss" button

4. **Updated ModeratorResolveHub.jsx:**
   - In Archive section, added "Suggest for FAQ Database" button
   - Opens modal showing query and approved response
   - Submits suggestion for admin review

5. **Updated navConfig.jsx:**
   - Removed Query Monitor and Ambiguous from admin sidebar
   - Renamed "Resolve Hub" to "Query Management"

6. **Updated AdminOverview.jsx:**
   - Removed Query Monitor and Ambiguous Queries cards
   - Updated "Resolve Hub" card to "Query Management" with new description
   - Fixed User Management logo (now uses settings/management icon)

**Files modified:**
- `backend/models/ModeratorFaqSuggestion.js` (new)
- `backend/controllers/adminController.js` - Added suggestFaqFromQuery, getModeratorSuggestions, dismissModeratorSuggestion
- `backend/routes/adminRoutes.js` - Added new routes
- `frontend/src/pages/admin/AdminOverview.jsx` - Removed cards, renamed, fixed logo
- `frontend/src/pages/admin/AdminResolveHub.jsx` - Added Moderator Suggested section
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx` - Added Suggest for FAQ button
- `frontend/src/utils/navConfig.jsx` - Updated admin nav items
- `docs/architecture.md`, `docs/database_schema.md`, `docs/api_docs.md`, `docs/FEATURES.md`, `context.md` - Updated documentation

---

## Next Actions (Pending)
1. ✅ Build AI FAQ Suggestion Engine (Phase 8 - Complete)
2. ✅ Implement Realtime Notifications & Queue System (Phase 9 - Complete)
3. ✅ Documentation Engine (Phase 11 - Complete)
4. ✅ LLM Improvements & Groq Integration (Complete)
5. ✅ Admin Dashboard 7-Card Layout (Complete)
6. ✅ Notification System (Phase 12 - Complete)
7. ✅ Backend Performance & Correctness Fixes (Phase 13 - Complete)
8. 🟡 UI/UX Modernization (Phase 14 - In Progress)
9. Automated Testing Suite (Phase 10 - Pending)

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

### Prompt 40: Consolidate High Rated and Ambiguous into Resolve Hub
**Prompt:** High-rated queries (4-5 stars) and ambiguous queries (3-strike) should be resolved through the Resolve Hub, not separate pages. Consolidate them into a "Pending Resolution" section in Resolve Hub.

**Response:**
Updated AdminResolveHub.jsx and ModeratorResolveHub.jsx:
- Renamed "Master Queue" to "Pending Resolution"
- Pending Resolution now filters: `is_locked: true AND (has rating >= 4 OR status === 'Ambiguous')`
- Removed High Rated card from AdminOverview.jsx and ModeratorOverview.jsx
- Added `window.location.reload()` after approve/override actions

**Files modified:**
- frontend/src/pages/admin/AdminResolveHub.jsx
- frontend/src/pages/admin/AdminOverview.jsx
- frontend/src/pages/moderator/ModeratorResolveHub.jsx
- frontend/src/pages/moderator/ModeratorOverview.jsx

### Prompt 41: MyEscalations Shows "Resolved" Instead of "Approved"
**Prompt:** When admin approves a peer response, MyEscalations shows "Resolved" badge but should show "Approved" to distinguish peer_approved resolution from admin_override.

**Response:**
Updated getStatusBadge() in MyEscalations.jsx:
```javascript
if (query.resolution_type === 'peer_approved') {
  return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
}
```

**Files modified:**
- frontend/src/pages/intern/MyEscalations.jsx

### Prompt 42: Update Documentation for Resolve Hub Changes
**Prompt:** Update all documentation files (context.md, prompt.md, docs/, README.md) to reflect the new 5-section Resolve Hub structure with Pending Resolution section.

**Response:**
Updated:
- docs/architecture.md - 5-section table
- docs/FEATURES.md - Admin/Moderator dashboard layouts
- docs/database_schema.md - Queue definitions
- README.md - Admin Resolution Hub section
- context.md - Admin Dashboard cards, pages, and resolved issues table
- prompt.md - Added prompts 40-41

**Commit:** `docs: update Resolve Hub structure documentation`

### Prompt 43: Git Commit All Changes
**Prompt:** Commit all changes made to admin/moderator resolve workflow and documentation.

**Response:**
Staged and committed all modified files:
- frontend/src/pages/admin/AdminResolveHub.jsx
- frontend/src/pages/admin/AdminOverview.jsx
- frontend/src/pages/moderator/ModeratorResolveHub.jsx
- frontend/src/pages/moderator/ModeratorOverview.jsx
- frontend/src/pages/intern/MyEscalations.jsx
- docs/architecture.md
- docs/FEATURES.md
- docs/database_schema.md
- README.md
- context.md
- prompt.md

### Prompt 44: Phase 14 - UI/UX Modernization
**Prompt:** Improve UI/UX of Query.in MERN stack application with modern SaaS-style design. Strictly frontend UI improvements only - no backend changes, API routes, database schemas, or business logic. Black and white colors only, yellow (#FFD000) for highlighting.

**Response:**
Modernized the entire frontend with a professional SaaS aesthetic:

**Design System Updates (tailwind.config.js):**
- Colors: Background #FAFAFA, Surface #FFFFFF, Black #000000, Highlight #FFD000
- Shadows: Added shadow-sm through shadow-xl for layered depth
- Border radius: rounded-xl (16px), rounded-lg (12px), rounded-md (8px)
- Typography: text-sm (14px), text-base (16px), text-lg (18px), text-xl (24px)
- Spacing: 8px rhythm with px-4, py-2, py-3, py-4, space-y-4, space-y-6

**Component Updates:**
- Button.jsx: Primary bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-105
- Card.jsx: bg-surface rounded-xl shadow-md border border-gray-100 p-4
- Badge.jsx: text-xs font-medium rounded-full px-2.5 py-1
- DashboardLayout.jsx: Sticky header with backdrop-blur, shadow-sm on header
- Toast.jsx: Slide-in with smooth animation, shadow-lg
- NotificationBell.jsx: Dropdown with max-h-96 overflow-y-auto
- FormattedAnswer.jsx: bg-surface rounded-xl p-4 with shadow-sm

**Page Updates:**
- Landing.jsx: Modern cards with shadow-lg, smooth hover transitions
- FAQs.jsx: Clean accordion with border-gray-200
- InternDashboard.jsx: Dashboard layout with stat cards, activity feed
- AskAI.jsx: Clean input styling, rounded-xl buttons
- ViewFAQs.jsx: Clean category headers, hover:bg-gray-50
- MyEscalations.jsx: Clean query cards with proper spacing
- PeerQueue.jsx: Clean answer cards with hover transitions
- Announcements.jsx: Clean layout with time-ago formatting

**Design Principles Applied:**
- Strictly black (#000000), white (#FFFFFF), and yellow (#FFD000)
- Rounded-xl corners throughout (16px)
- Soft, layered shadows for depth
- Subtle borders (border-gray-100)
- Smooth hover transitions (duration-200)
- Professional 8px spacing rhythm

**4 Commits on ui-update branch:** e5a7a83, 15f3195, a205ad7, 0e5de37

### Prompt 45: UI Fixes - Cursor, Icons, Stars, Borders, FAQ Navigation
**Prompt:** Fix multiple UI issues: text cursor appearing on click, vague thumbs up icon, gold rating stars, hide keywords in Popular FAQs, static browse FAQ button, question mark logo alignment.

**Response:**
Fixed multiple UI issues:

**1. Text Cursor on Click (index.css):**
- Added global `user-select: none` to prevent text cursor on click
- Input fields explicitly allowed to select text

**2. Thumbs Up Icon (AskAI.jsx):**
- Increased icon size from w-4 h-4 to w-5 h-5
- Added explicit strokeWidth={2} for clearer visibility

**3. Gold Rating Stars (MyEscalations.jsx):**
- Changed rating stars from `text-highlight` to `text-[#FFD700]` (gold)
- Applied to both displayed and interactive stars

**4. Keywords Hidden in Popular FAQs (InternDashboard.jsx):**
- Removed {faq.category} from Popular FAQs list
- Search in ViewFAQs already includes tags/keywords

**5. Static "View all FAQs" Link (InternDashboard.jsx):**
- Added background bg-gray-100 and padding to make always visible
- Added flex-shrink-0 to prevent compression

**6. Question Mark Logo Alignment (Landing.jsx):**
- Replaced problematic SVG path with cleaner help-circle icon
- Increased icon size to w-12 h-12
- Added flex-shrink-0 to prevent scaling

**7. All Notifications Page (AllNotifications.jsx, App.jsx):**
- Created new page at /notifications
- Shows all notifications with mark as read, delete, pagination
- Red icons/badges for warning/alert types

**8. Red Warnings (MyEscalations.jsx, Toast.jsx, Badge.jsx):**
- Warning banner uses red colors (bg-red-50, border-l-red-600, text-red-700)
- Toast uses red for intern_warning type
- Badge has new errorFilled variant

**6 Commits on ui-update branch:** e5a7a83, 15f3195, a205ad7, 0e5de37, 6302866, f5e75c8

### Prompt 46: Fix Sidebar Navigation - All Cards Visible on Every Page
**Prompt:** On the dashboard of every user, whenever a card apart from "Dashboard" is clicked, the new card opens and all the other cards available to the user are removed from the left side (which shows all the cards for a user). Suppose I click "Announcements" card as an intern, then it opens the announcement page and shows only the dashboard and announcement card in the left side. Fix it so that upon clicking any card, all the cards are visible and upon clicking them I should be rerouted to that particular page.

**Response:**
Created centralized navigation configuration to fix the sidebar issue:

1. **Created `frontend/src/utils/navConfig.jsx`** with centralized nav items for all roles:
   - `internNavItems` (6 items): Dashboard, Announcements, View FAQs, Ask AI, My Escalations, Peer Answer Queue
   - `moderatorNavItems` (3 items): Dashboard, Query Monitor, Resolve Hub
   - `adminNavItems` (10 items): Dashboard, User Management, Announcements, Query Monitor, FAQ Editor, Ambiguous, Resolve Hub, AI Suggestions, User Registration, Spoiled Users
   - `getNavItemsByRole(role)` function to get nav items by role

2. **Updated `DashboardLayout.jsx`:**
   - Now imports `getNavItemsByRole` from navConfig
   - Accepts optional `navItems` prop for override, defaults to auto-detect based on `user?.role`
   - Line: `const navItems = propNavItems || getNavItemsByRole(user?.role);`

3. **Updated all 25 dashboard pages** (removed local navItems arrays and prop passing):
   - Intern pages (7): InternDashboard, Announcements, ViewFAQs, AskAI, MyEscalations, PeerQueue, AllNotifications
   - Moderator pages (6): ModeratorOverview, ModeratorQueries, ModeratorHighRated, ModeratorAmbiguous, ModeratorResolveHub, ModeratorDashboard
   - Admin pages (12): AdminOverview, AdminUsers, AdminAnnouncement, AdminQueries, AdminFaqEditor, AdminAmbiguous, AdminResolveHub, AdminSuggestions, AdminRegistration, AdminSpoiledUsers, AdminHighRated, AdminDashboard

4. **Documentation updated:**
   - `docs/architecture.md` - Added navConfig.jsx to utils directory
   - `README.md` - Added issue #49 to Recent Fixes table
   - `context.md` - Added issue #49 to Resolved Issues table and navConfig.jsx to Project Structure

**Commit:** `be258f1` - fix: centralized navigation with navConfig.jsx - all sidebar cards visible on every page

### Prompt 47: Fix Intern Dashboard Stats and Add Navigation Links
**Prompt:** On the intern dashboard, in the "Active queries" card, only the number of pending queries of that particular user should be displayed, in the "Peer Responses" card, it should only display the number of times the user has answered a particular query of a peer, it should not include skipped question or mark as ambiguous questions. The "Resolved" card should display the number of queries for an intern which has been successfully approved by the admin. And upon clicking the "Active queries" card and "Resolved" card, it should be redirected to the "My Escalations" page.

**Response:**
Created a new backend endpoint and updated the frontend to show accurate stats:

1. **Backend: New `GET /api/peer/stats` endpoint:**
   - `getInternStats` function in `peerController.js`:
     - `activeQueries`: Count of user's queries where status is NOT 'Resolved' or 'Ambiguous'
     - `peerResponses`: Count of Response documents where `author_id` = user AND `response_type` = 'peer'
     - `resolved`: Count of user's queries where `status` = 'Resolved'
   - Added route `GET /api/peer/stats` in `peerRoutes.js`

2. **Frontend `InternDashboard.jsx`:**
   - Updated `fetchData` to call `api.get('/peer/stats')` instead of `api.get('/queries?limit=0')`
   - Wrapped "Active Queries" card in `<Link to="/intern/my-queries">`
   - Wrapped "Resolved" card in `<Link to="/intern/my-queries">`
   - Converted all `<a href>` to React Router `<Link to>` for consistency

3. **Documentation updated:**
   - `README.md` - Added issue #50 to Recent Fixes table
   - `context.md` - Added issue #50 to Resolved Issues
   - `docs/api_docs.md` - Added GET /peer/stats API documentation

**Commit:** `f9b70c4` - fix: Intern dashboard stats now accurate with new /api/peer/stats endpoint

---

### Prompt 48: Ask AI Page Input Improvements
**Prompt:** In the "Ask AI" page, replace the single-line input with a textarea for multiline support (Shift+Enter for new line), remove the "Get Answer" button and replace the bulb logo with a send button (right arrow) positioned at the rightmost part of the input bar. Also ensure pressing Enter closes suggestions dropdown AND submits the query in one action.

**Response:**
Updated `frontend/src/pages/intern/AskAI.jsx`:

1. **Textarea with multiline support:**
   - Replaced `<input type="text">` with `<textarea>`
   - Auto-resizing textarea with `onInput` handler (min-h: 52px, max-h: 160px)
   - Placeholder updated: "How do I submit my NOC? What is the process for... (Shift+Enter for new line)"

2. **Send button replaces bulb icon:**
   - Removed bulb icon (lightbulb SVG)
   - Added black rounded send button with right-pointing arrow icon
   - Positioned absolutely on the right side of the textarea
   - Submit disabled when query is empty, loading, or already resolved/escalated

3. **Shift+Enter for new line:**
   - `handleKeyDown` checks `e.shiftKey` - if true, returns early (allows default behavior)
   - Enter without Shift submits the query

4. **Single Enter to close suggestions AND submit:**
   - `handleKeyDown` now always closes suggestions dropdown and clears suggestions
   - If `query.trim()` exists, calls `handleSubmit(e)` immediately
   - Removed separate "Get Answer" button - submission via Enter or send button

**Files modified:**
- `frontend/src/pages/intern/AskAI.jsx`

---

### Prompt 49: Documentation Update for Ask AI Improvements
**Prompt:** Update all documentation files (context.md, prompt.md) to reflect the Ask AI page improvements (issue #51).

**Response:**
Updated `context.md`:
- Added issue #51 to Resolved Issues table: "Ask AI page input limitations | Single-line input couldn't handle multiline questions; 'Get Answer' button separate from input | Replaced input with textarea (Shift+Enter for new line, Enter to submit), replaced bulb icon with send button (right arrow) on input bar"

Updated `prompt.md`:
- Added Prompt 48 documenting the Ask AI page improvements
- Added Prompt 49 documenting the documentation update

**Commit:** `1935765` - fix: autocomplete suggestions dropdown now closes on Enter key - added setShowSuggestions(false) and setSuggestions([]) in handleKeyDown

---

### Prompt 51: Fix Auto-complete Suggestions Dropdown Not Closing on Enter
**Prompt:** On hitting Enter, the suggestion window remains open but it should close. The Enter should work the same as clicking on arrow button to submit.

**Response:**
Updated `handleKeyDown` in `frontend/src/pages/intern/AskAI.jsx`:

```javascript
// Before: handleKeyDown didn't close suggestions
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      return;  // Allow Shift+Enter for newlines
    }
    e.preventDefault();
    // Missing: setShowSuggestions(false) and setSuggestions([])
    if (query.trim()) {
      handleSubmit(e);
    }
  }
};

// After: handleKeyDown properly closes suggestions
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.stopPropagation();
    setShowSuggestions(false);
    setSuggestions([]);
    if (query.trim()) {
      handleSubmit(e);
    }
  }
};
```

**Changes made:**
1. Added `setShowSuggestions(false)` and `setSuggestions([])` to close the dropdown
2. Added `e.stopPropagation()` to prevent event bubbling
3. Simplified the condition (removed redundant `e.key === 'Enter'` check inside)
4. Removed the `if (e.shiftKey) { return; }` early-return since we now properly handle all Enter cases

**Files modified:**
- `frontend/src/pages/intern/AskAI.jsx`

---

### Prompt 52: Update Documentation and Commit All Changes
**Prompt:** Update all doc folder files including readme, context.md and prompt.md. Also commit all changes and share all git commit history branch wise.

**Response:**
Staged and committed:
- `frontend/src/pages/intern/AskAI.jsx`
- `context.md`
- `prompt.md`

**Commit:** `[current]` - fix: Ask AI page input improvements - textarea, send button, Shift+Enter multiline, single Enter submit

---

### Prompt 53: Fix Thumbs Up/Down Icons on Ask AI Page
**Prompt:** The thumbs up logo on the "Yes Helpful" button in the Ask AI should be proper. Currently it is not proper.

**Response:**
Updated `AskAI.jsx` with proper Material Design thumbs up/down icons:

```javascript
// Thumbs Up
<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
</svg>

// Thumbs Down
<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
</svg>
```

**Commit:** `7ec19e5` - fix: proper thumbs up/down icons and visible Browse FAQs button

---

### Prompt 54: Fix Browse FAQs Button Visibility on Black Card
**Prompt:** The "Browse FAQ" button at the bottom of the intern dashboard has no border like the "Ask AI" button beside it. Add a proper border so both buttons look symmetric.

**Response:**
Updated `InternDashboard.jsx` - Changed button from:
- `variant="secondary" className="bg-white text-black border-white"` (invisible on black bg)
- To `variant="secondary"` (uses default `border-2 border-black`)

Now both buttons have proper black borders for symmetry.

**Commit:** `634d84b` - fix: Browse FAQs button now has proper black border to match Ask AI button symmetry

---

### Prompt 55: Fix Question Mark Icon Centering on Landing Page
**Prompt:** In the landing page, the FAQ card has a question mark logo that is not properly aligned. Align it properly in the middle of the card with respect to the "Explore FAQs" text.

**Response:**
Updated `Landing.jsx` - Adjusted the question mark icon:
- Changed from `w-10 h-10` to `w-12 h-12` for better proportions
- Reduced `strokeWidth` from `2` to `1.75` for cleaner appearance
- Changed `<line>` to `<path>` element for the dot at bottom for better rendering

**Commit:** `e450f48` - fix: adjust question mark icon size and centering in Explore FAQs card

---

### Prompt 56: Add Hover Effects to Buttons
**Prompt:** Make the "Browse FAQ" button and "Ask AI" button hover or show some effect when mouse cursor comes above it.

**Response:**
Updated `InternDashboard.jsx` - Added `hover:scale-105 transition-transform duration-200` to both buttons. Now they scale up 5% on hover for tactile feedback.

**Commit:** `5dbee9a` - feat: add hover scale effect on Ask AI and Browse FAQs buttons

---

### Prompt 57: Add Hover Effects Across Pages
**Prompt:** Decide on your own make parts of the webpage hover so that it looks good and neat.

**Response:**
Added tasteful hover effects across multiple pages:

| Page | Element | Effect |
|------|---------|--------|
| Landing | Explore FAQs Card | `hover:scale-[1.02]` + icon turns white |
| Landing | Login Form Card | `hover:scale-[1.01]` + deeper shadow |
| Landing | Email/Password Inputs | `hover:border-gray-400` |
| FAQs | Category Accordions | `hover:shadow-md` |
| FAQs | FAQ Items | `hover:bg-gray-100` |
| ViewFAQs | FAQ Items & Category Cards | `hover:shadow-lg`, `hover:bg-gray-100` |
| Announcements | Cards | `hover:shadow-lg hover:scale-[1.01]` |
| PeerQueue | Query Card | `hover:scale-[1.01]` |
| PeerQueue | Answer Form | `hover:shadow-xl` |

**Commit:** `94925da` - feat: add hover effects across pages - scale, shadow, and background transitions for polished UX

---

### Prompt 58: Update Documentation and Commit All Changes
**Prompt:** Update all the doc folder files including readme, context.md and prompt.md. Also commit all changes.

**Response:**
Updated context.md with issues #53-57:
- Issue 53: Thumbs up/down icons improper
- Issue 54: Browse FAQs button visibility
- Issue 55: Question mark icon centering
- Issue 56: Button hover effects missing
- Issue 57: Multiple pages lacked hover effects

Updated prompt.md with Prompts 53-58 documenting all recent fixes.

**Commit:** `4b46ff2` - docs: update context.md and prompt.md with recent UI fixes (#53-57)

---

### Prompt 59: Fix Read-Only Stars Showing Before Rating
**Prompt:** When a user tries to rate the answer to their query reply in "my-queries" page, it shows a View Only stars even if it is not rated by the user yet. Only show those Read Only stars when it is already rated by the user.

**Response:**
Updated `MyEscalations.jsx`:
- Wrapped the read-only stars display section with `{response.rating !== null && (...)}`
- Now stars only appear after user has rated the response
- Before rating, only "Rate this response" button is shown

**Commit:** `ced30b9` - feat: update star ratings to yellow-500 and add color-coded status badges

---

### Prompt 60: Fix Suggestions Dropdown and Escalated/Resolved Card Styling
**Prompt:** On the intern/ask page, when the user tries to submit a query, sometimes even if the RAG answers upon submitting, the suggestions box does not disappear. And upon successful escalation, the checkmark and Ask Another Question button is yellow, instead the checkmark must be green and the button must be black.

**Response:**
Updated `AskAI.jsx`:

**Fix 1 - Suggestions dropdown not closing:**
- Added `debounceRef` to track and cancel pending debounce timeouts
- Added `cancelDebounce()` function that clears the pending timeout
- Called `cancelDebounce()` at the start of `handleSubmit` before setting `showSuggestions(false)`

**Fix 2 - Escalated/Resolved cards styling:**
- Changed from yellow checkmark (`bg-highlight text-black`) to green (`bg-green-500 text-white`)
- Changed from yellow button (`variant="highlight"`) to black (`variant="primary"`)

**Commit:** `58ad762` - fix: suggestions dropdown closes on submit and escalated/resolved cards show green checkmark with black button

---

### Prompt 61: Update Documentation and Commit All Changes
**Prompt:** Update all the doc folder files including readme, context.md and prompt.md. Also commit all changes.

**Response:**
Updated context.md with issues #58-61:
- Issue 58: Read-only stars shown when not rated yet
- Issue 59: Suggestions dropdown stays open after submit
- Issue 60: Escalated/Resolved cards had yellow checkmark and button
- Issue 61: Star ratings and status badges had inconsistent colors

Updated prompt.md with Prompts 59-61 documenting all recent fixes.

**Commit:** `[current]` - docs: update documentation with issues #58-61

---

### Prompt 62: Combine User Registration, User Management, and Spoiled Users Pages
**Prompt:** On the Admin panel, combine User Registration, User Management and Spoiled Users on a single page. Add isActive field to User model, add toggle active/inactive functionality, prevent admin from making themselves inactive.

**Response:**
Combined three separate pages into single `AdminUserManagement.jsx` page:

1. **Backend Changes:**
   - Added `isActive` boolean to User model (default: true)
   - Login now blocks inactive users (403: "Your account has been deactivated")
   - Added `PATCH /api/auth/users/:id/toggle-status` endpoint
   - Admin cannot deactivate themselves or other admins

2. **Frontend Changes:**
   - Created combined `AdminUserManagement.jsx` page with:
     - "Register User" button to show/hide registration accordion
     - Single User form + Bulk JSON upload
     - User table with: Email, Role, Warnings (color-coded), Status, Joined, Actions
     - Warnings shown as badges: green (0-1), yellow (2-3), red (4+)
     - 3-dot menu for Active/Inactive toggle (non-admins only)
     - Filters: role, status (all/active/inactive), sort, search
   - Removed `AdminUserRegistration.jsx` and `AdminSpoiledUsers.jsx`
   - Updated navConfig to remove separate Registration and Spoiled Users links
   - Updated App.jsx routing

**Files modified:**
- backend/models/User.js - Added isActive field
- backend/controllers/authController.js - Block inactive users, added toggleUserStatus
- backend/routes/authRoutes.js - Added toggle-status endpoint
- frontend/src/pages/admin/AdminUserManagement.jsx - New combined page
- frontend/src/utils/navConfig.jsx - Updated admin nav items
- frontend/src/App.jsx - Updated routes

**Commit:** `a08c216` - feat: combine User Registration, Management, and Spoiled Users into single page

---

### Prompt 63: Fix Pending Resolution Response Display
**Prompt:** In the Resolution Hub, in the "Pending Resolution" query drawer only the responses rated 4 stars and 5 stars should be visible for a given query, where the 5 star rated responses will come above the 4 star rates responses. Don't show lower rated responses (1-3 stars) for a query in the "Pending Resolution" category

**Response:**
Updated both `AdminResolveHub.jsx` and `ModeratorResolveHub.jsx`:

1. **Pass activeSection to QueryDetailPanel** - To know which section is active
2. **Filter responses for Pending Resolution** - Only show responses with `rating >= 4`
3. **Sort high-rated responses** - 5 stars first, then 4 stars (descending order)
4. **Update label** - Shows "High-Rated Responses (4-5★)" in pending section

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 64: Fix Low-Rated Queue Display
**Prompt:** In the "Low-Rated" category in the resolve hub, only queries with all the responses as low rated (1-3 stars) should be visible along with all the responses in descending order with "Approve Response" button available for each response so that it can be resolved.

**Response:**
Updated both `AdminResolveHub.jsx` and `ModeratorResolveHub.jsx`:

1. **Fix Low-Rated queue filter** - Changed from `hasLowRatings && length >= 5` to `every(r => r.rating < 4) && length >= 5`
   - Now only shows queries where ALL responses are low-rated (1-3 stars)

2. **Filter responses for Low-Rated section** - Show only `rating < 4` responses
3. **Sort low-rated responses** - 3 stars first, then 2 stars, then 1 star (descending order)
4. **Show Approve button** - Available for low-rated responses so queries can be resolved
5. **Update label** - Shows "Low-Rated Responses (1-3★)" in low-rated section

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 65: Fix Stagnant Category - Rename and Change Criteria
**Prompt:**
1. Change "Stagnant (0 Answers)" category name to "Stagnant (Locked, 24h+)"
2. Remove "Unanswered" category entirely
3. New Stagnant criteria: queries with 1-4 low-rated responses (1-3 stars) AND created >= 24 hours ago

**Response:**
Updated both AdminResolveHub.jsx and ModeratorResolveHub.jsx:

1. **Removed "Unanswered" section** from sections array

2. **Renamed "Stagnant (0 answers)" to "Stagnant (Locked, 24h+)"**

3. **New Stagnant filter logic:**
```javascript
stagnant: queries.filter(q => {
  if (q.status === 'Resolved' || q.status === 'Ambiguous') return false;
  if (!q.responses || q.responses.length === 0) return false;
  if (q.responses.length >= 5) return false;
  const allLowRated = q.responses.every(r => r.rating && r.rating < 4);
  if (!allLowRated) return false;
  const createdAt = new Date(q.createdAt);
  const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation >= 24;
})
```

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 72: Ngrok Configuration & Vite Proxy Fixes
**Prompt:** "give me step to start ngrok server to share this website for testing to otheres", "there is no .env in frontend", "Blocked request. This host is not allowed.", "Failed to load resource: the server responded with a status of 404 ()", "update all the doc folder files including readme, api_doc, database_schema, features, representation, setup, context.md and prompt.md"

**Response:**
Configured the application to support external internet testing via Ngrok tunnels and updated all documentation.

**Fix 1 - AdminResolveHub.jsx Syntax Error:**
- Fixed `[PARSE_ERROR] Unexpected token` caused by a missing closing `</div>` tag in `AdminResolveHub.jsx`.

**Fix 2 - Frontend .env and dynamic API URL:**
- Created `.env` file in frontend.
- Updated `VITE_API_URL` to support dynamic Ngrok URLs instead of hardcoded localhost.
- Updated `api.js` and `publicApi.js` to use `import.meta.env.VITE_API_URL` and added the `ngrok-skip-browser-warning: true` header to bypass the Ngrok warning screen.

**Fix 3 - Backend CORS Policy:**
- Updated `backend/server.js` `cors` configuration to `origin: true` (allows all origins, including Ngrok dynamic hosts) and added `ngrok-skip-browser-warning` to `allowedHeaders`.

**Fix 4 - Vite allowedHosts:**
- Updated `vite.config.js` with `server.allowedHosts: true` to prevent Vite from blocking Ngrok host tunnels.

**Fix 5 - Documentation Updates:**
- Updated all files in `docs/` folder, `README.md`, `context.md`, and `prompt.md` to reflect the Ngrok configuration, 6-section Resolve Hub, and Moderator FAQ Suggestion workflows.

---

### Prompt 75: Add Show Password Toggle to Login Page
**Prompt:** Add show password option in the login page while logging in so that the user can see the password they are entering.

**Response:**
Updated `Landing.jsx`:
1. Added `showPassword` state to toggle visibility
2. Added eye/eye-off icons in password field
3. Toggle button on right side of input
4. Input type switches between `password` and `text`

**Files modified:**
- `frontend/src/pages/Landing.jsx`

---

### Prompt 76: Fix Login Page Refresh on Wrong Password
**Prompt:** it is refreshing every time i enter a wrong password but it should say wrong credentials and then after re entering right it should login

**Response:**
Updated `api.js`:
1. Added check in 401 interceptor to skip redirect for login requests
2. Changed from `window.location.href = '/login'` to only redirect when `!isLoginRoute`
3. Now wrong credentials show error message on same page without refresh
4. Correct credentials login successfully

**Files modified:**
- `frontend/src/utils/api.js`

---

### Prompt 77: Remove Demo Credentials from Login Card
**Prompt:** remove demo credentials line in landing page in login card there is admin id and password are written

**Response:**
Updated `Landing.jsx`:
1. Removed the demo credentials section (lines with "Demo credentials: admin@query.in / Admin@1234")
2. Removed the border-top and text below the login form

**Files modified:**
- `frontend/src/pages/Landing.jsx`

---

### Prompt 78: Add Consistent Borders to Landing Page Cards
**Prompt:** add borders to the "explore FAQs" card similar to the "welcome back" card

**Response:**
Updated `Landing.jsx`:
1. Added `border border-gray-200` to the Login card (Welcome back card)
2. Both cards now have consistent styling with border-gray-200

**Files modified:**
- `frontend/src/pages/Landing.jsx`

---

### Prompt 79: Moderator Response Shown as "Admin" in Intern's MyEscalations
**Prompt:** when a moderator answers the query, on the response page of the intern it should show response by moderator and not by admin as currently it is showing the moderator response as admin's response

**Response:**
Updated `MyEscalations.jsx` to correctly distinguish between moderator and admin responses:

1. **Backend change** - Added `populate('resolved_by', 'email role')` in `getMyEscalations` in `peerController.js`

2. **Frontend badge logic:**
   - For `response_type === 'admin'`: Shows "Admin Approved" (if approval=true) or "Admin Override" (if approval=false)
   - For `response_type === 'moderator'`: Shows "Moderator Approved" (if approval=true) or "Moderator Override" (if approval=false)
   - For `response_type === 'peer'` with `approval=true`: Shows "Admin Approved" or "Moderator Approved" based on `query.resolved_by?.role`

3. **Removed duplicate badge** - The second "Approved" badge was redundant since the first badge now correctly indicates who approved

**Files modified:**
- `backend/controllers/peerController.js` - Added populate for resolved_by
- `frontend/src/pages/intern/MyEscalations.jsx` - Updated badge logic
- `docs/database_schema.md` - Added Response Type & Approval States table

---

### Prompt 80: Remove Duplicate "Approved" Badge on Responses
**Prompt:** (part of Prompt 79) - also mentioned that moderator approved should show which peer answer was approved before approver, and for admin same

**Response:**
Implemented complete badge system for all response/approval combinations:

| response_type | approval | Badge Display |
|---------------|----------|---------------|
| admin | true | "Admin Approved" |
| admin | false | "Admin Override" |
| moderator | true | "Moderator Approved" |
| moderator | false | "Moderator Override" |
| peer | false | "Peer" |
| peer | true | "Admin Approved" or "Moderator Approved" (based on resolved_by.role) |

Removed the redundant second "Approved" badge that was showing alongside the first badge.

**Files modified:**
- `frontend/src/pages/intern/MyEscalations.jsx`

---

### Prompt 81: Add Response Type & Approval States to Database Schema
**Prompt:** add this in database schema too

**Response:**
Added "Response Type & Approval States" table to `docs/database_schema.md` documenting the complete matrix of response_type and approval combinations and their meanings.

**Files modified:**
- `docs/database_schema.md`

---

### Prompt 82: Add peer_note Visibility in Admin Query Views
**Prompt:** make sure that the admin is able to view the note provided by other users for a question asked by a intern

**Response:**
Added `peer_note` display in all admin/moderator query detail views:
- `AdminResolveHub.jsx` - Shows "Peer Note:" with border-left styling
- `AdminDashboard.jsx` - Both Peer Response Carousel and Peer Context Stream sections
- `AdminQueries.jsx` - Query detail panel
- `ModeratorDashboard.jsx` - Both sections
- `ModeratorQueries.jsx` - Query detail panel
- `ModeratorHighRated.jsx` - Query detail panel
- `ModeratorResolveHub.jsx` - Query detail panel

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/AdminQueries.jsx`
- `frontend/src/pages/moderator/ModeratorDashboard.jsx`
- `frontend/src/pages/moderator/ModeratorQueries.jsx`
- `frontend/src/pages/moderator/ModeratorHighRated.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 83: Add Announcement Priority Levels
**Prompt:** while adding an anouncement, the admin should have an option of adding 3 priorities as "Low","Medium","High" with red highlight for high priority, yellow for medium and dark green for low priority.

**Response:**
Added priority field to Announcement model and UI:

**Backend changes:**
- `backend/models/Announcement.js` - Added `priority` field with enum: ['low', 'medium', 'high'], default: 'medium'
- `backend/controllers/announcementController.js` - Updated createAnnouncement to accept and store priority

**Frontend changes:**
- `AdminAnnouncement.jsx` - Added 3 priority buttons (Low/Medium/High) with color coding:
  - Low: dark green (bg-green-800 text-white)
  - Medium: yellow (bg-yellow-400 text-black)
  - High: red (bg-red-600 text-white)
- `Announcements.jsx` (intern) - Added priority badge display with same color scheme

**Files modified:**
- `backend/models/Announcement.js`
- `backend/controllers/announcementController.js`
- `frontend/src/pages/admin/AdminAnnouncement.jsx`
- `frontend/src/pages/intern/Announcements.jsx`

---

### Prompt 84: Remove Admin from Role Dropdown
**Prompt:** from the user registration page of the admin, remove "Admin" from the dropdown menu for role as there can be only one admin for the entire application.

**Response:**
Removed "Admin" option from the role dropdown in `AdminUserManagement.jsx` SingleUserForm. Only "Intern" and "Moderator" options remain.

**Files modified:**
- `frontend/src/pages/admin/AdminUserManagement.jsx`

---

### Prompt 85: Add Moderator Name to FAQ Suggestion
**Prompt:** for the query suggested by the moderator to the admin, it is not showing which moderator send the suggestion to the admin, so add a From space which shows which moderator suggested the query to the admin

**Response:**
Updated `AdminResolveHub.jsx` moderator suggestion panel:
- Header now shows: `From: {email} ({role})` instead of hardcoded "Suggested by Moderator"
- Response section shows moderator badge with actual role and "From: {email}" display

The backend already populated `suggested_by` with email and role in `getModeratorSuggestions`.

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`

---

### Prompt 86: Add rater_note Visibility in Admin Query Views
**Prompt:** note which is ask to author of query while taking review is not added in query drawer where it can approve in in query manager

**Response:**
Added `rater_note` (Author's Review Note) display in all admin/moderator query detail views:
- `AdminResolveHub.jsx` - Blue background (bg-blue-50) with left border (border-blue-400)
- `AdminDashboard.jsx` - Both sections with blue styling
- `AdminQueries.jsx` - Query detail panel
- `ModeratorDashboard.jsx` - Both sections
- `ModeratorQueries.jsx` - Query detail panel
- `ModeratorHighRated.jsx` - Query detail panel
- `ModeratorResolveHub.jsx` - Query detail panel

Display format: "Author's Review Note: {rater_note}" with blue background to distinguish from peer_note (yellow).

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/AdminQueries.jsx`
- `frontend/src/pages/moderator/ModeratorDashboard.jsx`
- `frontend/src/pages/moderator/ModeratorQueries.jsx`
- `frontend/src/pages/moderator/ModeratorHighRated.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 87: Add "From" Field to Moderator Suggested Query List
**Prompt:** In the query management page of the admin, for the queries under the "Moderator Suggested" category, add a "From" field which should contain the details of that particular moderator who sent the query as a suggestion so that it becomes easy for the admin to identify which moderator suggested which query.

**Response:**
Updated `AdminResolveHub.jsx` to show moderator details in the query list for the Moderator Suggested section:

1. **Display question_text** instead of the suggestion object's generic text
2. **Show "From: {email} ({role})"** to identify the moderator in the list view
3. **Role badge** replaces response count for moderator suggestions

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`

---

### Prompt 88: Fix Stagnant Queries Not Appearing in Stagnant Tab
**Prompt:** High Priority Fix: In the Intern2 account, all escalations are currently locked and show 0 responses, indicating they have exceeded the 24-hour threshold and should be classified as Stagnant. However, on the Admin Dashboard → Query Management → Stagnant tab, none of these escalations are appearing.

Investigate and fix the underlying issue. Verify the logic used to determine stagnant queries, including time-based filtering, lock status checks, response count conditions, query visibility rules, database queries, and any backend/frontend filtering that could prevent valid stagnant escalations from being displayed.

**Root Cause:** The Stagnant filter in both `AdminResolveHub.jsx` and `ModeratorResolveHub.jsx` had incorrect logic that excluded queries with 0 responses. The filter required `responses.length >= 1` AND all responses to be low-rated.

**Fix:** Updated the Stagnant filter to handle 0-response queries:
- Before: `if (!q.responses || q.responses.length === 0) return false;` (rejected 0 responses)
- After: If 0 responses AND 24+ hours old → stagnant. If 1-4 responses (all low-rated) AND 24+ hours old → stagnant.

**Files modified:**
- `frontend/src/pages/admin/AdminResolveHub.jsx`
- `frontend/src/pages/moderator/ModeratorResolveHub.jsx`

---

### Prompt 89: Similar Query Interest Tracking & Notification
**Prompt:** Fix: if an intern A asks a similar query as asked by another intern B, the system says that similar query is already in peer queue, also add a line saying that the intern A will be notified when the asked query will be approved by the admin. When that query is resolved for intern B, Intern A should also be notified for the approved response of the query and also it should be added in intern A's "My escalation" page showing that the query is approved by the admin along with the correct response.

**Response:**
Implemented Similar Query Interest Tracking:

1. **New Model `SimilarQueryInterest.js`:**
   - Tracks `original_query_id`, `interested_intern_id`, `query_text`, `notified`
   - Unique compound index on `original_query_id + interested_intern_id`

2. **Updated `askAIController.js`:**
   - Added `trackSimilarQueryInterest()` helper function
   - All 3 similar query detection blocks now:
     - Track interest in `SimilarQueryInterest` collection
     - Return enhanced error: "Similar query already in peer queue. You will be notified when the existing query is resolved."

3. **Updated `adminController.js`:**
   - Added `notifyInterestedInterns()` helper that:
     - Finds all interested interns for the resolved query
     - Sends `query_resolved` notification
     - Emits socket event for real-time update
     - Creates Shadow Query for each interested intern (appears in their My Escalations as "Approved")

**Files modified:**
- `backend/models/SimilarQueryInterest.js` (new)
- `backend/controllers/askAIController.js`
- `backend/controllers/adminController.js`

---

### Prompt 90: Add Moderator Announcements Page
**Prompt:** On the moderator dashboard, add a new card for "Announcements" that takes the moderator to a page where they can see all the announcements created by the admin with their priority levels shown.

**Response:**
Created a new dedicated page and route for moderators to view announcements:

1. **New Page `ModeratorAnnouncements.jsx`:**
   - Route: `/moderator/announcements`
   - Shows all announcements in a feed layout
   - Priority badges with color coding (red=high, yellow=medium, dark green=low)
   - Time-ago formatting for timestamps

2. **Updated `navConfig.jsx`:**
   - Added "Announcements" nav item to `moderatorNavItems`

3. **Updated `App.jsx`:**
   - Added route for `/moderator/announcements`

**Files modified:**
- `frontend/src/pages/moderator/ModeratorAnnouncements.jsx` (new)
- `frontend/src/utils/navConfig.jsx`
- `frontend/src/App.jsx`

---

### Prompt 91: Documentation Update - Announcements Priority & Similar Query Tracking
**Prompt:** Update all documentation files including context.md, prompt.md, README.md, and docs/ folder to reflect the latest changes: announcement priority system and similar query interest tracking.

**Response:**
Updated all documentation files:

1. **README.md:**
   - Added Announcement Priority System section
   - Updated Moderator Dashboard Pages table with Announcements route

2. **context.md:**
   - Updated Moderator Dashboard description from 3-card to 4-card
   - Updated Moderator Dashboard Pages with Announcements route
   - Added Similar Query Interest Tracking to Key Features

3. **docs/database_schema.md:**
   - Added SimilarQueryInterest collection documentation
   - Updated ModeratorFaqSuggestions workflow

4. **docs/architecture.md:**
   - Updated Moderator Resolve Hub sections

5. **All other docs files:**
   - Reflected the 6-section Resolve Hub structure
   - Moderator FAQ Suggestion workflow
   - Similar Query Interest Tracking feature

---

### Prompt 92: Fix Announcements Dynamic Updates & Moderator Suggestion FAQ Removal
**Prompt:** Fix two issues:
1. The announcements page for intern should be dynamic - if any new announcement is added, it should be displayed without the need of refreshing.
2. After adding the moderator suggested query to the FAQ database, it should be removed from the "Moderator Suggested" category on admin's Query Management page.

**Response:**
Fixed both issues:

**Fix 1 - Dynamic Announcements Page:**
Updated `frontend/src/pages/intern/Announcements.jsx`:
- Added `useNotifications` hook import from NotificationContext
- Added new `useEffect` hook that listens for `new_notification` Socket.IO events
- When an announcement notification arrives (type === 'announcement'), it prepends the new announcement to the list without page refresh

**Fix 2 - Remove Moderator Suggestion After FAQ Creation:**
1. Updated `backend/controllers/adminController.js`:
   - After successfully creating FAQ from a query, the `createFAQFromQuery` function now updates the corresponding `ModeratorFaqSuggestion` with status 'pending' to 'approved'

2. Updated `frontend/src/pages/admin/AdminResolveHub.jsx`:
   - Added `onSuggestionApproved` callback prop to `QueryDetailPanel`
   - Parent component passes `onSuggestionApproved` which filters out the approved suggestion from the list
   - `handleFaqSubmit` now calls `onSuggestionApproved()` when in suggestion mode after successful FAQ creation

**Files modified:**
- `frontend/src/pages/intern/Announcements.jsx` - Added Socket.IO listener for real-time announcement updates
- `backend/controllers/adminController.js` - Added ModeratorFaqSuggestion status update to 'approved'
- `frontend/src/pages/admin/AdminResolveHub.jsx` - Added onSuggestionApproved callback to remove suggestion from list

---

### Prompt 96: Allow Interns to Delete Own Escalations
**Prompt:** Add this - Allow every intern to delete only their own escalations. Add a delete option for escalations created by the currently logged-in intern, ensuring proper ownership validation and access control. Interns must not be able to delete escalations submitted by other users

**Response:**
Implemented ability for interns to delete only their own escalations with full ownership validation:

**Backend Changes:**
1. **peerController.js** - Added `deleteEscalation` function with ownership validation:
   - Verifies the query exists
   - Verifies `intern_id` matches the requesting user
   - Prevents deletion of Resolved or Ambiguous queries
   - Prevents deletion if query has any approved responses
   - Deletes associated Response documents
   - Deletes the Query document

2. **peerRoutes.js** - Added `DELETE /api/peer/:query_id` route with intern authorization

**Frontend Changes:**
1. **MyEscalations.jsx** - Added:
   - `deleteModal` state for confirmation dialog
   - `deleting` state for loading indicator
   - `handleDeleteEscalation` function to call API
   - `canDeleteQuery` function to determine if query is deletable
   - Delete button (red text, appears on hover) next to status badge
   - Confirmation modal with query preview and delete/cancel buttons

**Validation Rules:**
- Only the query author can delete
- Cannot delete Resolved or Ambiguous queries
- Cannot delete queries with approved responses
- Associated responses are cascade deleted

**Files modified:**
- `backend/controllers/peerController.js` - Added deleteEscalation function with ownership validation and cascading deletion
- `backend/routes/peerRoutes.js` - Added DELETE route
- `frontend/src/pages/intern/MyEscalations.jsx` - Added delete button, modal, optimistic UI update, and socket event handling
- `frontend/src/context/NotificationContext.jsx` - Added escalation_deleted socket event handler
- `docs/api_docs.md` - Added DELETE /peer/:query_id endpoint documentation
- `context.md` - Added issues #96-99 to Resolved Issues table

---

### Prompt 72: Cascading Deletion, Socket Events, and UI Updates for Escalation Deletion

**Prompt:** When an escalation is deleted, it should be removed consistently across all related views, lists, counters, filters, and database records. Include an appropriate confirmation step before deletion to prevent accidental removals, and ensure the UI updates immediately after a successful delete operation.

**Response:**
Implemented comprehensive cascading deletion for escalations:

**Backend (`peerController.js`):**
1. Delete Query document
2. Delete all Response documents for this query
3. Delete all SimilarQueryInterest records referencing this query
4. Delete all Notification records where link_id references this query
5. Emit escalation_deleted socket event to user's room and admin room

**Frontend (`MyEscalations.jsx`):**
- Optimistic UI removal before API call
- Socket event listener for escalation_deleted to sync across tabs
- Background refetch after 500ms to ensure consistency

**Frontend (`NotificationContext.jsx`):**
- Listens for escalation_deleted socket event
- Removes related notifications from notification list

**Frontend (`PeerQueue.jsx`):**
- Added timestamp display with clock icon alongside response count

### Prompt 73: Timestamp Display on Escalation Cards

**Prompt:** In the My Escalations page, display the exact date and time when each escalation was created. The timestamp should be clearly visible within every escalation card, alongside the existing response count and status information.

**Response:**
Updated My Escalations and Peer Queue pages with full timestamp display:
- Shows date AND time (e.g., "Jan 15, 2026 at 2:30 PM")
- Uses clock icon for visual consistency
- Proper singular/plural handling for "response" vs "responses"
- Flexbox layout for proper wrapping on smaller screens

**Files modified:**
- `frontend/src/pages/intern/MyEscalations.jsx` - Added full timestamp with icons
- `frontend/src/pages/intern/PeerQueue.jsx` - Added timestamp to query info
- `context.md` - Added issues #97-99
- `README.md` - Added issues #97-99 to Recent Fixes table

---

### Prompt 101: Add "Remove Warnings" Option in User Management

**Prompt:** Under the "Actions" section of the User management page, add an option as "Remove Warnings" so that the warning count becomes 0 and the disabled account automatically gets enabled.

**Response:**
Added "Remove Warnings" functionality to User Management:

**Backend Changes:**
1. **authController.js** - Added `removeWarnings` function:
   - Resets `warning_count` to 0
   - Sets `is_disabled` to false
   - Validates: cannot remove own warnings, cannot modify admin users

2. **authRoutes.js** - Added `PATCH /api/auth/users/:id/remove-warnings` route (admin only)

**Frontend Changes:**
1. **AdminUserManagement.jsx** - Added:
   - `handleRemoveWarnings` function to call the API
   - "Remove Warnings" button in the dropdown menu (shown only when `warning_count > 0`)
   - Button styled in red text for visibility
   - Confirmation dialog before removal

**Files modified:**
- `backend/controllers/authController.js` - Added removeWarnings function
- `backend/routes/authRoutes.js` - Added route
- `frontend/src/pages/admin/AdminUserManagement.jsx` - Added dropdown option and handler

---

### Prompt 102: Auto-Logout Disabled/Inactive Users

**Prompt:** When an intern was disabled due to 5 warnings and same for when admin set a user inactive, he was still able to perform functions on the dashboard, only when he logout of the session, it showed that the account is disabled. Make sure that once disabled, an intern should immediately be logged out of his session automatically.

**Response:**
Implemented immediate logout for disabled/inactive accounts:

**Backend Changes:**
1. **authMiddleware.js** - Updated `protect` middleware:
   - Made it `async` to allow database queries
   - After JWT verification, queries User collection
   - Returns 403 immediately if `user.is_disabled === true` or `user.isActive === false`
   - User is logged out on ANY API call, not just login

**Frontend Changes:**
2. **api.js** - Updated axios interceptor:
   - Added 403 response handling
   - Checks if error message contains "disabled", "deactivated", or "account has been disabled"
   - Clears localStorage and redirects to `/` (landing page)

**How it works:**
1. Admin disables user or sets them inactive, or auto-disable at 5 warnings
2. The next time that user makes ANY API request
3. `protect` middleware detects `is_disabled === true` or `isActive === false`
4. Returns 403 with appropriate error message
5. Frontend interceptor catches 403, sees the error message
6. Immediately clears token/user from localStorage and redirects to `/`
7. User is automatically logged out

**Files modified:**
- `backend/middleware/authMiddleware.js` - Added is_disabled and isActive checks
- `frontend/src/utils/api.js` - Added 403 error handling for auto-logout
- `context.md` - Added issues #100-101
- `prompt.md` - Added Prompts 101-102

---

### Prompt 103: Skipped Queries Reappear After Refresh

**Prompt:** Once an intern skips a query on the "Peer Answer Queue", that same query shouldn't be displayed again to that intern even after refreshing the page or logging in again.

**Response:**
Implemented persistent skip tracking for peer queue:

**Backend Changes:**
1. **Query model** - Added `skipped_by` array field to track interns who have skipped a query

2. **peerController.js - skipQuery:**
   - Added ownership validation (cannot skip own query)
   - Added duplicate skip prevention (already skipped = error)
   - Now persists skip by adding user_id to query's `skipped_by` array using `$addToSet`
   - Returns clear message: "Query skipped. It will not appear again."

3. **peerController.js - getPeerQueue:**
   - Added `skipped_by: { $ne: currentUserId }` filter to exclude skipped queries
   - Skipped queries are now permanently hidden from that intern

**Files modified:**
- `backend/models/Query.js` - Added `skipped_by` field
- `backend/controllers/peerController.js` - Updated `skipQuery` to track skips, `getPeerQueue` to filter skipped
- `docs/database_schema.md` - Added `skipped_by` field documentation
- `context.md` - Added issue #102
- `README.md` - Added issue #102 to Recent Fixes table
- `prompt.md` - Added Prompt 103