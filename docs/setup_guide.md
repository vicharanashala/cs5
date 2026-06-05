# Query.in - Setup Guide

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd "faq project"
```

---

## 2. Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Create Environment File

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/faq_escalation

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Gemini AI Configuration (tries in order: 3.5-flash -> 3.1-pro -> 3.1-flash-lite -> 2.5-flash -> 2.5-pro)
GEMINI_API_KEY=your-gemini-api-key

# Groq API Configuration (fallback when Gemini fails, tries: llama-3.3-70b -> llama-3.1-8b -> llama-4-scout -> qwen3-32b -> gpt-oss-120b -> gpt-oss-20b)
GROQ_API_KEY=your-groq-api-key

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 2.4 Start the Backend Server

```bash
# Development mode (with nodemon auto-restart)
npm run dev

# Production mode
npm start
```

**Expected Output:**
```
🚀 Query.in server running on port 5000
📡 Environment: development
✅ MongoDB Connected: ac-xxx.mongodb.net
[Sweeper] 24-hour SLA sweeper started
```

---

## 3. Frontend Setup

### 3.1 Open a New Terminal

### 3.2 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Create Environment File

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3.5 Start the Frontend Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 4. Verify Installation

### 4.1 Health Check

Visit: `http://localhost:5000/health`

Should return:
```json
{"status":"ok","timestamp":"2026-05-28T..."}
```

### 4.2 Access the Application

Open browser to: `http://localhost:5173`

---

## 5. Internet Testing with ngrok (Optional)

To test the application over the internet or with mobile devices, use ngrok to create secure tunnels.

### 5.1 Start Backend Tunnel
```bash
ngrok http 5000
```
Note the `https://...ngrok-free.app` URL provided for the backend.

### 5.2 Update Frontend Environment
In `frontend/.env`, set `VITE_API_URL` to the backend ngrok URL:
```env
VITE_API_URL=https://your-backend-url.ngrok-free.app/api
```

### 5.3 Start Frontend Tunnel
```bash
ngrok http 5173
```
Note the `https://...ngrok-free.app` URL provided for the frontend. Share this URL with your testers.

*Note: The backend CORS and Vite configuration are already set up to allow ngrok hosts (`server.allowedHosts: true` in vite.config.js).*

---

## 6. Test Accounts

**Pattern:** `{role}{number}@query.in` / `{Role}{number}@123`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin1@123 |
| Moderator | mod1@query.in | Mod1@123 |
| Moderator | mod2@query.in | Mod2@123 |
| Intern | intern1@query.in | Intern1@123 |
| Intern | intern2@query.in | Intern2@123 |
| Intern | intern3@query.in | Intern3@123 |
| Intern | intern4@query.in | Intern4@123 |
| Intern | intern5@query.in | Intern5@123 |
| Intern | intern6@query.in | Intern6@123 |
| Intern | intern7@query.in | Intern7@123 |
| Intern | intern8@query.in | Intern8@123 |
| Intern | intern9@query.in | Intern9@123 |
| Intern | intern10@query.in | Intern10@123 |

---

## 7. Database Seeding (Demo Data)

To quickly populate the database with realistic demo data (users, queries, responses, announcements, etc.) based on the VINS internship workflow, run the seed script:

```bash
cd backend
npm run seed
```
**Warning:** This will delete all existing data in your database except for the `faqs` collection.

---

## 8. Project Structure

```
faq project/
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
│   ├── jobs/
│   │   └── sweeper.js         # 24-hour cron job
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Query.js
│   │   ├── Response.js
│   │   ├── FAQ.js
│   │   ├── NoFaq.js
│   │   ├── Announcement.js
│   │   └── Notification.js
│   ├── routes/
│   ├── services/
│   │   └── grokService.js     # LLM service (Gemini + Groq)
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
├── docs/
├── README.md
├── context.md
└── prompt.md
```

---

## 9. LLM Configuration Details

### Gemini Models (Primary)

| Model | Priority | Use Case |
|-------|----------|----------|
| gemini-3.5-flash | 1 | Default, text, multimodal |
| gemini-3.1-pro-preview | 2 | Complex reasoning |
| gemini-3.1-flash-lite | 3 | Cost-efficient |
| gemini-2.5-flash | 4 | Legacy stable |
| gemini-2.5-pro | 5 | Legacy heavy |

### Groq Models (Fallback - Free Tier)

| Model | Priority | Use Case |
|-------|----------|----------|
| llama-3.3-70b-versatile | 1 | Deep reasoning |
| llama-3.1-8b-instant | 2 | Quick chat |
| llama-4-scout-17b | 3 | **Multimodal (images)** |
| qwen3-32b | 4 | Coding |
| gpt-oss-120b | 5 | Step-by-step reasoning |
| gpt-oss-20b | 6 | Lighter tasks |

### LLM Settings

| Setting | Value |
|---------|-------|
| Max Output Tokens | 2000 |
| Temperature | 0.1 |
| Timeout | 60 seconds |
| Response Format | Plain text only (no emojis, no formatting) |

---

## 10. Active Query Cap

- Each intern can have **max 5 unresolved queries** in the peer queue
- When cap is reached, new escalations are blocked with `QUERY_CAP_REACHED` error
- Resolving (rating) existing queries frees up slots

---

## 11. 24-Hour Sweeper Automation

The sweeper runs every 15 minutes to enforce SLA timeouts:

**Scenario A - Stagnant (0 answers):**
- Query has 0 responses for 24+ hours
- Sweeper locks query → enters "Stagnant Queue"
- Resolution: Admin override required

**Scenario B - Low-Rated Partial:**
- Query has 1-4 responses, all rated 1-3 stars, for 24+ hours
- Sweeper locks query → enters "Low-Rated Queue"
- Resolution: Admin can approve or override

---

## 12. Admin & Moderator Page Structure

Admin and Moderator dashboards use a page-based structure with sidebar navigation:

**Admin Pages:**
| Route | Purpose |
|-------|---------|
| /admin | Dashboard overview with navigation cards (User Management, Announcements, FAQ Editor, Query Management, Analytics) |
| /admin/users | Combined: User registration, User list with warnings (0=green, 1+=yellow, 5=red), Active/Inactive toggle |
| /admin/announcement | Publish announcements |
| /admin/faqs | FAQ editor |
| /admin/resolve | Query Management (includes Pending Resolution, Ambiguous, Stagnant, Low-Rated, Archive, Moderator Suggested) |
| /admin/analytics | AI performance comparison, bottleneck analysis, and human intervention metrics with visualizations |

**Moderator Pages:**
| Route | Purpose |
|-------|---------|
| /moderator | Dashboard overview with clickable stat cards |
| /moderator/announcements | View announcements with priority indicators |
| /moderator/resolve | Query Management (renamed from Resolve Hub, includes Pending Resolution, Stagnant, Low-Rated, Archive) |
| /moderator/notifications | Full notifications list |

---

## 13. Resolve Hub Sections

The Admin/Moderator Resolve Hub presents 6 sections for query resolution:

| Section | Filter |
|---------|--------|
| Pending Resolution | High-rated queries (rating >= 4), excludes Ambiguous |
| Ambiguous Queries | status = 'Ambiguous' (3-strike rule triggered), can delete these |
| Stagnant (Locked, 24h+) | 1-4 responses, ALL 1-3★, created 24+ hours ago |
| Low-Rated | 5 responses, all rating < 4 |
| Archive | status = 'Resolved' |
| Moderator Suggested | Pending FAQ suggestions from moderators |

---

## 14. Common Issues & Solutions

### MongoDB Connection Failed

**Error:** `MongoNetworkError` or `MongoTimeoutError`

**Solution:**
1. Add your IP to Atlas whitelist (0.0.0.0/0 for testing)
2. Verify credentials in MONGO_URI
3. Check cluster name in connection string

### LLM API Errors

**Error:** `Resource has been exhausted` or `API_KEY_INVALID`

**Solution:**
1. Check Gemini key at https://makersuite.google.com/app/apikey
2. Check Groq key at https://console.groq.com/keys
3. System auto-switches to fallback model

### CORS Errors

**Solution:**
1. Verify CLIENT_URL in backend .env
2. Include `http://` or `https://`
3. No trailing slash

### Port Already in Use

```bash
# Find process on port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process_id> /F
```

---

## 15. Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: description"

# 3. Push to remote
git push origin feature/my-feature

# 4. Merge when ready
git checkout main
git merge feature/my-feature
```

---

## 16. Production Deployment

### Backend
```bash
export NODE_ENV=production
export MONGO_URI=your-production-mongo-uri
export JWT_SECRET=your-production-secret
export GEMINI_API_KEY=your-gemini-key
export GROQ_API_KEY=your-groq-key
npm start
```

### Frontend
```bash
VITE_API_URL=https://api.query.in npm run build
# Serve dist/ with nginx
```

---

## 17. Backend Logs

LLM calls are logged with format:
```
✅ [GEMINI] Model: gemini-3.5-flash | Stage: synthesis
📤 [GEMINI] Model: gemini-3.5-flash | Response length: 1250 chars
⚠️ [GEMINI] Model: gemini-2.5-flash | Synthesis failed: timeout
🚫 [GEMINI] Model: gemini-1.5-pro | ERROR: Cannot read "image.png" (this model does not support image input)
🔄 All Gemini models failed, trying Groq...
📊 [ANALYTICS] intern:xxx | llm_resolved | {"model":"gemini-3.5-flash","stage":"gemini"}
⚠️ [ANALYTICS] intern:xxx | cap_blocked | {"cap":5}
```

---

## 18. Design System (UI/UX Modernization)

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | #FAFAFA | Page background |
| Surface | #FFFFFF | Card/modal surfaces |
| Black | #000000 | Primary text, buttons, borders |
| White | #FFFFFF | Text on dark backgrounds |
| Highlight | #FFD000 | Alerts, emphasis, important actions |
| Gold | #FFD700 | Rating stars |
| Error Red | #DC2626 | Critical warnings, errors |

### Typography

| Size | Class | Usage |
|------|-------|-------|
| 12px | text-xs | Badges, timestamps |
| 14px | text-sm | Body text |
| 16px | text-base | Emphasis, labels |
| 18px | text-lg | Headings |
| 24px | text-xl | Page titles |

### Spacing & Layout

- 8px spacing rhythm (py-2, py-3, py-4)
- Cards: rounded-xl (16px corners), shadow-md, border border-black
- Page sections: space-y-4 to space-y-6
- Buttons: rounded-xl with hover transitions

### Component Styling

| Component | Styling |
|-----------|---------|
| Primary Buttons | bg-black text-white hover:bg-gray-800 rounded-xl shadow-md border border-black |
| Secondary Buttons | bg-white text-black border border-black hover:bg-gray-50 rounded-xl shadow-md |
| Cards | bg-surface rounded-xl shadow-md border border-black p-4 |
| Alerts/Highlights | bg-highlight text-black rounded-xl shadow-md |
| Error Alerts | bg-red-50 text-red-700 border-l-4 border-red-600 rounded-xl |
| Gold Stars | text-[#FFD700] for rating stars |
| Form Inputs | border border-black rounded-lg focus:ring-2 focus:ring-black |

### User Experience

- **No Text Cursor on Click**: Global user-select: none prevents cursor on click
- **FAQ Deep Linking**: Popular FAQs link to specific FAQ with scroll-to-highlight
- **All Notifications Page**: Dedicated `/notifications` page for viewing all notifications
- **Announcement Timestamps**: Full timestamp display with date AND time ("Jun 3, 2026 • 10:47 PM")
- **Clean Header**: No global search bar; notification bell and user badge right-aligned