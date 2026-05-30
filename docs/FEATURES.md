# Query.in - Feature Breakdown

## Major Highlights (Flagship Features)

### 1. Multi-Provider LLM Pipeline (Gemini + Groq Fallback)

The AI resolution system uses a sophisticated multi-model fallback pipeline:

```
User Question → RAG Search → No Match → LLM Pipeline
                                        │
                    ┌───────────────────┴───────────────────┐
                    │                                       │
               Gemini API                            Groq API
            (5 models in order)                    (6 models in order)
                    │                                       │
                    ▼                                       ▼
        3.5-flash → 3.1-pro →                    llama-3.3-70b →
        3.1-flash-lite → 2.5-flash →              llama-3.1-8b → llama-4-scout →
        2.5-pro                                  qwen3-32b → gpt-oss-120b → gpt-oss-20b
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        ▼
                              ┌─────────────────┐
                              │   Peer Queue    │
                              │   Escalation    │
                              └─────────────────┘
```

**Key Implementation:**
- Temperature 0.1 for focused, deterministic responses
- Max 2000 output tokens per response
- 60 second timeout per request
- Plain text only - no emojis, no formatting (#, *, bold, italics)
- Automatic model switching on failure/timeout
- Image input error: "Cannot read image.png (this model does not support image input)"

---

### 2. 5-Answer Peer Concurrency Lock

Each query can receive a **maximum of 5 peer responses**. Once reached:

1. Query becomes `is_locked: true`
2. No more peer answers accepted
3. Escalates to Admin queue based on ratings

**Lock Triggers:**
```
4-5 Stars → Immediate Lock → Admin Highly-Rated Queue
1-3 Stars + 5 responses → Lock → Admin Low-Rated Queue
```

---

### 3. 3-Strike Ambiguous Rule

When **3 different peers** mark a query as "ambiguous":

1. `ambiguous_count` increments per unique peer (enforced via `$addToSet`)
2. At count = 3, query transitions to `status: 'Ambiguous'`, `is_locked: true`
3. Query removed from peer queue
4. **Notification sent to intern** telling them to rephrase and resubmit
5. Admin sees query in "Ambiguous Queue" for override resolution

**Anti-Gaming:** Same peer cannot mark ambiguous twice on the same query (`ambiguous_marked_by` array).

**Notification Message:** "Your query '...' was marked as unclear by 3 peers. Please rephrase and submit again."

---

### 4. 24-Hour Sweeper Automation

Background cron job runs every 15 minutes to enforce SLA timeouts:

**Scenario A - Stagnant Queries:**
- Query has 0 responses for 24+ hours
- Sweeper locks query → `is_locked: true`
- Query enters "Stagnant Queue" in Admin dashboard

**Scenario B - Low-Rated Partial Answers:**
- Query has 1-4 responses, all rated 1-3 stars, for 24+ hours
- Sweeper locks query → `is_locked: true`
- Query enters "Low-Rated Queue" in Admin dashboard

---

### 5-Section Admin/Moderator Resolve Hub

Admin/Moderator Resolve Hub presents 5 sections for query resolution:

| Section | Condition |
|---------|-----------|
| Pending Resolution | High-rated queries (rating >= 4) OR Ambiguous queries (3-strike rule) |
| Stagnant (0 answers) | is_locked + 0 responses (sweeper-triggered) |
| Unanswered | status != 'Resolved', 0 responses |
| Low-Rated | 5 responses, all < 4 stars |
| Archive | status = 'Resolved' |

---

### 6. FAQ Creation Bridge

After resolving a query, admin can create a permanent FAQ entry with one click:

1. Admin views resolved query in Resolution Hub
2. Clicks "+ Add to FAQ Database" button
3. System extracts `query_text` as `clean_question`
4. Uses approved response text as `answer`
5. Creates indexed FAQ entry for future RAG resolution

---

### 7. Automated AI FAQ Suggestion Engine

Queries that fail both RAG and LLM resolution are tracked in `no_faq` collection.

**Threshold Logic:**
- `occurrenceCount >= 10` → Admin alert triggered
- Admin can dismiss OR create new FAQ
- `impactedInterns` array prevents inflation

---

### 8. Active Query Cap & Spam Prevention

**Query Cap:** Max 5 unresolved queries per intern

**Spam Prevention:** Similar query detection via regex before peer escalation

---

### 9. Query Input Sanity Check

Input validation before RAG/LLM processing to prevent garbage inputs like `ajflafjllafffaafas`:

**Frontend + Backend validation (defense in depth):**
- Minimum 5 chars, max 1000 chars
- At least 4 actual letters
- Special char ratio < 30%
- No 3+ repeated characters (blocks `aaa`)
- At least 3 consecutive letters
- 4-6 unique letters required (scaled by length)
- Long strings (>20 chars) must have common words OR 8+ unique letters
- Repeated pattern ratio < 40%

**Error handling:** Returns `400` with `code: 'INVALID_QUERY'`

---

### 10. Warning & Credibility System

**Warning Count:** Each user has `warning_count` (default: 0, max: 5)

**Auto-Disable:** Account automatically disabled when warning_count >= 5

**Warning Types:** `intern_warning` notification sent to misbehaving interns

**Admin Tool:** Send warning button in query details modal on all admin/moderator resolve pages (AdminQueries, AdminResolveHub, AdminAmbiguous, ModeratorResolveHub, ModeratorAmbiguous)

**Spoiled Users Page:** Admin dashboard page (`/admin/spoiled-users`) listing all users with warnings

**Login Block:** Disabled users cannot log in (403 error)

**Frontend Alert:** Warning banner shown on MyEscalations page if user has warnings

**Warning Badge:** Query detail panels show warning count next to intern email

---

## Full Feature List

### Authentication & Authorization
- **JWT Authentication** - Token-based with bcrypt
- **RBAC Middleware** - admin, moderator, intern roles
- **Protected Routes** - Frontend route guards
- **Axios Interceptors** - Auto-attaches JWT

### Query Management
- **Query Submission** - Interns submit questions
- **Query States** - PENDING → PEER_ANSWERED → RESOLVED/AMBIGUOUS
- **Query Locking** - Prevents further modifications
- **Resolution Tracking** - peer_approved, admin_override

### RAG & AI Integration
- **RAG Database Search** - Keyword matching on search_text, tags, keywords
- **Auto-Complete** - Real-time suggestions (300ms debounce)
- **Multi-Model LLM** - Gemini + Groq with automatic fallback
- **Context Synthesis** - Combines matching FAQs
- **Plain Text Responses** - No emojis, no formatting

### Peer Escalation System
- **Peer Queue** - Interns answer unresolved questions
- **Submit Answer** - Peer responses with optional private note
- **Skip Query** - Peer can skip without penalty
- **3-Strike Rule** - 3 ambiguous marks triggers escalation
- **Active Query Cap** - Max 5 per intern
- **Spam Prevention** - Similar query detection

### Rating System
- **Star Rating** - 1-5 stars by query author
- **High Rating Lock** - 4-5 stars locks immediately
- **Low Rating Lock** - 1-3 stars locks at 5 responses
- **Idempotent Rating** - Can update but first determines lock

### Admin Resolution
- **Escalated Queues** - Highly-Rated, Low-Rated, Ambiguous
- **Approve Peer Response** - Admin approves peer answer
- **Admin Override** - Admin provides own answer
- **Resolution Types** - peer_approved, admin_override

### AI FAQ Suggestion Engine
- **No-FAQ Tracking** - Tracks unanswered questions
- **10-Occurrence Alert** - Admin notification
- **Dismiss/Create FAQ** - Admin actions

### Real-Time Notifications (Socket.IO)
- **User Rooms** - `user:{userId}` room per user
- **Admin Rooms** - `room:admins` for broadcasts
- **Query Rooms** - `query:{queryId}` for updates
- **Events** - `new_notification`, `yellow_alert`, `query_resolved`
- **Notification Model** - MongoDB persistence for offline alerts
- **NotificationBell** - Bell icon with unread count badge and dropdown
- **Toast** - Slide-in pop-up with 5-second auto-dismiss
- **Yellow Alert** - Admin notification when NoFaq hits 10 occurrences

### Analytics Tracking
- **ResolutionType Enum** - AUTO_COMPLETE, RAG_RESOLVED, LLM_RESOLVED, ESCALATED, SPAM_BLOCKED, CAP_BLOCKED
- **Model Logging** - Logs which LLM model answered
- **Response Length** - Logs character count

### Announcements
- **Create Announcement** - Admin broadcast
- **View Announcements** - Intern dashboard

### Admin Dashboard (Page-Based Layout)
- **Dashboard Overview** - Navigation cards to all sections
- **User Registration** - Single & bulk JSON upload
- **Announcements** - Broadcast global notices
- **User Management** - Sortable/filterable user table
- **Query Monitor** - Status filter, date sort, thread drawer
- **FAQ Editor** - Full CRUD on FAQ collection
- **Resolve Hub** - 5-section queue: Pending Resolution, Stagnant, Unanswered, Low-Rated, Archive
- **AI Suggestions** - Yellow alert at 10-occurrence threshold

### Moderator Dashboard (Page-Based Layout)
- **Dashboard Overview** - Navigation cards to all sections
- **Query Monitor** - Status filter, thread drawer
- **Resolve Hub** - 4-section queue: Pending Resolution, Unanswered, Low-Rated, Archive

### UI/UX Modernization (Phase 14)
- **Black & White Design System** - #FAFAFA background, #000000 text, #FFD000 yellow highlight
- **Modern SaaS Aesthetic** - Soft shadows, backdrop blur headers, smooth hover transitions
- **Design Tokens** - Consistent spacing (8px rhythm), rounded-xl corners (16px), professional typography
- **Component Library** - Reusable Button, Card, Badge, Toast, NotificationBell with consistent styling
- **Dashboard Layout** - Sticky header with logo, user info, notification bell; sidebar navigation
- **Loading States** - Animated spinner for async operations
- **Yellow Alert System** - #FFD000 highlight for important alerts and emphasis

### UI/UX Features
- **Black & White Theme** - #FAFAFA background, pure black text (#000000)
- **Yellow Highlight** - #FFD000 for alerts, emphasis, and important actions
- **Modern SaaS Aesthetic** - Soft shadows (shadow-md, shadow-xl), backdrop blur, smooth transitions
- **Rounded Design** - rounded-xl corners (16px) throughout the application
- **Professional Typography** - Clear hierarchy with text-sm (14px) body, text-base (16px) emphasis
- **Consistent Spacing** - 8px rhythm with px-4, py-2, space-y-4, space-y-6 utilities
- **Landing Page** - Embedded login (login form on `/`, not `/login`)
- **Role-Based Dashboards** - Admin, Moderator, Intern
- **Public FAQs Page** - Accordion view
- **ProtectedRoute Redirect** - Redirects to `/` (Landing) instead of `/login`
- **Markdown Rendering** - FAQ answers render markdown (bold, lists, highlights) via react-markdown
- **Status Badges** - FAQ cards show "AI Generated", "Peer Answered", or "Verified by Admin" based on priority

---

## Feature Control Matrix

| Feature | Intern | Moderator | Admin |
|---------|--------|-----------|-------|
| Ask AI (RAG+LLM) | yes | yes | yes |
| View FAQs | yes | yes | yes |
| Submit Peer Answer | yes | yes | yes |
| Rate Responses | yes | no | no |
| Skip/Ambiguous | yes | no | no |
| View Peer Queue | yes | yes | yes |
| Approve Responses | no | yes | yes |
| Admin Override | no | yes | yes |
| User Registration | no | no | yes |
| Bulk User Upload | no | no | yes |
| Broadcast Announcement | no | no | yes |
| User Management | no | no | yes |
| Master Query Monitor | no | yes | yes |
| FAQ CRUD | no | no | yes |
| Resolve Query Hub | no | yes | yes |
| FAQ Suggestions | no | no | yes |
| Dismiss Suggestions | no | no | yes |