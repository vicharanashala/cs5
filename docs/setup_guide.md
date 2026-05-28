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
# Replace <user>, <pass>, <cluster> with your Atlas credentials
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/faq_escalation

# JWT Configuration
# Use a strong, random string for production
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Gemini AI Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 2.4 Start the Backend Server

```bash
# Development mode (with auto-restart on file changes)
npm run dev

# OR Production mode
npm start
```

**Expected Output:**
```
🚀 Query.in server running on port 5000
📡 Environment: development
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
# Backend API URL
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
| Admin | admin@query.in | Admin@123 |
| Moderator | mod@query.in | Mod@123 |
| Intern 1 | intern1@query.in | Intern1@123 |
| Intern 2 | intern2@query.in | Intern2@123 |

---

## 6. Project Structure

```
faq project/
├── backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── socket.js      # Socket.IO configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── faqController.js
│   │   ├── queryController.js
│   │   ├── askAIController.js
│   │   ├── peerController.js
│   │   ├── ratingController.js
│   │   ├── adminController.js
│   │   ├── announcementController.js
│   │   └── analyticsController.js
│   ├── jobs/
│   │   └── sweeper.js     # 24-hour cron job
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Query.js
│   │   ├── Response.js
│   │   ├── FAQ.js
│   │   ├── NoFaq.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── faqRoutes.js
│   │   ├── queryRoutes.js
│   │   ├── askAIRoutes.js
│   │   ├── peerRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   └── geminiService.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── docs/
├── README.md
├── context.md
└── prompt.md
```

---

## 7. Common Issues & Solutions

### MongoDB Connection Failed

**Error:** `MongoNetworkError` or `MongoTimeoutError`

**Solution:**
1. Check your Atlas network whitelist (allow IP 0.0.0.0/0 for testing)
2. Verify username/password in MONGO_URI
3. Ensure your cluster name is correct in the connection string

### Gemini API Errors

**Error:** `Resource has been exhausted` or `API_KEY_INVALID`

**Solution:**
1. Verify your Gemini API key is correct
2. Check your quota at https://makersuite.google.com/app/apikey
3. Ensure you have available credits

### CORS Errors

**Error:** `Access-Control-Allow-Origin` blocked

**Solution:**
1. Verify CLIENT_URL in backend .env matches frontend URL exactly
2. Include `http://` or `https://` in the URL
3. No trailing slash

### Port Already in Use

**Error:** `EADDRINUSE` on port 5000 or 5173

**Solution:**
```bash
# Find process on port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process_id> /F
```

---

## 8. Development Workflow

```bash
# 1. Always work on a feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: description"

# 3. Push to remote
git push origin feature/my-feature

# 4. Merge to main when ready
git checkout main
git merge feature/my-feature
```

---

## 9. Production Deployment

### Backend
```bash
# Set environment variables
export NODE_ENV=production
export MONGO_URI=your-production-mongo-uri
export JWT_SECRET=your-production-secret
export GEMINI_API_KEY=your-production-key

# Build and start
npm run build  # if using TypeScript or bundler
npm start
```

### Frontend
```bash
# Set VITE_API_URL to production backend
VITE_API_URL=https://api.query.in npm run build

# Serve the dist/ folder with nginx or similar
```

---

## 10. Useful Commands

```bash
# Backend logs
npm run dev 2>&1 | Tee-Object -FilePath logs.txt

# Check MongoDB connection
mongosh "your-connection-string"

# Clear all data (development only)
db.dropDatabase()  # in mongo shell
```