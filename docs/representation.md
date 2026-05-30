# Query.in - Problem Statement & Solution

## Problem Statement

### 1. Query Repetition
- **Problem:** Multiple interns ask the same questions repeatedly, leading to redundant effort and wasted resources
- **Impact:** RAG search finds same matches, LLM generates similar answers repeatedly
- **Result:** Knowledge base not effectively utilized, time wasted on duplicate queries

### 2. Delay in Answer
- **Problem:** Interns wait for extended periods to get answers to their queries
- **Impact:** When FAQ doesn't match, user waits for LLM response; if LLM fails, they wait for peer responses
- **Result:** Poor user experience, reduced productivity, potential dropout

### 3. Workload on Admin
- **Problem:** Admin bears the brunt of resolving all escalated queries manually
- **Impact:** With hundreds of interns and thousands of queries, admin becomes bottleneck
- **Result:** Slow resolution times, admin burnout, system inefficiency

### 4. Ambiguous Queries and Answers
- **Problem:** Unclear questions lead to irrelevant responses; low-quality answers waste everyone's time
- **Impact:** Peers spend time answering questions that don't make sense; query authors get useless responses
- **Result:** 3-strike rule triggers, query locks, intern frustration, FAQ suggestions polluted with garbage

---

## Solutions Implemented

### Solution 1: Query Repetition → RAG-Based Auto-Complete & FAQ Knowledge Base

**Features Implemented:**
- **Auto-complete Suggestions:** As interns type, system shows matching FAQs in real-time (300ms debounce)
- **RAG Search:** MongoDB text index on `search_text`, `tags`, `keywords` finds matching FAQs with confidence scoring
- **FAQ Database:** 125+ pre-loaded FAQs covering common topics
- **Instant Resolution:** User selecting autocomplete suggestion = immediate answer without LLM
- **No-FAQ Tracking:** Queries that fail RAG/LLM are tracked; 10+ occurrences trigger FAQ suggestion

**Workflow:**
```
User types query
       ↓
Auto-complete suggestions appear (RAG keyword match)
       ↓
User selects suggestion? → YES → Instant FAQ answer (source: 'autocomplete')
       ↓ NO
Submit full query → RAG Search → Match found? → YES → FAQ answer for upvote/downvote
                            ↓ NO
                        LLM Fallback → Answer with upvote/downvote
```

---

### Solution 2: Delay in Answer → Multi-Provider LLM Pipeline with Peer Escalation

**Features Implemented:**
- **Gemini LLM:** Primary AI provider with 5 models (3.5-flash → 3.1-pro → 3.1-flash-lite → 2.5-flash → 2.5-pro)
- **Groq LLM:** Free-tier fallback with 6 models (llama-3.3-70b → llama-3.1-8b → llama-4-scout → qwen3-32b → ...)
- **Automatic Fallback:** If one model fails/times out, system switches to next model seamlessly
- **Peer Queue:** Interns can answer others' queries (max 5 responses per query)
- **Real-time Notifications:** Socket.IO alerts when peer answers query

**Workflow:**
```
Query submitted → RAG search → No match → LLM Pipeline
                                      ↓
                          Try Gemini models (in order)
                              ↓ Fail/Timeout
                          Try Groq models (in order)
                              ↓ Fail
                      Escalate to Peer Queue

Peer Queue → Intern sees query → Submits answer → Notification to query author
                                            ↓
                              Query author rates (1-5 stars)
                                            ↓
                              4-5 stars → Highly-Rated Queue (admin review)
                              1-3 stars → More peers can answer (max 5)
                              3 ambiguous marks → Query locked, intern notified
```

---

### Solution 3: Workload on Admin → Peer Rating System & Automated Resolution

**Features Implemented:**
- **Peer Rating (1-5 stars):** Query authors rate peer answers
- **High-Rating Lock:** 5-star rating immediately locks query for admin review
- **Low-Rating Lock:** 1-3 stars with 5 responses locks query for admin review
- **24-Hour Sweeper:** Automated cron job locks stale queries (0 responses or all low-rated after 24hrs)
- **5-Section Resolve Hub:** Admin/Moderator can batch-process queries by category
- **Bulk Operations:** Approve/Override actions with page refresh

**Workflow:**
```
Peer Answer submitted
       ↓
Query author rates (1-5 stars)
       ↓
┌─────────────────────────────────────┐
│ 5 stars → Query LOCKED → Highly-Rated Queue
│ 4 stars → Query OPEN → Highly-Rated Queue (not locked)
│ 1-3 stars + 5 responses → Query LOCKED → Low-Rated Queue
│ 0 responses + 24hrs → Query LOCKED → Stagnant Queue
└─────────────────────────────────────┘
       ↓
Admin/Moderator reviews from Resolve Hub
       ↓
Approve peer response OR Admin override
       ↓
Query RESOLVED → Notification to intern
       ↓
Optional: "Add to FAQ" creates permanent entry
```

---

### Solution 4: Ambiguous Queries → 3-Strike Rule & Input Validation

**Features Implemented:**
- **Query Input Sanity Check:** Frontend + Backend validation blocks garbage inputs
  - Minimum 4 actual letters, special char ratio < 30%, no 3+ repeated characters
  - At least 3 consecutive letters, 4-6 unique letters required, pattern detection
- **Ambiguous Marking:** Peers can mark query as unclear
- **3-Strike Rule:** 3 different peers marking ambiguous → Query becomes `Ambiguous`, `is_locked: true`
- **Intern Notification:** When query becomes ambiguous, intern receives notification to rephrase
- **Rating System:** Query authors rate responses, ensuring quality feedback

**Workflow:**
```
Query enters Peer Queue
       ↓
Peer reviews query → Clear? → Submit answer
       ↓ Unclear
Peer marks "Mark as Ambiguous"
       ↓
Strike 1/2 → "Marked as ambiguous. Strike X/3"
       ↓ Strike 3
Query becomes AMBIGUOUS → is_locked: true
       ↓
Intern notified: "Your query was unclear. Please rephrase and submit again."
       ↓
Admin reviews in Ambiguous section → Override with clarification
       ↓
Query RESOLVED
```

---

## Complete Query Lifecycle Workflow

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
└─ User selects → instant resolution (source: 'autocomplete')

STEP 1: RAG SEARCH (on submit)
│
├─ User submits full question → POST /api/ask
├─ RAG keyword matching (search_text, tags, keywords)
├─ Match confidence > 50%?
│   ├─ YES → Return FAQ answer for upvote/downvote
│   │       ├─ UPVOTE → Resolution logged (RAG_RESOLVED), query ends
│   │       └─ DOWNVOTE → Go to STEP 2 (LLM Fallback)
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
├─ 5 stars → Query immediately locked
│   └─ Escalates to Admin "Highly-Rated Queue"
│
├─ 4 stars → Query escalates to "Highly-Rated Queue" (NOT locked)
│
├─ 1-3 stars (LOW) + 5 responses filled → Query locked
│   └─ Escalates to Admin "Low-Rated Queue"
│
└─ Ambiguous: 3 different peers mark query as ambiguous
    └─ Query status → 'Ambiguous', is_locked: true
    └─ Intern notified: "Your query was unclear. Please rephrase."

STEP 6: ADMIN RESOLUTION
│
├─ Admin views escalated queries (Resolve Hub - 5 sections)
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

## Visual Flow Chart

```
                          ┌──────────────────┐
                          │   Intern Types   │
                          │   in AskAI Box   │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
               [2+ chars]                    [Submit]
                    │                             │
                    ▼                             ▼
    ┌─────────────────────────────┐    ┌─────────────────┐
    │   Auto-Complete Dropdown    │    │  Query Form     │
    │   (RAG search, 5 matches)   │    │  Validation     │
    └─────────────┬───────────────┘    └────────┬────────┘
                  │                              │
       [Select]        [No Match]          [Valid?]
          │                │                   │
          │                │              ┌────┴────┐
          │                │              │         │
         YES               NO             NO       YES
          │                │              │         │
          ▼                ▼              │         ▼
    ┌──────────┐    ┌──────────────┐    │  ┌──────────────┐
    │ Instant  │    │ POST /api/ask │    │  │  RAG Search   │
    │ FAQ Res │    │  (Full Query) │    │  └──────┬───────┘
    └──────────┘    └──────┬───────┘    │         │
                          │            │    [Match?]
                    ┌─────┴─────┐      │         │
                    │           │      │    ┌────┴────┐
                   NO          YES     │    │         │
                    │           │      │   NO       YES
                    ▼           ▼      │    │         │
           ┌───────────────┐   │      │    │         ▼
           │  LLM Pipeline │   │      │    │  ┌─────────────┐
           │  (Gemini/Groq)│   │      │    │  │ Upvote/Down │
           └───────┬───────┘   │      │    │  └──────┬──────┘
                   │           │      │    │         │
              [Fail]      [Success]    │    │    [Vote?]
                   │           │        │    │         │
                   ▼           ▼        │    ├─────────┤
           ┌─────────────┐   │          │ UPVOTE    DOWNVOTE
           │Peer Queue   │   │          │    │         │
           │ (Pending)   │   │          │    │         ▼
           └──────┬──────┘   │          │    │   ┌───────────┐
                  │          │          │    │   │ LLM Fallb │
                  ▼          ▼          │    │   └─────┬─────┘
           ┌─────────────────────────┐   │    │         │
           │   Peer Queue Display    │   │    │    [Fail?]
           └────────────┬────────────┘   │    │         │
                        │                 │    ├─────────┤
                        ▼                 │   NO        YES
              ┌──────────────────┐       │    │         │
              │  Intern Answers  │       │    │         ▼
              │  (Max 5 peers)   │       │    │  ┌────────────┐
              └────────┬─────────┘       │    │  │Peer Queue │
                       │                 │    │  │ (Pending) │
                       ▼                 │    │  └─────┬──────┘
           ┌─────────────────────┐       │    │        │
           │ Notification sent   │       │    │        ▼
           │ to Query Author     │       │    │  [Response]
           └──────────┬──────────┘       │    │         │
                      │                  │    │         ▼
                      ▼                  │    │  ┌──────────────┐
           ┌────────────────────┐        │    │  │ Rate 1-5 ★  │
           │ Query Author Rates │        │    │  └──────┬───────┘
           └──────────┬─────────┘        │    │         │
                      │                   │    │    [Rating]
                      ▼                   │    │         │
           ┌─────────────────────┐        │    ├─────────┤
           │  5 ★ → Locked       │        │  5★      1-3★
           │  4 ★ → High-Rated   │        │  │         │
           │  1-3★ → Open        │        │  ▼         ▼
           └──────────┬──────────┘        │ ┌────────┐  ┌────────┐
                      │                   │ │Lock+HR │  │  Open  │
         ┌────────────┼────────────┐     │ │ Queue  │  │  for   │
         │            │            │     │ └────────┘  │  more  │
    [5 responses]  [24hr+]   [3 strikes]    │            └────────┘
         │            │            │
         ▼            ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Low     │  │ Stagnant │  │ Ambiguous│
   │  Rated   │  │  (0 ans) │  │ (locked) │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │   RESOLVE HUB      │
           │  (Admin/Moderator) │
           ├─────────────────────┤
           │ • Pending Resolution│
           │ • Stagnant (0 ans)  │
           │ • Unanswered       │
           │ • Low-Rated        │
           │ • Archive           │
           └────────┬────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
   ┌───────────┐       ┌─────────────┐
   │  Approve  │       │   Override  │
   │  (Peer)   │       │   (Admin)   │
   └─────┬─────┘       └──────┬──────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
           ┌──────────────┐
           │   RESOLVED   │
           └──────────────┘
                  │
                  ▼
          [+ Add to FAQ]
                  │
                  ▼
           ┌──────────────┐
           │ FAQ Database │
           └──────────────┘
```

---

## Features Summary

### Features Solving Core Problems

| Problem | Feature | Description |
|---------|---------|-------------|
| **Query Repetition** | RAG Auto-complete | Real-time suggestions as user types |
| **Query Repetition** | FAQ Knowledge Base | 125+ pre-loaded FAQs, searchable |
| **Query Repetition** | No-FAQ Tracking | Tracks unanswerable queries for FAQ suggestions |
| **Delay in Answer** | Multi-Provider LLM | Gemini + Groq with automatic fallback |
| **Delay in Answer** | Peer Queue | Interns answer unresolved queries |
| **Delay in Answer** | Real-time Notifications | Instant alerts for new peer answers |
| **Workload on Admin** | Peer Rating System | 1-5 stars with lock triggers |
| **Workload on Admin** | 24-Hour Sweeper | Automated cron locks stale queries |
| **Workload on Admin** | 5-Section Resolve Hub | Batch processing by category |
| **Workload on Admin** | Admin Override | Direct answer capability |
| **Ambiguous Queries** | Input Validation | Blocks garbage inputs before processing |
| **Ambiguous Queries** | 3-Strike Rule | 3 peers marking ambiguous → auto-lock |
| **Ambiguous Queries** | Intern Notification | Alerts when query marked unclear |

### Other Key Features

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure login with bcrypt password hashing |
| **RBAC Middleware** | Role-based access (Admin, Moderator, Intern) |
| **Query Cap** | Max 5 unresolved queries per intern |
| **Spam Prevention** | Similar query detection via regex |
| **Query Input Sanity** | Frontend + Backend validation |
| **Warning System** | Admin can warn interns (max 5 before disable) |
| **Announcements** | Admin broadcast system |
| **Socket.IO** | Real-time notifications |
| **MongoDB Persistence** | Notifications stored for offline access |

---

## Future Features (Development Phase)

### Planned Enhancements

1. **Machine Learning FAQ Suggestions**
   - Analyze query patterns to suggest FAQ improvements
   - Auto-suggest related FAQs based on user behavior

2. **Advanced Analytics Dashboard**
   - Query resolution time tracking
   - Intern performance metrics
   - FAQ effectiveness scoring

3. **Gamification System**
   - Points for helpful peer answers
   - Badges for consistent quality responses
   - Leaderboard for top contributors

4. **Multi-language Support**
   - Auto-detect user language preference
   - Translate FAQs on-the-fly
   - Regional FAQ categorization

5. **Mobile Application**
   - Native iOS/Android apps
   - Push notifications
   - Offline FAQ access

6. **API Rate Limiting**
   - Prevent API abuse
   - Per-user throttling
   - Priority queue for premium users

7. **Automated Testing Suite**
   - Unit tests for all controllers
   - Integration tests for API endpoints
   - E2E tests for critical workflows

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                               │
│                         React 18 + Vite + Tailwind                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                 │                │
               HTTP/REST         Socket.IO          WebSocket
                    │                 │                │
                    ▼                 ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER (Node.js + Express)                         │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │   Auth   │  │   FAQ    │  │  Query   │  │   Ask    │  │   Peer   │   │
│   │  Routes  │  │  Routes  │  │  Routes  │  │   AI     │  │  Routes  │   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│        │            │             │             │             │          │
│   ┌────┴────────────┴─────────────┴─────────────┴─────────────┴────┐     │
│   │                    Controllers Layer                            │     │
│   │  authController, faqController, queryController, askAIController│     │
│   │  peerController, ratingController, adminController,            │     │
│   │  announcementController, analyticsController, notificationController │
│   └────────────────────────────┬───────────────────────────────────┘     │
│                                │                                           │
│                    ┌───────────┴───────────┐                              │
│                    │                       │                              │
│           ┌────────┴────────┐     ┌───────┴───────┐                       │
│           │  grokService.js │     │  sweeper.js   │                       │
│           │ (Gemini + Groq) │     │ (24hr cron)   │                       │
│           └─────────────────┘     └───────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ Mongoose ODM
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MongoDB Atlas Cluster                               │
│                                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │  User   │  │  Query  │  │Response │  │   FAQ   │  │  NoFaq  │        │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│   ┌─────────┐  ┌─────────────┐                                          │
│   │Announce │  │Notification │                                          │
│   └─────────┘  └─────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 8, Tailwind CSS 3.4, React Router 7 |
| **Backend** | Node.js, Express 5, MongoDB 9, Mongoose 9 |
| **Real-time** | Socket.IO 4.8 |
| **AI/ML** | Gemini API (Google), Groq API (LLaMA) |
| **Auth** | JWT, bcrypt |
| **Deployment** | Vercel (frontend), Railway/Render (backend) |

---

## Contact & Support

- **Project:** Query.in - Crowd-sourced FAQ Platform
- **Documentation:** `./docs/` folder
- **Context:** `./context.md` for development history
- **Issues:** GitHub Issues for bug reports and feature requests