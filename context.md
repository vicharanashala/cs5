# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini + Groq LLM APIs

---

## Current Phase
**Phase 14: UI/UX Modernization**

### Status: 🟡 In Progress
- Updated tailwind.config.js with modern design system
- Updated core components: Button, Card, Badge, DashboardLayout, Toast, NotificationBell, FormattedAnswer
- Updated intern pages: Landing, FAQs, InternDashboard, AskAI, ViewFAQs, MyEscalations, PeerQueue, Announcements, AllNotifications
- Modern SaaS aesthetic: rounded-xl corners, soft shadows, smooth hover transitions
- Black and white design with yellow (#FFD000) highlight for alerts
- Gold (#FFD700) rating stars, Red (#DC2626) for critical warnings
- All Notifications page created at /notifications
- FAQ deep linking with scroll-to-highlight
- 6 commits made on ui-update branch

### Design System
- **Colors:** Background #FAFAFA, Surface #FFFFFF, Black #000000, Highlight #FFD000 (yellow), Gold #FFD700 (stars), Error #DC2626 (red)
- **Typography:** text-sm (14px), text-base (16px), text-lg (18px)
- **Spacing:** 8px rhythm with py-2, py-3, py-4, space-y-4, space-y-6
- **Shadows:** shadow-md for resting, shadow-xl for hover
- **Borders:** 1px solid black borders on cards and buttons
- **Animations:** duration-200 smooth transitions
- **User Select:** Disabled globally except for input fields

---

## Query Lifecycle & Workflow

### Complete Query Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           QUERY LIFECYCLE                                    │
│                        Intern submits query                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  STEP 0: AUTO-COMPLETE (as user types)
  │
  ├─ User types in AskAI input
  ├─ debounce 300ms → GET /api/ask/autocomplete?q=...
  ├─ RAG keyword search on FAQ keywords, tags, search_text
  ├─ Returns up to 5 matching FAQs
  └─ User can select autocomplete → instant resolution (source: 'autocomplete')

  STEP 1: RAG SEARCH (on submit)
  │
  ├─ User submits full question → POST /api/ask
  ├─ RAG keyword matching (search_text, tags, keywords)
  ├─ Match confidence > 50%?
  │   ├─ YES → Return FAQ answer for upvote/downvote
  │   │       ├─ UPVOTE → Resolution logged (RAG_RESOLVED), query ends
  │   │       └─ DOWNVOTE → Go to STEP 2 (LLM Fallback)
  │   │
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
  ├─ 4-5 stars (HIGH) → Query immediately locked
  │   └─ Escalates to Admin "Highly-Rated Queue"
  │
  ├─ 1-3 stars (LOW) + 5 responses filled → Query locked
  │   └─ Escalates to Admin "Low-Rated Queue"
  │
  └─ Ambiguous: 3 different peers mark query as ambiguous
      └─ Query status → 'Ambiguous', is_locked: true
      └─ Intern notified: "Your query was unclear. Please rephrase."

STEP 6: ADMIN RESOLUTION
  │
  ├─ Admin views escalated queries (6-section queue)
  ├─ Options:
  │   ├─ APPROVE PEER RESPONSE → Query resolved (peer_approved)
  │   ├─ ADMIN OVERRIDE → Query resolved (admin_override)
  │   └─ ADD TO FAQ → Creates permanent FAQ entry
  └─ Notification sent to intern (query_resolved)

STEP 7: RESOLVED (Terminal State)
  │
  └─ Query marked as 'Resolved', is_locked: true
  └─ "Add to FAQ" button available for knowledge base expansion
```

---

### State Machine Transitions

```
                    ┌─────────────┐
                    │   PENDING   │ ← Initial state after LLM downvote
                    └──────┬──────┘
                           │
               ┌────────────┼────────────┐
               │            │            │
               ▼            ▼            ▼
        ┌───────────┐ ┌───────────┐ ┌───────────┐
        │  3-STRIKE  │ │  PEER     │ │  TIMEOUT  │
        │  AMBIGUOUS │ │  ANSWERED  │ │  ESCALATE │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐  ┌─────────────┐ ┌──────────┐
       │ AMBIGUOUS │  │   RATING    │ │ AUTO     │
       │ (terminal)│  └──────┬──────┘ │ ESCALATE │
       └──────────┘         │         └──────────┘
                            │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
       ┌───────────────┐     ┌───────────────┐
       │  rating = 4   │     │  rating = 5   │
       │  (HIGH RATED) │     │   (LOCKED)    │
       │  NOT locked   │     │               │
       └───────┬───────┘     └───────┬───────┘
               │                     │
               │         ┌───────────┴───────────┐
               │         │                       │
               │         ▼                       ▼
               │  ┌───────────────┐    5 responses
               │  │ is_locked=true │    all < 4 stars
               │  └───────┬───────┘           │
               │          │                   ▼
               │          │           ┌───────────────┐
               │          │           │  LOW-RATED    │
               │          │           │    QUEUE      │
               │          │           └───────┬───────┘
               │          │                 │
               └──────────┴─────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
               ▼                         ▼
       ┌─────────────────────────────┐
       │     ADMIN RESOLUTION       │
       │  (approve or override)      │
       └─────────────┬───────────────┘
                     │
                     ▼
               ┌──────────┐
               │ RESOLVED │ ← Terminal state
               └──────────┘
```

---

### Resolution Types (Analytics Tracking)

| Type | Trigger | Description |
|------|---------|-------------|
| `AUTO_COMPLETE` | User selects autocomplete suggestion | Instant resolution via FAQ |
| `RAG_RESOLVED` | User upvotes RAG answer | FAQ match accepted |
| `LLM_RESOLVED` | User upvotes LLM answer | AI answered successfully |
| `ESCALATED` | User downvotes LLM or LLM fails | Sent to peer queue |
| `SPAM_BLOCKED` | Similar query in pending state | Spam prevention |
| `CAP_BLOCKED` | Intern has 5 active queries | Query cap reached |

---

## Milestones

1. ✅ Project Architecture & Planning
2. ✅ MERN Stack Setup & Foundation
3. ✅ Database & Backend APIs
4. ✅ Authentication & RBAC
5. ✅ Admin, Moderator & Intern Dashboards
6. ✅ RAG & LLM Integration
7. ✅ Peer Escalation Workflow Engine
8. ✅ AI FAQ Suggestion Engine
9. ✅ Realtime Notifications & Queue System
10. ⬜ Automated Testing Suite (Pending)
11. ✅ Documentation Engine
12. ✅ Notification System
13. ✅ Backend Performance & Correctness Fixes
14. 🟡 UI/UX Modernization (Current)

---

## All Resolved Issues

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
| 20 | MyEscalations socket connection failed | VITE_API_URL undefined caused .replace() to fail | Added fallback for API URL before replace |
| 21 | Sweeper edge case: 5 responses with all low ratings not locked | responseCount <= 4 should be < MAX_PEER_RESPONSES | Changed condition to use constant MAX_PEER_RESPONSES=5 |
| 22 | Ambiguous 3-strike doesn't notify intern | No notification sent when query becomes Ambiguous | Added createNotification call in peerController when status changes to Ambiguous |
| 23 | createFAQFromQuery does nothing | Stub function only returned query_text | Implemented actual FAQ creation from approved response |
| 24 | Missing Stagnant Queue in Admin Dashboard | Only 5 sections shown instead of 6 | Added "Stagnant (0 answers)" as 6th section + Add to FAQ button |
| 25 | AskAI error message too generic | catch block showed "Failed to submit feedback" | Now shows actual backend error message (e.g., "Escalation blocked: You have 5 unresolved queries.") |
| 26 | No way to clear test escalation data | Accumulated queries clutter database | Added POST /api/admin/clear-all-data endpoint |
| 27 | Race condition in submitAnswer | Pre-check query.responses.length then update allows bypass | Atomic `findOneAndUpdate` with `$expr: { $lt: [{ $size: "$responses" }, 5] }` |
| 28 | N+1 query performance in sweeper | for-loop with Response.find() + Query.findByIdAndUpdate() per query | Aggregation pipeline + updateMany for bulk locking |
| 29 | Incorrect telemetry in LLM pipeline | `synthesizeWithGemini/Grok` returned just answer, `getGrokResponse` hardcoded model[0] | Now returns `{ answer, model }` for accurate model tracking |
| 30 | ProtectedRoute redirected to /login | Login form embedded on Landing page at `/` | Changed redirect from `/login` to `/` |
| 31 | ViewFAQs markdown not rendering | Raw text in `<p>` tag, no markdown parsing | Added react-markdown for proper rendering |
| 32 | ViewFAQs missing status badges | No status indicators on FAQ cards | Added "AI Generated", "Peer Answered", "Verified by Admin" badges |
| 33 | ViewFAQs auto-expand on load | First category auto-expanded on page load | Removed auto-expand, categories start collapsed |
| 34 | Peer queue empty after first answer | getPeerQueue only queried status: 'Pending', but after first answer status becomes 'Peer Answered' | Changed to query status: { $in: ['Pending', 'Peer Answered'] } |
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
| 81 | Database schema not updated with response approval states | Missing documentation for response_type and approval combinations | Added Response Type & Approval States table in database_schema.md |
| 82 | peer_note not visible in AdminResolveHub | Response detail panel didn't show internal note | Added peer_note display in AdminResolveHub.jsx with "Peer Note:" label |
| 83 | Announcement priority missing | No way to set urgency level for announcements | Added priority field (low/medium/high) with color coding: dark green/yellow/red |
| 84 | Admin dropdown included Admin role | Only one admin should exist per application | Removed Admin option from role dropdown in user registration page |
| 85 | Moderator suggestion didn't show sender | Admin couldn't see which moderator suggested FAQ | Added "From: {email} ({role})" display in moderator suggestion header and response section |
| 86 | rater_note not visible in admin query views | Admin couldn't see intern's review note when approving responses | Added "Author's Review Note:" display with blue styling in all admin/moderator query detail views |
| 87 | Moderator Suggested list missing "From" field | Admin couldn't identify moderator from query list, only in detail panel | Added "From: {email} ({role})" display in query list items, shows question_text instead of suggestion text, role badge instead of response count |
| 88 | Query Monitor still in moderator dashboard | Query Monitor route and card still existed after removal attempt | Completely removed Query Monitor: deleted ModeratorQueries component, route, nav card, and overview card |
| 89 | Stagnant queries with 0 responses not appearing in Stagnant tab | Stagnant filter excluded queries with 0 responses (required responses.length >= 1 and all low-rated) | Fixed filter to handle 0 responses case: if no responses and 24+ hours old, query is stagnant |
| 90 | Similar query blocking doesn't notify interested interns | When intern A's similar query is blocked, they aren't notified when intern B's query is resolved | Added SimilarQueryInterest model, track interests on block, create shadow query and notify when original query is resolved |

---

## Key Features

### LLM Pipeline
- **Gemini Models (in order):** 3.5-flash → 3.1-pro → 3.1-flash-lite → 2.5-flash → 2.5-pro
- **Groq Models (fallback, in order):** llama-3.3-70b → llama-3.1-8b → llama-4-scout → qwen3-32b → gpt-oss-120b → gpt-oss-20b
- **Max Output Tokens:** 2000
- **Temperature:** 0.1 (focused, deterministic)
- **Timeout:** 60 seconds
- **Response Rules:** No emojis, no formatting (#, *, bold, italics), plain text only

### Query Protection
- **Active Query Cap:** Max 5 unresolved queries per intern
- **Spam Prevention:** Similar query detection via regex before peer escalation
- **5-Answer Lock:** Max 5 peer responses per query
- **Similar Query Interest Tracking:** When intern A tries to submit similar query to intern B's pending query, intern A is tracked. When intern B's query is resolved, intern A is notified and gets a shadow query in their "My Escalations" page.

### Notification System
- **Hybrid Model:** Socket.IO for real-time + MongoDB for persistence
- **Types:** peer_answer, query_resolved, admin_alert, announcement, faq_added, intern_warning
- **Components:** NotificationBell, Toast, NotificationContext
- **Yellow Alert:** Admin notified when NoFaq hits 10 occurrences
- **FAQ Added:** All interns notified when admin creates new FAQ
- **Intern Warning:** Interns notified when they receive a warning for misuse

### Announcement System
- **Priority Levels:** Admin can set Low (dark green), Medium (yellow), or High (red) priority for announcements
- **Visual Indicators:** Color-coded badges on announcement cards
- **Backend Support:** Announcement model includes priority field with enum validation

### Query Input Sanity Check
- **Frontend + Backend validation** before RAG/LLM processing
- **Validation rules:**
  - Minimum 4 actual letters required
  - Special character ratio < 30%
  - 3+ consecutive letters required
  - Repeated pattern detection (blocks `aaa`, `ajflafjllafffaafas`)
  - 4-6 unique letters required (scaled by length)
  - Long strings (>20 chars) must have common words OR 8+ unique letters
  - Repeated pattern ratio < 40%
- **Error code:** `INVALID_QUERY`
- **Both frontend and backend validation for defense in depth**

### Warning & Credibility System
- **Warning Count:** Each user has `warning_count` (default: 0, max: 5)
- **Auto-Disable:** Account automatically disabled when warning_count >= 5
- **Warning Types:** intern_warning notification sent to misbehaving interns
- **Admin Tool:** Send warning button in query details modal
- **Combined User Management:** All user functionality combined in `/admin/users` page including warnings display and active/inactive toggle
- **Login Block:** Disabled or inactive users cannot log in (403 error)
- **Frontend Alert:** Warning banner shown on MyEscalations page if user has warnings
- **isActive Toggle:** Admin can activate/deactivate users (except self and other admins)

---

---

## Project Structure

```
query.in/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── socket.js          # Socket.IO configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── faqController.js
│   │   ├── queryController.js
│   │   ├── askAIController.js
│   │   ├── peerController.js
│   │   ├── ratingController.js
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   ├── analyticsController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # protect, authorizeRoles
│   ├── models/
│   │   ├── User.js, Query.js, Response.js
│   │   ├── FAQ.js, NoFaq.js, Announcement.js, Notification.js
│   ├── routes/
│   ├── services/
│   │   └── grokService.js     # LLM service (Gemini + Groq)
│   ├── jobs/
│   │   └── sweeper.js         # 24-hour cron job
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── context/           # AuthContext, NotificationContext
│   │   ├── pages/            # Role-based pages
│   │   ├── utils/            # api.js, publicApi.js, navConfig.jsx (centralized navigation)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
├── docs/
│   ├── FEATURES.md
│   ├── setup_guide.md
│   ├── architecture.md
│   ├── api_docs.md
│   └── database_schema.md
├── context.md
├── prompt.md
└── README.md
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/bulk-register` - Bulk register (admin)
- `GET /api/auth/users` - Get all users (admin)

### FAQs
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search` - Search FAQs
- `POST /api/faqs` - Create FAQ (admin)
- `PUT /api/faqs/:id` - Update FAQ (admin)
- `DELETE /api/faqs/:id` - Delete FAQ (admin)

### Queries
- `GET /api/queries` - Get all queries
- `POST /api/queries` - Submit new query

### Ask AI
- `GET /api/ask/autocomplete` - Auto-complete suggestions
- `POST /api/ask` - Full AI pipeline (RAG → LLM → Escalation)

### Admin
- `GET /api/admin/escalated` - Get escalated queries
- `GET /api/admin/query/:id` - Get query details
- `GET /api/admin/spoiled-users` - Get users with warnings
- `GET /api/admin/moderator-suggestions` - Get pending FAQ suggestions from moderators (admin only)
- `POST /api/admin/approve` - Approve peer response
- `POST /api/admin/override` - Admin override
- `POST /api/admin/create-faq` - Create FAQ from query
- `POST /api/admin/suggest-faq` - Moderator suggests query for FAQ database (moderator only)
- `POST /api/admin/clear-all-data` - Clear all Query/Response/NoFaq/Notification data (preserves users/FAQs)
- `POST /api/admin/warn-user` - Send warning to intern
- `PATCH /api/admin/moderator-suggestions/:id/dismiss` - Admin dismisses moderator suggestion

### Peer (Intern)
- `GET /api/peer/queue` - Get pending queries
- `GET /api/peer/my-escalations` - Get my queries
- `POST /api/peer/answer` - Submit answer
- `POST /api/peer/skip` - Skip query
- `POST /api/peer/ambiguous` - Mark ambiguous (3-strike rule)

### Ratings
- `POST /api/ratings/:id` - Rate response (1-5 stars)

### Analytics
- `GET /api/analytics/faq-suggestions` - Get suggestions (>= 10 hits)
- `GET /api/analytics/no-faq` - Get all no_faq records
- `GET /api/analytics/stats` - Get analytics summary
- `DELETE /api/analytics/suggestions/:id` - Dismiss suggestion
- `POST /api/analytics/create-faq` - Create FAQ from suggestion

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (admin)

### Notifications
- `GET /api/notifications` - Get notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

---

## Admin Dashboard (5-Card Layout)

| Card | Feature |
|------|---------|
| 1 | User Management (Combined: Registration + User list with warnings + Active/Inactive toggle) |
| 2 | Broadcast Announcement |
| 3 | FAQ Knowledge Base Editor |
| 4 | Query Management (Review, approve, or override escalated queries. Resolve ambiguous or low-rated tickets.) |
| 5 | AI-Assisted FAQ Suggestions (Yellow alert) |

---

## Moderator Dashboard (3-Card Layout)

| Card | Feature |
|------|---------|
| 1 | Announcements (View-only, yellow alert < 24hrs) |
| 2 | Highly Rated Queries |
| 3 | Ambiguous Queries |
| 4 | Resolve Query Hub |

---

## Admin Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /admin | Overview with navigation cards |
| User Management | /admin/users | Combined: Registration, User list with warnings (0=green, 1+=yellow, 5=red), Active/Inactive toggle (green/red) |
| Announcements | /admin/announcement | Publish announcements |
| FAQ Editor | /admin/faqs | FAQ CRUD operations |
| Query Management | /admin/resolve | Resolution queue (6 sections: Pending Resolution, Ambiguous, Stagnant, Low-Rated, Archive, Moderator Suggested) |
| AI Suggestions | /admin/suggestions | FAQ gap suggestions |

## Moderator Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /moderator | Overview with navigation cards |
| Resolve Hub | /moderator/resolve | Resolution queue (4 sections: Pending Resolution, Stagnant, Low-Rated, Archive) |

## Intern Dashboard Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /intern | Overview |
| Ask AI | /intern/ask | Submit queries |
| Peer Queue | /intern/peer-queue | Answer others' queries |
| My Escalations | /intern/my-queries | Track my queries, rate responses |
| View FAQs | /intern/faqs | Browse knowledge base |
| Announcements | /intern/announcements | View admin broadcasts |

---

## Configuration

| Setting | Value |
|---------|-------|
| MongoDB Atlas URI | mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation |
| Max Output Tokens | 2000 |
| LLM Timeout | 60 seconds |
| Max Unresolved Queries per Intern | 5 |
| Max Peer Responses per Query | 5 |
| Ambiguous Strike Threshold | 3 |
| FAQ Suggestion Threshold | 10 occurrences |
| Auto-complete Debounce | 300ms |
| Toast Auto-dismiss | 5 seconds |

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

## Next Actions

1. Automated Testing Suite (Phase 10)
2. Production deployment optimization
3. Performance tuning for large FAQ collections