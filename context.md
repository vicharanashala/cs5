# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API

---

## Current Phase
**Phase 11: Documentation Engine (Complete)**

### Status: ✅ Complete
- Git repository initialized
- Folder structure created (frontend/, backend/)
- context.md created
- Backend initialized (Node.js, Express, Mongoose, dependencies)
- Frontend initialized (Vite React, Tailwind CSS, B&W theme configured)
- Foundational components created (Card.jsx, Button.jsx)
- server.js and config/db.js written with detailed comments
- Environment configuration (.env, .env.example) established
- 6 Mongoose schemas created (User, Query, Response, FAQ, NoFaq, Announcement)
- FAQ routes and controller implemented
- Query routes and controller implemented
- Auth controller implemented with JWT and bcrypt
- RBAC middleware implemented
- Auth routes mounted at /api/auth
- testCredentials.md created with 4 test accounts
- AuthContext created (JWT state management, localStorage persistence)
- ProtectedRoute wrapper component
- Axios interceptor utility configured
- Badge, FormattedAnswer, DashboardLayout components
- Landing page with embedded login
- Role-based dashboards (Admin, Moderator, Intern)
- publicApi.js created for public routes
- Public FAQs page with accordion grouping
- Smooth rounded corners applied
- AskAI routes and controller (autoComplete, askAI endpoints)
- Gemini LLM service (sanity check, context synthesis with temperature 0.1)
- RAG database search (keyword matching on search_text, tags, keywords)
- LLM fallback pipeline with upvote/downvote flow
- **Peer Controller** - getPeerQueue, submitAnswer, skipQuery, markAmbiguous
- **Rating Controller** - rateResponse, getResponseRatings with high/low rating lock
- **Admin Controller** - getEscalatedQueries, approvePeerResponse, overrideWithAdminResponse
- **Announcement Controller** - getAllAnnouncements, createAnnouncement
- **Analytics Controller** - trackNoFaqQuery, getFaqSuggestions, getAllNoFaqQueries, getNoFaqStats
- **Intern Pages:** PeerQueue, MyEscalations, ViewFAQs, Announcements
- **Admin Dashboard (Complete 7-Card Layout):**
  - Card 1: User Registration (Single + Bulk JSON Upload with confirmation modal)
  - Card 2: Broadcast Announcement (heading + content to Announcements collection)
  - Card 3: User Management Directory (filterable/sortable user table)
  - Card 4: Master Query Monitor (thread drawer with approve/override actions)
  - Card 5: FAQ Knowledge Base Editor (CRUD with edit/delete per row)
  - Card 6: Resolve Query Hub (5-section queue: Master/Unanswered/Low-Rated/High-Rated/Archive)
  - Card 7: AI-Assisted FAQ Suggestions (yellow alert when unread, dismiss action)
- **Socket.IO** integration in peerController and adminController (new_peer_answer, query_resolved events)
- **Groq API** integration as LLM fallback (llama-3.3-70b, llama-3.1-8b, llama-4-scout, qwen3-32b, gpt-oss)
- **Multi-model fallback** - Gemini (3.5-flash -> 3.1-pro -> 3.1-flash-lite -> 2.5-flash -> 2.5-pro), Groq (llama-3.3-70b -> llama-3.1-8b -> llama-4-scout -> qwen3-32b -> gpt-oss)
- **Active query cap** - Max 5 unresolved queries per intern, prevents spam escalation
- **Spam prevention** - Similar query detection regex check before peer escalation
- **Analytics tracking** - ResolutionType enum (AUTO_COMPLETE, RAG_RESOLVED, LLM_RESOLVED, ESCALATED, SPAM_BLOCKED, CAP_BLOCKED)
- **LLM response rules** - No emojis, no formatting (#, *, bold, italics), plain text only, concise answers
- **Enhanced logging** - LLM call logs with model name, response length, image error format "Cannot read image.png (this model does not support image input)"
- **MAX_OUTPUT_TOKENS** - Increased from 800 to 2000 for complete LLM responses
- **Timeout handling** - 60s timeout with automatic model switching on failure
- **Backend API updates:**
  - `/api/auth/bulk-register` - Bulk user registration (admin only)
  - `/api/auth/users` - Get all users (admin only)
  - `/api/faqs/:id` - Update FAQ (admin only)
  - `/api/faqs/:id` - Delete FAQ (admin only)

### Resolved Issues
1. Fixed: Explore FAQs button redirected to login instead of FAQ page
2. Fixed: Auth interceptor redirected to login on 401 for public routes
3. Fixed: FAQs page now shows all 125 FAQs in accordion format
4. Fixed: Cards and buttons now have smooth rounded corners
5. Fixed: Login redirect loop - ProtectedRoute checks localStorage directly
6. Fixed: Auto-complete dropdown not closing on Enter key
7. Fixed: RAG downvote now triggers LLM before escalation
8. Fixed: Auto-complete uses consistent RAG matching
9. Fixed: LLM service updated from Grok to Gemini
10. Fixed: Gemini API v1 404 error - uses v1 REST API
11. Fixed: Mongoose deprecated `new: true` → `returnDocument: 'after'`
12. Fixed: Frontend handles pending_feedback after rag_downvote
13. Fixed: Backend missing ratingRoutes.js and adminRoutes.js files
14. Fixed: Backend missing analytics controller and routes for no_faq tracking

### Next Actions
- All phases complete. Project ready for production.

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
10. ⬜ Automated Testing Suite
11. ✅ Documentation Engine (current)

---

## Issues & Notes
- MongoDB Atlas URI: mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation
- Gemini API Key: AIzaSyAJH1lbg29Egb4CifLCVVSaPjxz2mZ-lIM
- Groq API Key: REDACTED_GROQ_KEY
- Gemini Models: gemini-3.5-flash, gemini-3.1-pro-preview, gemini-3.1-flash-lite, gemini-2.5-flash, gemini-2.5-pro
- Groq Models: llama-3.3-70b-versatile, llama-3.1-8b-instant, llama-4-scout-17b, qwen3-32b, gpt-oss-120b, gpt-oss-20b
- Test accounts: admin@query.in, mod@query.in, intern1@query.in, intern2@query.in
- Max unresolved queries per intern: 5
- LLM max output tokens: 2000
- LLM timeout: 60 seconds

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/bulk-register` - Bulk register users (admin)
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
- `POST /api/ask` - Full AI pipeline

### Peer (Intern)
- `GET /api/peer/queue` - Get pending queries for peer answering
- `GET /api/peer/my-escalations` - Get my submitted queries
- `POST /api/peer/answer` - Submit peer answer
- `POST /api/peer/skip` - Skip query
- `POST /api/peer/ambiguous` - Mark query as ambiguous (3-strike rule)

### Ratings
- `POST /api/ratings/:id` - Rate a peer response (1-5 stars)

### Admin
- `GET /api/admin/escalated` - Get escalated queries
- `GET /api/admin/query/:id` - Get query details
- `POST /api/admin/approve` - Approve peer response
- `POST /api/admin/override` - Admin override answer

### Analytics (AI FAQ Suggestion Engine)
- `GET /api/analytics/faq-suggestions` - Get suggestions (>= 10 occurrences)
- `GET /api/analytics/no-faq` - Get all no_faq records
- `GET /api/analytics/stats` - Get analytics summary
- `DELETE /api/analytics/suggestions/:id` - Dismiss a suggestion
- `POST /api/analytics/create-faq` - Create FAQ from suggestion

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)

---

## Admin Dashboard (7-Card Layout)

### Card 1: User Registration
- Single User Form: Email, Password, Role selection
- Bulk JSON Upload: Drag & drop, role assignment, confirmation modal

### Card 2: Broadcast Announcement
- Publish global announcements with heading and content
- Creates document in Announcements collection

### Card 3: User Management Directory
- Sortable/filterable table of all users
- Role filter: All, Interns, Moderators, Admins
- Date filter: Newest/Oldest first
- Email search functionality

### Card 4: Master Query Monitor
- Filter by status: All, Pending, Peer Answered, Ambiguous, Resolved
- Sort by date: Ascending/Descending
- Click to open Thread Drawer with:
  - Core question display
  - Peer response carousel (max 5)
  - Star ratings per response
  - Approve/Override actions

### Card 5: FAQ Knowledge Base Editor
- Full CRUD operations on FAQ collection
- Input fields: clean_question, answer, category, tags, keywords, intent, priority, escalate_if_uncertain
- Active index list with Edit/Delete actions
- Creates auto-announcement on FAQ update

### Card 6: Resolve Query Hub
- 5-section queue architecture:
  - Master Queue (FIFO chronological)
  - Unanswered Queue (0 responses, 24h stale)
  - Low-Rated Peer Response Queue (1-5 answers, all rated <= 3 stars)
  - Highly-Rated Peer Approval Queue (4-5 star responses)
  - Historical Resolution Archive
- Query detail panel with approve/override actions

### Card 7: AI-Assisted FAQ Suggestions
- Yellow alert state when unread suggestions exist (occurrenceCount >= 10)
- Displays: query pattern, hit count, impacted intern count, timestamps
- Actions: Dismiss, Add to FAQs (pre-populates Card 5 form)

---

## Moderator Dashboard (3-Card Layout)

### Card 1: Announcements
- View-only announcements (moderators cannot create)
- Yellow alert state when new announcements exist (< 24 hours old)
- State returns to normal upon opening the card
- Badge shows "NEW" with pulsing animation

### Card 2: Master Query Monitor
- Inherits full functionality from Admin Card 4
- Filter by status: All, Pending, Peer Answered, Ambiguous, Resolved
- Sort by date: Ascending/Descending
- Thread drawer with approve/override actions
- Moderator override labeled as "Moderator Intervention"

### Card 3: Resolve Query Hub
- Inherits full functionality from Admin Card 6
- 5-section queue: Master, Unanswered, Low-Rated, Highly-Rated, Archive
- Moderator can approve high-rated responses
- Moderator can submit official responses to override