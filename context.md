# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API

---

## Current Phase
**Phase 6: RAG & LLM Integration**

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
- FAQ routes and controller implemented (getAllFAQs, createFAQ, searchFAQs)
- Query routes and controller implemented (submitQuery, getAllQueries, getQueryById)
- server.js updated to mount API routes and connect to MongoDB Atlas
- MongoDB Atlas URI configured in .env
- 125 VINS FAQs seeded into database
- Auth controller implemented (login, register, getMe) with JWT and bcrypt
- RBAC middleware implemented (protect, authorizeRoles)
- Auth routes mounted at /api/auth
- testCredentials.md created with 4 test accounts
- AuthContext created (JWT state management, localStorage persistence)
- ProtectedRoute wrapper component (role-based route guarding)
- Axios interceptor utility configured (auto-attaches JWT, handles 401)
- Badge component (pill-shaped status badges: outline, filled, verified, ambiguous)
- FormattedAnswer component (bullet points, paragraphs, bold keywords)
- Landing page (50/50 split, Explore FAQs + Login embedded)
- Login page removed - login embedded in Landing page
- DashboardLayout (collapsible sidebar, topbar with search/notifications)
- Admin dashboard (User Management, Broadcast, Query Monitor, FAQ DB, AI Suggestions)
- Moderator dashboard (Query Review, FAQs, Announcements)
- Intern dashboard (Announcements, FAQs, Ask AI, My Escalations, Peer Queue)
- React Router configured with protected routes
- publicApi.js created (separate axios for public routes without 401 redirect)
- Public FAQs page (/faqs) with accordion category grouping
- FAQs display grouped by category with collapsible dropdowns
- Smooth rounded corners (rounded-lg) applied to cards and buttons
- AskAI routes and controller (autoComplete, askAI endpoints)
- Gemini LLM service (sanity check, context synthesis with temperature 0.1)
- Intern AskAI page (/intern/ask) with live auto-complete dropdown
- RAG database search (keyword matching on search_text, tags, keywords)
- LLM fallback pipeline with upvote/downvote flow
- Peer escalation on downvote (writes to Queries collection)
- Gemini API key configured in .env (model: gemini-2.5-flash)
- Auto-complete closes on Enter key press
- RAG downvote triggers LLM fallback before escalation
- Frontend handles LLM response after rag_downvote (pending_feedback state)

### Resolved Issues
1. Fixed: Explore FAQs button redirected to login instead of FAQ page
2. Fixed: Auth interceptor redirected to login on 401 for public routes (created publicApi.js)
3. Fixed: FAQs page now shows all 125 FAQs from database in accordion format
4. Fixed: Cards and buttons now have smooth rounded corners
5. Fixed: Login redirect loop - ProtectedRoute now checks localStorage directly to avoid race condition
6. Fixed: Auto-complete dropdown not closing on Enter key
7. Fixed: RAG downvote now triggers LLM before escalation (not direct peer escalation)
8. Fixed: Auto-complete now uses consistent RAG matching across search_text, tags, and keywords
9. Fixed: LLM service updated from Grok to Groq to Gemini API
10. Fixed: Gemini API v1beta 404 error - switched to v1 REST API
11. Fixed: Mongoose deprecated `new: true` → `returnDocument: 'after'`
12. Fixed: Frontend not handling pending_feedback after rag_downvote triggers LLM

### Next Actions
- Build response routes and controller
- Build no_faq routes for content gap tracking
- Build announcement routes for admin broadcasts
- Build Peer Escalation Workflow Engine (5-peer answer cap, 24hr timeout)
- Build AI FAQ Suggestion Engine (no_faq alert at 10+ hits)
- Implement Realtime Notifications & Queue System
- Create documentation files (architecture.md, setup_guide.md, api_docs.md)

---

## Milestones
1. ✅ Project Architecture & Planning
2. ✅ MERN Stack Setup & Foundation
3. ✅ Database & Backend APIs
4. ✅ Authentication & RBAC
5. ✅ Admin, Moderator & Intern Dashboards
6. ✅ RAG & LLM Integration (current)
7. ⬜ Peer Escalation Workflow Engine
8. ⬜ AI FAQ Suggestion Engine
9. ⬜ Realtime Notifications & Queue System
10. ⬜ Automated Testing Suite
11. ⬜ Documentation Engine

---

## Issues & Notes
- MongoDB Atlas URI: mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation
- Gemini API Key: AIzaSyAJH1lbg29Egb4CifLCVVSaPjxz2mZ-lIM
- Gemini Model: gemini-2.5-flash (uses REST API v1)
- Test accounts: admin@query.in, mod@query.in, intern1@query.in, intern2@query.in (passwords in testCredentials.md)
- publicApi.js used for public routes (no auth interceptor)
- default api.js used for authenticated routes

---

## Ask AI Pipeline Flow
1. **Phase 0 (Auto-complete):** As user types, debounced search suggests matching FAQs
2. **Phase 1 (RAG Search):** On submit, keyword matching on search_text/tags/keywords
   - If match >50%: Return RAG answer with upvote/downvote
   - If no match: Trigger LLM
3. **Phase 2 (LLM Fallback):** Gemini synthesizes answer from FAQ context
   - Sanity check: Reject gibberish
   - Context synthesis: Inject FAQ knowledge base with temperature 0.1
   - If upvote: Resolve
   - If downvote: Escalate to peer queue
4. **Phase 3 (Peer Escalation):** Query written to Queries collection with status Pending