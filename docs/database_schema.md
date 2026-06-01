# Query.in - Database Schema

## Overview

MongoDB Atlas cluster with 7 collections. Mongoose ODM used for schema validation and relationships.

---

## Collections

| Collection | Purpose |
|------------|---------|
| [users](#users) | Authentication and RBAC |
| [queries](#queries) | Core escalation tickets |
| [responses](#responses) | Peer/mod/admin answers |
| [faqs](#faqs) | Knowledge base entries |
| [nofags](#nofags) | Content gap tracking |
| [announcements](#announcements) | Admin broadcasts |
| [notifications](#notifications) | Real-time + persistent notifications |
| [moderator_faq_suggestions](#moderator_faq_suggestions) | Moderator FAQ suggestions for admin review |

---

## Users

```javascript
{
  _id: ObjectId,           // Primary key
  email: String,           // Unique, lowercase, validated
  password: String,        // bcrypt hashed (min 6 chars)
  role: String,            // enum: 'admin' | 'moderator' | 'intern'
  warning_count: Number,   // Default: 0, max: 5
  is_disabled: Boolean,    // Default: false, auto-set at warning_count >= 5
  isActive: Boolean,       // Default: true, admin toggle for soft deactivation
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique

**Warning System:**
- `warning_count`: Tracks number of warnings (0-5)
- `is_disabled`: Auto-enables when warning_count >= 5
- Disabled users cannot log in (403 error)

**Active Status:**
- `isActive`: Soft deactivation toggle (default: true)
- Inactive users cannot log in (403 error: "Your account has been deactivated")
- Admin cannot toggle themselves or other admins
- Provides soft deactivation without hard delete

**Relationships:**
- Queries created → `queries.intern_id`
- Responses authored → `responses.author_id`
- Queries resolved → `queries.resolved_by` (nullable)
- Announcements → `announcements.admin_id`

---

## Queries

```javascript
{
  _id: ObjectId,           // Primary key
  intern_id: ObjectId,    // Ref: User (required)
  query_text: String,      // Required, trimmed
  status: String,          // enum: 'Pending' | 'Peer Answered' | 'Ambiguous' | 'Resolved'
  responses: [ObjectId],  // Ref: Response (max 5 peer responses)
  ambiguous_count: Number, // Default: 0, max: 3
  ambiguous_marked_by: [ObjectId], // Ref: User (unique peers)
  resolved_by: ObjectId,  // Ref: User (nullable)
  resolved_at: Date,      // Nullable
  resolution_type: String, // enum: 'peer_approved' | 'admin_override' | 'moderator_override' | 'auto_ambiguous'
  is_locked: Boolean,      // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `intern_id`: 1
- `status`: 1
- `createdAt`: -1

**Relationships:**
- Creator → `users._id` via `intern_id`
- Responses → `responses._id` via `responses` array
- Resolver → `users._id` via `resolved_by` (nullable)
- Ambiguous markers → `users._id` via `ambiguous_marked_by`

**Validation:**
- `responses` array max length: 5 (peer responses only)

---

## Responses

```javascript
{
  _id: ObjectId,           // Primary key
  query_id: ObjectId,      // Ref: Query (required)
  author_id: ObjectId,     // Ref: User (required)
  response_text: String,   // Required
  peer_note: String,       // Optional, admin/mod only
  response_type: String,   // enum: 'peer' | 'moderator' | 'admin'
  approval: Boolean,       // Default: false
  rating: Number,          // 1-5, nullable until rated
  rater_note: String,     // Optional, intern note for admins (max 500 chars)
  createdAt: Date,
  updatedAt: Date
}
```

**Response Type & Approval States:**

| response_type | approval | Meaning | Badge Display |
|---------------|----------|---------|---------------|
| `admin` | true | Admin approved a peer response | "Admin Approved" |
| `admin` | false | Admin wrote their own override answer | "Admin Override" |
| `moderator` | true | Moderator approved a peer response | "Moderator Approved" |
| `moderator` | false | Moderator wrote their own override answer | "Moderator Override" |
| `peer` | false | Peer submitted a response (awaiting rating) | "Peer" |
| `peer` | true | Peer response that was approved by admin/moderator | "Admin Approved" or "Moderator Approved" (based on resolved_by.role) |

**Note:** When a peer response is approved, the `approval` flag is set to `true` and the `query.resolved_by` field indicates who approved it. This allows distinguishing between:
- A moderator approving a peer's answer (peer response with approval=true, resolved_by.role=moderator)
- An admin approving a peer's answer (peer response with approval=true, resolved_by.role=admin)

**Indexes:**
- `query_id`: 1
- `author_id`: 1

**Relationships:**
- Parent query → `queries._id` via `query_id`
- Author → `users._id` via `author_id`

---

## FAQs

```javascript
{
  _id: ObjectId,           // Primary key
  clean_question: String,   // Required, sanitized
  answer: String,           // Required
  category: String,         // Required
  tags: [String],           // Default: []
  keywords: [String],       // Default: [] (high-weight for autocomplete)
  search_text: String,      // Required (indexed for RAG)
  intent: String,           // User intent classification
  priority: Number,         // Default: 0 (higher = more important)
  related_questions: [String], // Default: []
  escalate_if_uncertain: Boolean, // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `search_text`: text (MongoDB text index for RAG)
- `keywords`: 1
- `category`: 1

**Note:** 125 seed FAQs pre-loaded from `vins_faq_structured.json`

---

## NoFaqs (Content Gap Tracking)

```javascript
{
  _id: ObjectId,           // Primary key
  queryText: String,        // Required, unique
  occurrenceCount: Number,  // Default: 1, min: 1
  impactedInterns: [ObjectId], // Ref: User (distinct interns)
  firstLoggedDate: Date,    // Default: Date.now
  lastUpdatedDate: Date     // Default: Date.now
}
```

**Indexes:**
- `occurrenceCount`: -1 (sorted high→low for suggestions)
- `queryText`: text

**Anti-Inflation:** `impactedInterns` array ensures same intern doesn't inflate count for same query.

**Alert Threshold:** `occurrenceCount >= 10` triggers admin suggestion alert.

---

## Announcements

```javascript
{
  _id: ObjectId,           // Primary key
  admin_id: ObjectId,       // Ref: User (required)
  heading: String,          // Required, max 200 chars
  content: String,          // Required
  priority: String,         // enum: 'low' | 'medium' | 'high', default: 'medium'
  createdAt: Date,
  updatedAt: Date
}
```

**Priority Levels:**
| Priority | Color | Description |
|----------|-------|-------------|
| `high` | Red (#DC2626) | Critical announcements requiring immediate attention |
| `medium` | Yellow (#FFD000) | Standard announcements |
| `low` | Dark Green (#166534) | Informational announcements |

**Indexes:**
- `createdAt`: -1 (newest first)

---

## Notifications (Hybrid Real-Time + Persistence)

```javascript
{
  _id: ObjectId,           // Primary key
  recipient_id: ObjectId,  // Ref: User (required)
  type: String,            // enum: 'peer_answer' | 'query_resolved' | 'admin_alert' | 'announcement' | 'faq_added' | 'intern_warning'
  title: String,           // Required, max 200 chars
  message: String,         // Required, max 1000 chars
  link_id: ObjectId,        // Ref: Query/FAQ/Announcement (optional)
  link_type: String,       // enum: 'query' | 'faq' | 'announcement' (optional)
  is_read: Boolean,         // Default: false
  created_by: ObjectId,    // Ref: User (optional)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `recipient_id`: 1, `is_read`: 1, `createdAt`: -1
- `type`: 1, `createdAt`: -1

**Notification Types:**
| Type | Trigger | Recipient |
|------|---------|-----------|
| `peer_answer` | Peer submits answer | Query author (intern) |
| `query_resolved` | Admin/mod resolves query OR query marked ambiguous (3 strikes) | Query author (intern) |
| `admin_alert` | NoFaq hits 10 occurrences | All admins |
| `announcement` | Admin creates announcement | All interns |
| `faq_added` | Admin adds new FAQ to knowledge base | All interns |
| `intern_warning` | Admin sends warning to intern for misuse | Targeted intern |

---

## ModeratorFaqSuggestions (Moderator FAQ Suggestions)

```javascript
{
  _id: ObjectId,           // Primary key
  query_id: ObjectId,      // Ref: Query (required)
  suggested_by: ObjectId,  // Ref: User (moderator, required)
  question_text: String,   // Required (the query text from original query)
  suggested_answer: String, // Required (the approved response text)
  status: String,          // enum: 'pending' | 'approved' | 'dismissed', default: 'pending'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `status`: 1, `createdAt`: -1

**Workflow:**
1. Moderator views archived (resolved) queries in Resolve Hub
2. Moderator clicks "Suggest for FAQ Database" on an archived query
3. Suggestion is created with status: 'pending'
4. Admin sees suggestion in "Moderator Suggested" section of Resolve Hub
5. Admin can "Add to FAQ Database" (opens FAQ creation modal) or "Dismiss" the suggestion

---

## Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │    Query    │         │   Response  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ _id (PK)    │◄────────│ intern_id   │         │ _id (PK)    │
│ email       │         │ _id (PK)    │◄────────│ query_id    │
│ password    │         │ status      │    ┌────│ author_id   │
│ role        │         │ responses[] │    │    │ response_text
└─────────────┘         │ is_locked   │    │    │ rating     │
      │                 │ resolved_by │    │    └─────────────┘
      │                 └─────────────┘    │
      │                       ▲             │
      │                       │             │
      │                 ┌─────┴─────────────┘
      │                 │
┌─────┴────────┐        │
│ Announcement │        │
├──────────────┤        │
│ _id (PK)     │        │
│ admin_id ────┼────────┘
│ heading      │
│ content      │
└──────────────┘


┌─────────────┐
│    NoFaq    │
├─────────────┤
│ _id (PK)    │
│ queryText   │
│ occurrence  │
│ intern_ids[]│
└─────────────┘

┌─────────────┐
│     FAQ     │
├─────────────┤
│ _id (PK)    │
│ question    │
│ answer      │
│ category    │
│ tags[]      │
│ keywords[]  │
│ search_text │
└─────────────┘
```

---

## Query Lifecycle State Machine

```
PENDING ──────────────────────────────► PEER_ANSWERED
  │                                           │
  │ (peer submits answer)                     │ (up to 5 peers can answer)
  │                                           │
  ▼                                           ▼
3-STRIKE                                  is_locked
AMBIGUOUS ◄────────────────────────────── TRUE
  │                                         │
  │ (notification sent to intern)           │
  │                                         │
  │                              ┌──────────┴──────────┐
  │                              │                     │
  │                        rating >= 4            rating = 5
  │                              │             (immediate lock)
  │                              │                   │
  │                              ▼                   ▼
  │                        HIGHLY-RATED         LOCKED
  │                         QUEUE             (no more responses)
  │                         (4 stars)              │
  │                              │                   │
  │                              └─────────┬─────────┘
  │                                        │
  │                              ┌─────────┴─────────┐
  │                              │                   │
  │                         5 responses        5 responses
  │                        all rating < 4     all rating 1-4
  │                              │                   │
  │                              ▼                   ▼
  │                         LOW-RATED           LOW-RATED
  │                             QUEUE              QUEUE
  │                              │                   │
  │                              └─────────┬─────────┘
  │                                        │
  │                              ┌─────────┴─────────┐
  │                              │                   │
  │                         APPROVE              OVERRIDE
  │                            │                     │
  │                            └─────────┬───────────┘
  │                                      │
  │                                      ▼
  │                                 RESOLVED
```

### Peer Queue Behavior

| Query Status | Visible in Peer Queue? | Accepting Responses? |
|--------------|------------------------|----------------------|
| Pending | Yes (if < 5 responses, not own query) | Yes |
| Peer Answered | Yes (if < 5 responses, not already answered) | Yes |
| Ambiguous | No | No (locked) |
| Resolved | No | No (locked) |

### Admin/Moderator Resolution Queues (6-Section)

| Queue | Condition | Response Display |
|-------|-----------|------------------|
| Pending Resolution | High-rated queries (response rating >= 4), excludes Ambiguous | Only 4-5★ responses shown, sorted 5★ first |
| Ambiguous Queries | status = 'Ambiguous' (3-strike rule triggered), can delete these | All responses shown |
| Stagnant (Locked, 24h+) | 1-4 responses, ALL 1-3★, created 24+ hours ago | All responses shown (sorted 3★→1★) |
| Low-Rated | 5 responses, all < 4 stars | All responses shown (sorted 3★→1★), Approve button available |
| Archive | status = 'Resolved' | All responses shown |
| Moderator Suggested | Moderator suggested FAQs from Archived queries | Shows suggested question/answer, Admin can Add to FAQ or Dismiss |

---

## Schema Validation Rules

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| User.email | String | Yes | Unique, valid email format |
| User.password | String | Yes | Min 6 characters |
| User.role | String | Yes | admin/moderator/intern |
| Query.intern_id | ObjectId | Yes | Ref: User |
| Query.query_text | String | Yes | Trimmed |
| Query.responses | [ObjectId] | No | Max 5 items |
| Query.status | String | No | Default: 'Pending' |
| Query.ambiguous_count | Number | No | 0-3 |
| Response.query_id | ObjectId | Yes | Ref: Query |
| Response.author_id | ObjectId | Yes | Ref: User |
| Response.rating | Number | No | 1-5 |
| Response.rater_note | String | No | Max 500 chars |
| NoFaq.queryText | String | Yes | Unique |
| NoFaq.occurrenceCount | Number | No | Min 1 |
| Announcement.admin_id | ObjectId | Yes | Ref: User |
| Announcement.heading | String | Yes | Max 200 chars |

---

## Mongoose Best Practices Applied

1. **Explicit Schema Definition** - All schemas have clear field definitions
2. **Reference Population** - Related objects populated via `.populate()` method
3. **Index Strategy** - Frequently queried fields indexed for performance
4. **Timestamps** - `timestamps: true` on all schemas except NoFaq
5. **Enum Validation** - Status/type fields use enums with custom messages
6. **Default Values** - All optional fields have sensible defaults
7. **Trim Strings** - Text fields trimmed before save
8. **Error Messages** - All validators have custom error messages