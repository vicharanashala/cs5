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

## 5. Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin@1234 |
| Moderator | mod@query.in | Mod@1234 |
| Moderator | mod2@query.in | Mod2!1234 |
| Intern 1 | intern1@query.in | Intern1@1234 |
| Intern 2 | intern2@query.in | Intern2@1234 |
| Intern 3 | intern3@query.in | Intern3@1234 |
| Intern 4-10 | intern{N}@query.in | Intern{N}!234 |

**Password Requirements:** 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (`!@#$%^&*`, etc.)

---

## 6. Project Structure

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

## 7. LLM Configuration Details

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

## 8. Active Query Cap

- Each intern can have **max 5 unresolved queries** in the peer queue
- When cap is reached, new escalations are blocked with `QUERY_CAP_REACHED` error
- Resolving (rating) existing queries frees up slots

---

## 8b. 24-Hour Sweeper Automation

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

## 9. Admin & Moderator Page Structure

Admin and Moderator dashboards use a page-based structure with sidebar navigation:

**Admin Pages:**
| Route | Purpose |
|-------|---------|
| /admin | Dashboard overview with navigation cards |
| /admin/registration | User registration |
| /admin/announcement | Publish announcements |
| /admin/users | User management |
| /admin/queries | Query monitor |
| /admin/faqs | FAQ editor |
| /admin/resolve | Resolve hub (includes Pending Resolution, Stagnant, Unanswered, Low-Rated, Archive) |
| /admin/suggestions | AI suggestions |
| /admin/spoiled-users | Users with warnings and credibility tracking |

**Moderator Pages:**
| Route | Purpose |
|-------|---------|
| /moderator | Dashboard overview |
| /moderator/queries | Query monitor |
| /moderator/resolve | Resolve hub (includes Pending Resolution, Unanswered, Low-Rated, Archive) |

---

## 10. Resolve Hub Sections

The Admin/Moderator Resolve Hub presents 5 sections for query resolution:

| Section | Filter |
|---------|--------|
| Pending Resolution | Queries with high-rated responses (rating >= 4) OR ambiguous queries (3-strike rule) |
| Stagnant (0 answers) | is_locked=true, responses=0 (sweeper-triggered) |
| Unanswered | status != 'Resolved', responses=0 |
| Low-Rated | 5 responses, all rating < 4 |
| Archive | status = 'Resolved' |

---

## 10. Common Issues & Solutions

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

## 11. Development Workflow

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

## 12. Production Deployment

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

## 13. Backend Logs

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