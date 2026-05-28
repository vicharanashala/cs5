# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Gemini LLM API

---

## Current Phase
**Phase 7: Peer Escalation Workflow Engine**

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
- **Intern Pages:** PeerQueue, MyEscalations, ViewFAQs, Announcements

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

### Next Actions
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
6. ✅ RAG & LLM Integration
7. ✅ Peer Escalation Workflow Engine (current)
8. ⬜ AI FAQ Suggestion Engine
9. ⬜ Realtime Notifications & Queue System
10. ⬜ Automated Testing Suite
11. ⬜ Documentation Engine

---

## Issues & Notes
- MongoDB Atlas URI: mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation
- Gemini API Key: AIzaSyAJH1lbg29Egb4CifLCVVSaPjxz2mZ-lIM
- Gemini Model: gemini-2.5-flash (uses REST API v1)
- Test accounts: admin@query.in, mod@query.in, intern1@query.in, intern2@query.in

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### FAQs
- `GET /api/faqs` - Get all FAQs
- `GET /api/faqs/search` - Search FAQs
- `POST /api/faqs` - Create FAQ (admin)

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
- `POST /peer/ambiguous` - Mark query as ambiguous (3-strike rule)

### Ratings
- `POST /api/ratings/:id` - Rate a peer response (1-5 stars)

### Admin
- `GET /api/admin/escalated` - Get escalated queries
- `POST /api/admin/approve` - Approve peer response
- `POST /api/admin/override` - Admin override answer

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)