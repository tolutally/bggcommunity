# Milestone 3 — Admin, Analytics & Notifications

## Overview

Completes the platform with async notifications, full admin user management, content moderation, analytics with exports, and the per-member Developer Plan. Milestone 2 must be fully complete before starting here.

---

## 3A — Notification System

### Models used
`Notification`

### Infrastructure
- Uses **BullMQ** (backed by Redis) for async fan-out. Never send notifications synchronously inside a request handler.
- Worker file: `src/workers/notification.worker.ts`
- Notification service: `src/shared/services/notification.service.ts`

### Notification types

| Type | Trigger | Recipients |
|------|---------|------------|
| `JOB_POSTED` | Admin creates a Job | All active members |
| `EVENT_CREATED` | Admin creates an Event | All active members |
| `ANNOUNCEMENT` | Admin posts global announcement | All active members |
| `SESSION_REMINDER` | 24h before a CohortSession | All CohortSession RSVPs |
| `COHORT_INVITE` | Admin adds member to cohort | That member only |
| `REFERRAL_UPDATE` | Admin updates ReferralRequest status | Requesting member |
| `WARNING_SENT` | Admin sends warning to user | That member only |
| `REPORT_RESOLVED` | Admin resolves a report | Reporter |

### Business rules
- Fan-out jobs (JOB_POSTED, EVENT_CREATED, ANNOUNCEMENT) must be processed by the BullMQ worker in batches — never insert all notification rows in one query. Use `createMany` in chunks of 500.
- `SESSION_REMINDER` is a scheduled job — enqueue with a `delay` equal to `scheduledAt - 24h - now()`.
- `read` defaults to `false`. Marking one or all read is a `PATCH`, not a `DELETE`.
- Notifications are never hard deleted.
- Return `unreadCount` alongside the list so the frontend can badge the bell icon.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/notifications` | Member | Paginated notification list + unreadCount |
| `PATCH` | `/api/v1/notifications/:id/read` | Member | Mark one as read |
| `PATCH` | `/api/v1/notifications/read-all` | Member | Mark all as read |

### Response shape — GET /notifications
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 4,
    "meta": { "nextCursor": "...", "hasNextPage": true }
  }
}
```

### Worker setup (BullMQ)

```
Queue name: "notifications"
Jobs:
  - notify-all-members   { type, title, body, referenceType, referenceId }
  - notify-user          { userId, type, title, body, referenceType?, referenceId? }
  - session-reminder     { sessionId }  — scheduled with delay
```

---

## 3B — Admin User Management

### Models used
`User`, `Profile`, `AuditLog`

### Business rules
- **List**: returns all non-deleted users. Support filter by `status` (ACTIVE, SUSPENDED) and free-text search by name/email.
- **Add single**: creates a User + Profile, marks `onboardingComplete: false`, sends a welcome/invite email. No password set — user must use "Forgot Password" to set one.
- **Bulk add**: accepts a JSON array of `{ email, firstName, lastName }` objects. Skips duplicates (by email) and reports them in the response.
- **Suspend**: sets `status: SUSPENDED`. Invalidates all Redis refresh tokens for that user by scanning `bgg:refresh:*` — or maintain a `user_sessions:{userId}` Redis set for O(1) invalidation.
- **Reinstate**: sets `status: ACTIVE`.
- **Delete**: soft delete (`deletedAt`, `status: DELETED`). Invalidates refresh tokens.
- **Send warning**: creates a `Notification` of type `WARNING_SENT` for the user. Does NOT suspend — that is a separate action.
- Every state-changing action writes an `AuditLog` row: `{ userId: adminId, action, targetType: "User", targetId: memberId }`.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/admin/users` | Admin | List members with filters + search |
| `GET` | `/api/v1/admin/users/:id` | Admin | Member detail + activity summary |
| `POST` | `/api/v1/admin/users` | Admin | Add single member |
| `POST` | `/api/v1/admin/users/bulk` | Admin | Bulk add members |
| `PATCH` | `/api/v1/admin/users/:id/suspend` | Admin | Suspend account |
| `PATCH` | `/api/v1/admin/users/:id/reinstate` | Admin | Reinstate account |
| `DELETE` | `/api/v1/admin/users/:id` | Admin | Soft delete account |
| `POST` | `/api/v1/admin/users/:id/warning` | Admin | Send warning notification |

### Request bodies

**POST /admin/users**
```json
{ "email": "amara@example.com", "firstName": "Amara", "lastName": "Okafor" }
```

**POST /admin/users/bulk**
```json
{
  "members": [
    { "email": "a@example.com", "firstName": "A", "lastName": "B" },
    { "email": "c@example.com", "firstName": "C", "lastName": "D" }
  ]
}
```

**Response for bulk add**
```json
{
  "success": true,
  "data": {
    "created": 8,
    "skipped": [{ "email": "c@example.com", "reason": "already exists" }]
  }
}
```

**POST /admin/users/:id/warning**
```json
{ "message": "Please review the community guidelines regarding spam." }
```

---

## 3C — Moderation

### Models used
`Report`, `Post`, `Comment`, `Profile` (flagCount, trustScore)

### Business rules
- Members can report a `Post` or `Comment`. One report per member per content item (unique constraint: `reporterId + contentId + contentType`).
- Admin sees a **queue** of open reports, sorted by severity (HIGH first) then `createdAt`.
- Admin actions:
  - **Dismiss**: sets `status: RESOLVED`, `resolution: DISMISSED`. No action on content or user.
  - **Send Warning**: sets `status: RESOLVED`, `resolution: WARNING_SENT`. Increments `Profile.flagCount`. Creates a `WARNING_SENT` notification for the reported user.
  - **Delete Content**: sets `status: RESOLVED`, `resolution: CONTENT_DELETED`. Soft-deletes the post/comment (`deletedAt`). Increments `Profile.flagCount`. Recomputes `trustScore`:
    - `flagCount === 0`: `HIGH`
    - `flagCount === 1–2`: `MEDIUM`
    - `flagCount >= 3`: `LOW`
- The report detail view exposes **User History**: `accountAge` (days since `createdAt`), `previousFlags` (Profile.flagCount), `trustScore`.
- All admin moderation actions write an `AuditLog` row.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/community/posts/:id/report` | Member | Report a post |
| `POST` | `/api/v1/community/comments/:id/report` | Member | Report a comment |
| `GET` | `/api/v1/admin/moderation/reports` | Admin | Report queue with filters |
| `GET` | `/api/v1/admin/moderation/reports/:id` | Admin | Report detail + user history |
| `POST` | `/api/v1/admin/moderation/reports/:id/dismiss` | Admin | Dismiss report |
| `POST` | `/api/v1/admin/moderation/reports/:id/warn` | Admin | Send warning + increment flag |
| `POST` | `/api/v1/admin/moderation/reports/:id/delete-content` | Admin | Delete content + increment flag |

### Request bodies

**POST /community/posts/:id/report**
```json
{
  "reason": "HARASSMENT",
  "severity": "HIGH"
}
```

**GET /admin/moderation/reports — query params**
- `status`: `OPEN | RESOLVED`
- `severity`: `HIGH | MEDIUM | LOW`
- `reason`: any ReportReason enum value
- `cursor`, `limit` (default 20)

---

## 3D — Analytics

### Business rules
- All analytics endpoints are admin-only.
- Metrics are computed at query time (no pre-aggregation in MVP). Add database indexes where needed.
- Excel export uses `exceljs`. PDF export uses `pdfkit`.
- Exports are generated synchronously and streamed as file downloads (no S3 in MVP).
- "Inactive member" = no post, comment, event RSVP, or session RSVP in the last `N` days (default 30, configurable via query param).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/admin/analytics/overview` | Admin | Platform-wide metrics |
| `GET` | `/api/v1/admin/analytics/cohorts` | Admin | Per-cohort engagement |
| `GET` | `/api/v1/admin/analytics/inactive-members` | Admin | Members inactive for N days |
| `GET` | `/api/v1/admin/analytics/export` | Admin | Download Excel or PDF report |

### Response — GET /admin/analytics/overview
```json
{
  "success": true,
  "data": {
    "totalMembers": 248,
    "activeThisMonth": 186,
    "newThisMonth": 12,
    "totalEvents": 34,
    "totalRsvpsThisMonth": 310,
    "totalCohorts": 5,
    "activeCohorts": 2,
    "openReports": 5
  }
}
```

### Response — GET /admin/analytics/cohorts
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Cohort Alpha",
      "track": "Engineering Track",
      "status": "ACTIVE",
      "memberCount": 6,
      "maxMembers": 50,
      "sessionsDone": 3,
      "totalSessions": 5,
      "activeRate": 0.95
    }
  ]
}
```

### Export — GET /admin/analytics/export — query params
- `format`: `excel | pdf` (required)
- `type`: `overview | cohorts | inactive-members`

Response: file download with appropriate `Content-Type` and `Content-Disposition` headers.

---

## 3E — Developer Plan (per-member personal goals)

### Models used
`DeveloperPlan`, `PlanMilestone`

### Business rules
- Each member has at most **one** DeveloperPlan (`userId` is unique on the model).
- Admin creates or assigns the plan for a member from the admin view.
- Members can view and check off milestones from their profile page.
- Milestones have `order` for drag-and-drop reordering (admin only). Increment by 10 to leave room without reindexing.
- Completing a milestone sets `status: COMPLETED` and `completedAt: now()`. Uncompleting clears `completedAt`.
- The profile card shows `completedCount / totalCount` and a percentage.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/users/me/plan` | Member | Get own plan + milestones |
| `PATCH` | `/api/v1/users/me/plan/milestones/:id/complete` | Member | Toggle milestone complete |
| `POST` | `/api/v1/admin/users/:id/plan` | Admin | Create plan for member |
| `POST` | `/api/v1/admin/users/:id/plan/milestones` | Admin | Add milestone |
| `PATCH` | `/api/v1/admin/users/:id/plan/milestones/:milestoneId` | Admin | Edit milestone title/order |
| `DELETE` | `/api/v1/admin/users/:id/plan/milestones/:milestoneId` | Admin | Remove milestone |

### Request bodies

**POST /admin/users/:id/plan/milestones**
```json
{ "title": "Build Portfolio", "order": 10 }
```

**PATCH /admin/users/:id/plan/milestones/:milestoneId**
```json
{ "title": "Update Resume", "order": 20 }
```

---

## Cross-cutting concerns for Milestone 3

- **BullMQ worker process**: run as a separate process alongside the API server. Add a `npm run worker` script (`tsx watch src/workers/notification.worker.ts`) to `package.json`. In Docker, this becomes a second container using the same image with `command: node dist/workers/notification.worker.js`.
- **AuditLog**: every admin action that changes user state or content must write an audit log. Build a shared `auditService.log(...)` helper to standardise this.
- **Redis token invalidation on suspend/delete**: maintain a `bgg:user-sessions:{userId}` Redis Set that stores all active refresh token keys for a user. On suspend/delete, fetch all keys from the set, delete each token, then delete the set.
- **Rate limiting on analytics export**: 1 export request per admin per minute to prevent abuse.
