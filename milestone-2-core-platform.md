# Milestone 2 — Core Platform Features

## Overview

Builds the full member-facing and admin-facing feature surface: Events, Cohorts, Jobs, Community Groups, Posts, Recordings, and the Member Directory. Auth (Milestone 1) must be complete before starting any feature here.

All protected routes require the `verifyToken` middleware. Admin-only routes additionally require `requireAdmin`.

---

## 2A — Events

### Models used
`Event`, `EventRsvp`

### Business rules
- Events are created and managed by admins only.
- `scheduledAt` stores date + time together as a `DateTime`.
- `durationMinutes` is a positive integer (e.g. 60 for 1 hr).
- Status (Upcoming / Past) is **derived** at query time from `scheduledAt` vs `now()` — not stored.
- RSVP is a toggle: calling the endpoint when already RSVP'd removes the RSVP (upsert/delete pattern).
- `meetingLink` is only returned to RSVP'd members (not in the public list).
- Soft delete via `deletedAt` — never hard delete.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/admin/events` | Admin | Create event |
| `GET` | `/api/v1/events` | Member | List events with filters |
| `GET` | `/api/v1/events/:id` | Member | Event detail + RSVP status |
| `POST` | `/api/v1/events/:id/rsvp` | Member | Toggle RSVP |
| `PATCH` | `/api/v1/admin/events/:id` | Admin | Update event |
| `DELETE` | `/api/v1/admin/events/:id` | Admin | Soft delete |
| `GET` | `/api/v1/admin/events/:id/rsvps` | Admin | RSVP report (member list + count) |
| `PATCH` | `/api/v1/admin/events/:id/recording` | Admin | Add YouTube recording URL |

### Request bodies

**POST /admin/events**
```json
{
  "title": "Resume Review Circle",
  "description": "Small-group resume reviews with live feedback.",
  "scheduledAt": "2026-04-20T15:00:00.000Z",
  "durationMinutes": 45,
  "host": "Keisha M.",
  "type": "WORKSHOP",
  "platform": "GOOGLE_MEET",
  "meetingLink": "https://meet.google.com/xyz-abcd-efg"
}
```

**GET /events — query params**
- `type`: `WORKSHOP | QA | SPEAKER_SERIES | SOCIAL | HACKATHON`
- `status`: `upcoming | past`
- `cursor`: for pagination
- `limit`: default 20

### Notes
- `type` enum values: `WORKSHOP`, `QA`, `SPEAKER_SERIES`, `SOCIAL`, `HACKATHON`
- `platform` enum values: `ZOOM`, `GOOGLE_MEET`, `OTHER`
- Use cursor pagination (by `scheduledAt`) for the list endpoint.

---

## 2B — Cohorts

### Models used
`Cohort`, `CohortMember`, `CohortSession`, `CohortSessionRsvp`, `CohortResource`, `CohortAnnouncement`

### Business rules
- Cohorts are created and managed by admins only.
- `maxMembers` defaults to 40. Enforce on `POST /cohorts/:id/members` — reject if at capacity.
- `status` enum: `UPCOMING`, `ACTIVE`, `COMPLETED`. Admin sets this manually.
- `track` is a free-text string (e.g. "Engineering Track").
- `currentPhase` is a free-text label updated by admin (e.g. "Week 3: Research & Planning").
- `activeRate` is computed from session RSVPs — not stored. Formula: `(unique attendees across sessions) / memberCount`.
- Sessions have per-session RSVP tracking. RSVP is a toggle (same as events).
- Resources are URLs (links or YouTube). No file upload in this milestone.
- Announcements from a cohort trigger a `COHORT_INVITE`-type notification to all cohort members (handled by notification worker, Milestone 3).
- Admin can bulk-add members by sending an array of `userId` values.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/admin/cohorts` | Admin | Create cohort |
| `GET` | `/api/v1/cohorts` | Member | List cohorts |
| `GET` | `/api/v1/cohorts/:id` | Member | Cohort detail (overview tab) |
| `GET` | `/api/v1/cohorts/:id/members` | Member | Member list |
| `GET` | `/api/v1/cohorts/:id/sessions` | Member | Session list |
| `GET` | `/api/v1/cohorts/:id/resources` | Member | Resources |
| `POST` | `/api/v1/cohorts/:id/sessions/:sessionId/rsvp` | Member | Toggle session RSVP |
| `PATCH` | `/api/v1/admin/cohorts/:id` | Admin | Update cohort |
| `DELETE` | `/api/v1/admin/cohorts/:id` | Admin | Soft delete |
| `POST` | `/api/v1/admin/cohorts/:id/members` | Admin | Bulk add members |
| `DELETE` | `/api/v1/admin/cohorts/:id/members/:userId` | Admin | Remove member |
| `POST` | `/api/v1/admin/cohorts/:id/sessions` | Admin | Schedule session |
| `PATCH` | `/api/v1/admin/cohorts/:id/sessions/:sessionId` | Admin | Update session |
| `DELETE` | `/api/v1/admin/cohorts/:id/sessions/:sessionId` | Admin | Delete session |
| `PATCH` | `/api/v1/admin/cohorts/:id/sessions/:sessionId/recording` | Admin | Add recording URL |
| `POST` | `/api/v1/admin/cohorts/:id/resources` | Admin | Add resource link |
| `DELETE` | `/api/v1/admin/cohorts/:id/resources/:resourceId` | Admin | Remove resource |
| `POST` | `/api/v1/admin/cohorts/:id/announcements` | Admin | Send announcement |
| `GET` | `/api/v1/admin/cohorts/:id/stats` | Admin | Stats (activeRate, sessionsDone, memberCount) |

### Request bodies

**POST /admin/cohorts**
```json
{
  "name": "Cohort Delta",
  "track": "Engineering Track",
  "description": "Full-stack engineering intensive.",
  "status": "UPCOMING",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "maxMembers": 40
}
```

**POST /admin/cohorts/:id/members (bulk)**
```json
{ "userIds": ["userId1", "userId2"] }
```

**POST /admin/cohorts/:id/sessions**
```json
{
  "title": "Week 1: System Design Workshop",
  "scheduledAt": "2026-04-07T18:00:00.000Z",
  "durationMinutes": 90,
  "meetingPlatform": "ZOOM",
  "meetingLink": "https://zoom.us/j/123456789"
}
```

---

## 2C — Jobs

### Models used
`Job`, `JobReferralRequest`

### Business rules
- Jobs are curated by admin — there is **no in-platform application form**. `applicationLink` is an external URL.
- `featured` toggles the job to the "Featured" section on the board. Unfeatured jobs show under "Unlisted".
- `internalContact` is a free-text name of the community member who shared the lead (optional).
- Members can submit a **referral request** for any job. This is an internal request — not an external application.
- Referral request status flow: `PENDING → FULFILLED | DECLINED`. Admin updates this.
- Soft delete via `deletedAt`.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/admin/jobs` | Admin | Create job listing |
| `GET` | `/api/v1/jobs` | Member | List jobs |
| `GET` | `/api/v1/jobs/:id` | Member | Job detail |
| `POST` | `/api/v1/jobs/:id/referral-request` | Member | Request a referral |
| `PATCH` | `/api/v1/admin/jobs/:id` | Admin | Update job |
| `PATCH` | `/api/v1/admin/jobs/:id/feature` | Admin | Toggle featured |
| `DELETE` | `/api/v1/admin/jobs/:id` | Admin | Soft delete |
| `GET` | `/api/v1/admin/jobs/:id/referral-requests` | Admin | List referral requests |
| `PATCH` | `/api/v1/admin/jobs/referral-requests/:id` | Admin | Update referral status |

### Request bodies

**POST /admin/jobs**
```json
{
  "title": "Senior Product Manager",
  "company": "Shopify",
  "location": "Remote, Canada",
  "jobType": "FULL_TIME",
  "workMode": "REMOTE",
  "applicationLink": "https://careers.shopify.com/job/123",
  "internalContact": "Amara Okafor",
  "featured": true
}
```

**GET /jobs — query params**
- `jobType`: `FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP`
- `workMode`: `REMOTE | HYBRID | ON_SITE`
- `featured`: `true | false`
- `cursor`, `limit` (default 20)

---

## 2D — Community Groups & Posts

### Models used
`CommunityGroup`, `GroupMember`, `GroupChannel`, `Post`, `Comment`

### Business rules
- **Groups** (Interest Groups) are created and edited by admins. Members join voluntarily.
- Each group has one or more **channels** (e.g. `#general`, `#resources`). Channels are created by admin.
- **Posts** belong to a channel. A post with `isAnnouncement: true` and `isPinned: true` is a global broadcast pinned to all member dashboards.
- Members can soft-delete their own posts/comments. Admins can soft-delete any post/comment.
- Rate limiting applies to post and comment creation: **5 posts per minute** per user.
- `deletedAt` marks soft-deleted content — the body is replaced with `[deleted]` in responses.
- A member must be in the group to post in its channels.
- `newPostCount` in the group list is the count of posts created since the member's last visit (or last 7 days for simplicity in MVP).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/admin/community/groups` | Admin | Create group |
| `GET` | `/api/v1/community/groups` | Member | List groups with member count + new post count |
| `GET` | `/api/v1/community/groups/:id` | Member | Group detail |
| `POST` | `/api/v1/community/groups/:id/join` | Member | Join group |
| `DELETE` | `/api/v1/community/groups/:id/leave` | Member | Leave group |
| `PATCH` | `/api/v1/admin/community/groups/:id` | Admin | Update group |
| `DELETE` | `/api/v1/admin/community/groups/:id` | Admin | Soft delete group |
| `POST` | `/api/v1/admin/community/groups/:id/channels` | Admin | Add channel |
| `GET` | `/api/v1/community/groups/:id/channels/:channelId/posts` | Member | Paginated posts |
| `POST` | `/api/v1/community/groups/:id/channels/:channelId/posts` | Member | Create post (rate-limited) |
| `DELETE` | `/api/v1/community/posts/:id` | Member/Admin | Soft delete post |
| `POST` | `/api/v1/community/posts/:id/comments` | Member | Add comment (rate-limited) |
| `DELETE` | `/api/v1/community/comments/:id` | Member/Admin | Soft delete comment |
| `POST` | `/api/v1/admin/community/announce` | Admin | Global pinned announcement |

### Request bodies

**POST /admin/community/groups**
```json
{
  "name": "Career Support",
  "description": "Resume reviews, interview prep, and job postings.",
  "icon": "PEOPLE",
  "colorTheme": "BRAND"
}
```

**POST /admin/community/announce**
```json
{
  "title": "Community Town Hall — April 2026",
  "body": "Join us this Thursday for our monthly town hall..."
}
```

---

## 2E — Recordings

Extends `CohortSession` and `Event` — recording URL is added after the session/event occurs.

### Business rules
- Only YouTube URLs are accepted. Validate with regex: `^https://(www\.)?youtube\.com/watch\?v=` or `^https://youtu\.be/`.
- On save, extract the video ID and construct the thumbnail URL: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`.
- Store both `recordingUrl` (original YouTube URL) and surfacing thumbnail in responses.

### Endpoints
Covered in 2B and 2A respectively:
- `PATCH /api/v1/admin/cohorts/:id/sessions/:sessionId/recording`
- `PATCH /api/v1/admin/events/:id/recording`

**Request body**
```json
{ "recordingUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
```

---

## 2F — Member Directory

### Models used
`User`, `Profile`

### Business rules
- Only users with `isPublic: true` are visible in the directory.
- Suspended or deleted users are excluded.
- No admin-only fields exposed (no `flagCount`, `trustScore`, `role`).
- Members can update their own profile (name, bio, jobTitle, company, industry, location, socials, `isOpenToWork`).
- Avatar upload accepts `image/jpeg` and `image/png`, max 2MB. Store URL after upload (S3 or local in dev).

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/members` | Member | Paginated member directory |
| `GET` | `/api/v1/members/:id` | Member | Profile card |
| `PATCH` | `/api/v1/users/me/profile` | Member | Update own profile |
| `POST` | `/api/v1/users/me/avatar` | Member | Upload avatar |
| `PATCH` | `/api/v1/users/me/privacy` | Member | Toggle `isPublic` |
| `POST` | `/api/v1/users/me/onboarding-complete` | Member | Mark onboarding done |

**PATCH /users/me/profile — body**
```json
{
  "firstName": "Nia",
  "lastName": "Johnson",
  "bio": "Passionate about accessible design.",
  "jobTitle": "Product Designer",
  "company": "BGG Tech",
  "industry": "EdTech",
  "location": "Lagos, Nigeria",
  "isOpenToWork": false,
  "linkedinUrl": "/nia-adebayo",
  "twitterUrl": "@niadesigns",
  "websiteUrl": "nia-designs.com"
}
```

---

## Cross-cutting concerns for Milestone 2

- **Pagination**: use cursor-based pagination on all list endpoints. Response shape:
  ```json
  {
    "success": true,
    "data": [...],
    "meta": { "nextCursor": "...", "hasNextPage": true }
  }
  ```
- **Soft deletes**: all content models use `deletedAt`. Always filter `WHERE deletedAt IS NULL` in queries.
- **Shared response shape**: `{ success: true, data: ... }` for success, `{ success: false, message: "..." }` for errors.
- **Module structure**: follow the established pattern — `router → controller → service → repository`, all class-based.
