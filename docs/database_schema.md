# Query.in - Database Schema

## Overview

MongoDB Atlas cluster with 6 collections. Mongoose ODM used for schema validation and relationships.

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

---

## Users

```javascript
{
  _id: ObjectId,           // Primary key
  email: String,           // Unique, lowercase, validated
  password: String,        // bcrypt hashed (min 6 chars)
  role: String,            // enum: 'admin' | 'moderator' | 'intern'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: unique

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
  peer_note: String,        // Optional, admin/mod only
  response_type: String,    // enum: 'peer' | 'moderator' | 'admin'
  approval: Boolean,        // Default: false
  rating: Number,           // 1-5, nullable until rated
  createdAt: Date,
  updatedAt: Date
}
```

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
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdAt`: -1 (newest first)

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
  │                                           │
  ▼                                           ▼
3-STRIKE                                  is_locked
AMBIGUOUS ◄────────────────────────────── TRUE
                                          │
                                    ┌─────┴─────┐
                                    │           │
                              rating >= 4    5 responses
                                    │      all rating < 4
                                    │           │
                                    ▼           ▼
                                RESOLVED   RESOLVED
```

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