# Query.in - Feature Breakdown

## Major Highlights (Flagship Features)

### 1. Gemini LLM Sanity & Context Pipeline

The AI resolution system uses Google's Gemini 2.5 Flash model with a sophisticated pipeline:

```
User Question → RAG Search → No Match → Gemini LLM Fallback
                                    ↓
                              Sanity Check
                                    ↓
                          ┌─────────┴─────────┐
                          │                   │
                    Confidence High     Confidence Low
                          │                   │
                          ▼                   ▼
                     Return Answer      Escalate to
                                        Peer Queue
```

**Key Implementation:**
- Temperature set to 0.1 for focused, deterministic responses
- Context synthesized from all relevant FAQ documents (not single result)
- Sanity check ensures model doesn't hallucinate unrelated answers
- Escalation flag (`escalate_if_uncertain`) in FAQ schema triggers peer queue

---

### 2. 5-Answer Peer Concurrency Lock

Each query can receive a **maximum of 5 peer responses**. Once reached:

1. Query becomes `is_locked: true`
2. No more peer answers accepted
3. Escalates to Admin "Low-Rated Queue" if all responses are rated 1-3 stars

**Lock Triggers:**
```
┌─────────────────┐    rating = 4-5    ┌──────────────┐
│ PEER_ANSWERED   │ ─────────────────> │ is_locked=true │
└─────────────────┘                    └──────────────┘
                                                     │
                                         No more peer answers accepted
                                         Escalates to Admin "Highly-Rated Queue"

┌─────────────────┐    rating = 1-3    ┌──────────────┐
│ PEER_ANSWERED   │ ─────────────────> │ Check responses count │
└─────────────────┘                    └──────────────┘
                                                  │
                                     ┌────────────┴────────────┐
                                     │                       │
                               < 5 responses          = 5 responses
                                     │                       │
                                     ▼                       ▼
                              Query stays open        is_locked=true
                              (awaiting better         Escalates to Admin
                               peer answers)           "Low-Rated Queue"
```

---

### 3. 3-Strike Ambiguous Rule

When **3 different peers** mark a query as "ambiguous":

1. `ambiguous_count` increments per unique peer
2. At count = 3, query transitions to `status: 'Ambiguous'`
3. Query is removed from peer queue (no more answering)
4. Admin sees query in "Ambiguous Queue" for override resolution

**Anti-Gaming:** Same peer cannot mark ambiguous twice on the same query.

---

### 4. Automated AI FAQ Suggestion Engine

Queries that fail both RAG and LLM resolution are tracked in the `no_faq` collection.

**Threshold Logic:**
- When `occurrenceCount >= 10` for a unique query text → Admin alert triggered
- Admin can dismiss suggestion OR create new FAQ from it
- `impactedInterns` array prevents inflation from same intern repeated hits

**Alert Display:** Yellow border alert on Admin Dashboard when unread suggestions exist.

---

## Full Feature List

### Authentication & Authorization
- **JWT Authentication** - Token-based auth with bcrypt password hashing
- **RBAC Middleware** - Role-based access: admin, moderator, intern
- **Protected Routes** - Frontend route guards with localStorage token persistence
- **Axios Interceptors** - Auto-attaches JWT and handles 401 redirects

### Query Management
- **Query Submission** - Interns submit questions to the system
- **Query States** - PENDING → PEER_ANSWERED → RESOLVED/AMBIGUOUS
- **Query Locking** - Prevents further modifications after resolution
- **Resolution Tracking** - Records who resolved and how (peer_approved, admin_override)

### RAG & AI Integration
- **RAG Database Search** - Keyword matching on search_text, tags, keywords, clean_question
- **Auto-Complete** - Real-time suggestions as user types (300ms debounce)
- **Gemini LLM Fallback** - Uses gemini-2.5-flash with temperature 0.1
- **Context Synthesis** - Combines multiple matching FAQs into coherent response

### Peer Escalation System
- **Peer Queue** - Interns answer other interns' unresolved questions
- **Submit Answer** - Peer responses with optional private note
- **Skip Query** - Peer can skip without penalty
- **3-Strike Rule** - 3 ambiguous marks triggers admin escalation

### Rating System
- **Star Rating** - Intern rates peer answers 1-5 stars
- **High Rating Lock** - 4-5 stars immediately locks query for admin review
- **Low Rating Lock** - 1-3 stars locks only after 5 responses (all low)
- **Idempotent Rating** - Rating can be updated but first rating determines lock behavior

### Admin Resolution
- **Escalated Queues** - Three categories: Highly-Rated, Low-Rated, Ambiguous
- **Approve Peer Response** - Admin approves peer answer as official resolution
- **Admin Override** - Admin provides own answer, bypassing peer responses
- **Resolution Types** - peer_approved, admin_override, moderator_override, auto_ambiguous

### AI FAQ Suggestion Engine
- **No-FAQ Tracking** - Tracks questions that couldn't be answered
- **10-Occurrence Alert** - Admin notification at 10+ hits
- **Dismiss Suggestion** - Admin can clear suggestions
- **Create FAQ from Suggestion** - One-click FAQ creation from tracked query

### Real-Time Notifications (Socket.IO)
- **User Rooms** - Each user joins `user:{userId}` room on connect
- **Admin Rooms** - Admins/mods join `room:admins` for broadcast
- **Query Rooms** - Users can join/leave `query:{queryId}` rooms
- **Events** - `new_peer_answer`, `query_resolved` emitted to intern's room
- **JWT Authentication** - Socket middleware verifies token before connection

### Announcements
- **Create Announcement** - Admins broadcast system-wide messages
- **View Announcements** - Interns see announcements on their dashboard
- **Timestamp Tracking** - All announcements indexed by creation date

### 24-Hour Cron Sweeper
- **Background Job** - Periodic task to manage query states
- **Stale Query Handling** - Detects and processes abandoned queries
- **No-FAQ Cleanup** - Removes or archives old no_faq entries

### UI/UX Features
- **Black & White Theme** - Strict monochrome design (#FAFAFA background)
- **Rounded Corners** - All cards/buttons use rounded-lg
- **Landing Page** - Public-facing page with embedded login
- **Role-Based Dashboards** - Different views for admin, moderator, intern
- **Public FAQs Page** - Unauthenticated users can browse FAQ accordion
- **Protected Routes** - Role-specific page access control
- **Auto-Complete Dropdown** - Keyboard navigation (Enter to select, Escape to close)

---

## Feature Control Matrix

| Feature | Intern | Moderator | Admin |
|---------|--------|-----------|-------|
| Ask AI (RAG+LLM) | ✅ | ✅ | ✅ |
| View FAQs | ✅ | ✅ | ✅ |
| Submit Peer Answer | ✅ | ✅ | ✅ |
| Rate Responses | ✅ | ❌ | ❌ |
| Skip/Ambiguous | ✅ | ❌ | ❌ |
| View Peer Queue | ✅ | ✅ | ✅ |
| Approve Responses | ❌ | ✅ | ✅ |
| Admin Override | ❌ | ✅ | ✅ |
| Create FAQ | ❌ | ❌ | ✅ |
| Create Announcement | ❌ | ❌ | ✅ |
| View Suggestions | ❌ | ❌ | ✅ |
| Dismiss Suggestions | ❌ | ❌ | ✅ |