# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Grok Cloud API

---

## Current Phase
**Phase 5: Admin, Moderator & Intern Dashboards (UI/UX) + Bug Fixes**

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
- Landing page (50/50 split, Explore FAQs + Login)
- Login page (calls /api/auth/login, redirects by role)
- DashboardLayout (collapsible sidebar, topbar with search/notifications)
- Admin dashboard (User Management, Broadcast, Query Monitor, FAQ DB, AI Suggestions)
- Moderator dashboard (Query Review, FAQs, Announcements)
- Intern dashboard (Announcements, FAQs, Ask AI, My Escalations, Peer Queue)
- React Router configured with protected routes
- publicApi.js created (separate axios for public routes without 401 redirect)
- Public FAQs page (/faqs) with accordion category grouping
- FAQs display grouped by category with collapsible dropdowns
- Smooth rounded corners (rounded-lg) applied to cards and buttons

### Resolved Issues
- Fixed: Explore FAQs button redirected to login instead of FAQ page
- Fixed: Auth interceptor redirected to login on 401 for public routes (created publicApi.js)
- Fixed: FAQs page now shows all 125 FAQs from database in accordion format
- Fixed: Cards and buttons now have smooth rounded corners
- Fixed: Login redirect loop - ProtectedRoute now checks localStorage directly to avoid race condition, added 50ms delay before navigation

### Next Actions
- Build response routes and controller
- Build no_faq routes for content gap tracking
- Build announcement routes for admin broadcasts
- Implement RAG search and Grok LLM fallback
- Build Peer Escalation Workflow Engine
- Build AI FAQ Suggestion Engine
- Implement Realtime Notifications & Queue System
- Create documentation files (architecture.md, setup_guide.md, api_docs.md)

---

## Milestones
1. ✅ Project Architecture & Planning
2. ✅ MERN Stack Setup & Foundation
3. ✅ Database & Backend APIs
4. ✅ Authentication & RBAC
5. ✅ Admin, Moderator & Intern Dashboards
6. ⬜ RAG & Grok LLM Integration
7. ⬜ Peer Escalation Workflow Engine
8. ⬜ AI FAQ Suggestion Engine
9. ⬜ Realtime Notifications & Queue System
10. ⬜ Automated Testing Suite
11. ⬜ Documentation Engine

---

## Issues & Notes
- MongoDB Atlas URI: mongodb+srv://admin:myPassword123@faq.jlohvqi.mongodb.net/faq_escalation
- Test accounts: admin@query.in, mod@query.in, intern1@query.in, intern2@query.in (passwords in testCredentials.md)
- publicApi.js used for public routes (no auth interceptor)
- default api.js used for authenticated routes