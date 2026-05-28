# Query.in - Development Context

## Project Overview
- **Name:** Query.in
- **Type:** MERN Stack Crowd-sourced FAQ & P2P Query Resolution Platform
- **Stack:** MongoDB, Express.js, React (Vite), Node.js, Tailwind CSS, Socket.IO, Grok Cloud API

---

## Current Phase
**Phase 4: Authentication & RBAC**

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

### Next Actions
- Build response routes and controller
- Build no_faq routes for content gap tracking
- Build announcement routes for admin broadcasts
- Create documentation files (architecture.md, setup_guide.md, api_docs.md, database_schema.md)
- Build Admin, Moderator & Intern Dashboards (UI/UX)

---

## Milestones
1. ✅ Project Architecture & Planning
2. ✅ MERN Stack Setup & Foundation
3. ✅ Database & Backend APIs
4. ✅ Authentication & RBAC (current)
5. ⬜ Admin, Moderator & Intern Dashboards
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