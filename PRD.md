# Black Girls Gather — Community Platform

## Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** February 24, 2026  
> **Status:** Draft  

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Feature Specifications](#3-feature-specifications)
   - [3.1 Authentication](#31-authentication)
   - [3.2 User Profiles](#32-user-profiles)
   - [3.3 Programs (Cohorts)](#33-programs-cohorts)
   - [3.4 Sessions (Replays)](#34-sessions-replays)
   - [3.5 Discussion Forums](#35-discussion-forums)
   - [3.6 Notifications](#36-notifications)
   - [3.7 Announcements](#37-announcements)
   - [3.8 Activity Feed](#38-activity-feed)
   - [3.9 Admin Dashboard](#39-admin-dashboard)
4. [Technical Requirements](#4-technical-requirements)
5. [Database Schema](#5-database-schema)
6. [API Endpoints Summary](#6-api-endpoints-summary)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Environment Variables](#8-environment-variables)
9. [Seed Data](#9-seed-data)

---

## 1. Overview

### 1.1 Product Name

**Black Girls Gather (BGG) Community Platform**

### 1.2 Product Type

Web-based community platform (Next.js frontend + REST API backend).

### 1.3 About the Organization

Black Girls Gather is a non-profit organization that equips Black women graduates and entrepreneurs with the tools, strategies, and networks necessary to realize their full potential. Through skill development, mentorship, and community connection, BGG supports participants in strengthening their economic mobility, leadership capacity, and entrepreneurial success. The organization is committed to fostering agency, ensuring that Black women are empowered to define, pursue, and sustain their own pathways to achievement.

### 1.4 Purpose

A centralized community platform to support:

- **Cohort-based programs** — Admin-managed programs that group members into cohorts.
- **Community discussions** — General and cohort-specific discussion forums.
- **Session replays** — Recorded workshop/webinar videos embedded via YouTube.
- **Admin announcements** — Organization-wide communications sent via email.

### 1.5 Target Users

| User Type | Description |
|-----------|-------------|
| **Member** | Black women graduates and entrepreneurs participating in BGG programs or the broader community. |
| **Admin** | BGG staff who manage programs, content, users, and community moderation. |

---

## 2. User Roles & Permissions

There are exactly **two roles**: `member` and `admin`. There are no mentor, cohort leader, or moderator roles.

### 2.1 Member

| Capability | Details |
|------------|---------|
| Register & Log in | Email/password or Google OAuth |
| View programs | Browse all cohort programs and their details |
| View sessions | Watch session replays (embedded YouTube) |
| General forums | Create threads and reply in general community forums |
| Cohort forums | Participate in cohort-specific forums **only if assigned to that cohort by an admin** |
| Profile | View and edit own profile (name, bio, avatar) |
| Notifications | Receive and view in-app notifications |
| Activity feed | View community activity feed |

### 2.2 Admin

Admins inherit **all member capabilities** plus:

| Capability | Details |
|------------|---------|
| Manage programs | Create, edit, delete cohort programs |
| Manage cohort membership | Add/remove users to/from cohorts |
| Manage sessions | Create, edit, delete session replays |
| Create forums | Create general and cohort-specific forums |
| Moderate discussions | Edit/delete any thread or reply; pin/lock threads |
| Send announcements | Broadcast announcements to all members via email |
| Manage users | View all users, ban/unban, change roles |
| View dashboard | Platform-wide analytics and statistics |

---

## 3. Feature Specifications

---

### 3.1 Authentication

Authentication is **JWT-based** with access and refresh tokens stored in **httpOnly cookies**.

---

#### 3.1.1 Registration

**`POST /api/auth/register`** — Public

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `firstName` | string | Yes | Min 1, max 50 characters |
| `lastName` | string | Yes | Min 1, max 50 characters |
| `email` | string | Yes | Valid email format, unique |
| `password` | string | Yes | Min 8 chars; must include uppercase, lowercase, number, and special character |

**Behavior:**

1. Create user with `role: member` and `emailVerified: false`.
2. Generate a time-limited verification token (24-hour expiry).
3. Send a verification email containing a link: `{FRONTEND_URL}/verify-email?token={token}`.
4. Return success message.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Account created. Please check your email to verify your account."
}
```

**Error Cases:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Validation failures | Field-level error messages |
| 409 | Email already in use | "An account with this email already exists." |

---

#### 3.1.2 Email Verification

**`POST /api/auth/verify-email`** — Public

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `token` | string | Yes |

**Behavior:**

1. Look up the token in the database.
2. Check that it has not expired and has not been used.
3. Set `emailVerified: true` on the associated user.
4. Mark the token as used.

**Error Cases:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Token invalid or expired | "Verification link is invalid or has expired." |

---

#### 3.1.3 Resend Verification Email

**`POST /api/auth/resend-verification`** — Public

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |

**Behavior:**

- If the email exists and is unverified, send a new verification email.
- If the email doesn't exist or is already verified, **still return success** (don't reveal account existence).
- **Rate limit:** Max 3 requests per hour per email address.

---

#### 3.1.4 Login (Email & Password)

**`POST /api/auth/login`** — Public

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Behavior:**

1. Validate credentials.
2. If email is not verified → reject with: *"Please verify your email before logging in."*
3. If user is banned → reject with: *"Your account has been suspended."*
4. On success, generate tokens and set as httpOnly cookies.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "member",
      "avatar": "string | null",
      "bio": "string | null"
    }
  }
}
```

**Cookies Set:**

| Cookie | Value | httpOnly | Secure | SameSite | Max-Age |
|--------|-------|----------|--------|----------|---------|
| `accessToken` | JWT | Yes | Yes (prod) | Strict | 15 minutes |
| `refreshToken` | JWT | Yes | Yes (prod) | Strict | 7 days |

**Error Cases:**

| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Invalid credentials | "Invalid email or password." |
| 403 | Email not verified | "Please verify your email before logging in." |
| 403 | User banned | "Your account has been suspended." |

**Rate Limit:** 5 attempts per 15 minutes per IP address.

---

#### 3.1.5 Google OAuth

**`GET /api/auth/google`** — Public  
Redirects the user to Google's OAuth consent screen.

**`GET /api/auth/google/callback`** — Public  
Handles the callback from Google after authorization.

**Behavior:**

1. Receive authorization code from Google.
2. Exchange code for Google user profile (email, name, avatar).
3. **If email matches an existing account:** Log them in (link Google ID to account if not already linked).
4. **If no account exists:** Create a new account with `emailVerified: true`, `role: member`, and the Google profile data.
5. Generate tokens and set as httpOnly cookies.
6. Redirect to `{FRONTEND_URL}/member` (or wherever the frontend expects).

---

#### 3.1.6 Forgot Password

**`POST /api/auth/forgot-password`** — Public

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |

**Behavior:**

1. If the email exists, generate a password reset token (1-hour expiry).
2. Send a reset email with link: `{FRONTEND_URL}/reset-password?token={token}`.
3. **Always** return the same success response regardless of whether the email exists (prevent email enumeration).

**Success Response (200):**

```json
{
  "success": true,
  "message": "If an account with that email exists, a reset link has been sent."
}
```

**Rate Limit:** 3 requests per hour per email address.

---

#### 3.1.7 Reset Password

**`POST /api/auth/reset-password`** — Public

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | Yes | — |
| `password` | string | Yes | Same rules as registration |

**Behavior:**

1. Validate token (exists, not expired, not used).
2. Hash and update the user's password.
3. Mark the token as used.
4. **Invalidate all existing refresh tokens** for this user (forces re-login everywhere).

---

#### 3.1.8 Token Refresh

**`POST /api/auth/refresh-token`** — Cookie-based

**Behavior:**

1. Read `refreshToken` from the httpOnly cookie.
2. Validate the refresh token (exists in DB, not expired, not used).
3. Generate new access token and refresh token.
4. **Invalidate the old refresh token** (refresh token rotation).
5. Set new tokens as httpOnly cookies.

**Error Cases:**

| Status | Condition | Message |
|--------|-----------|---------|
| 401 | Missing or invalid refresh token | "Session expired. Please log in again." |

---

#### 3.1.9 Logout

**`POST /api/auth/logout`** — Auth Required

**Behavior:**

1. Invalidate the current refresh token in the database.
2. Clear both `accessToken` and `refreshToken` cookies.

---

### 3.2 User Profiles

---

#### 3.2.1 Get Current User

**`GET /api/users/me`** — Auth Required

Returns the authenticated user's full profile.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "member | admin",
    "avatar": "string | null",
    "bio": "string | null",
    "cohorts": [
      {
        "id": "uuid",
        "title": "Program Name",
        "status": "active"
      }
    ],
    "emailVerified": true,
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

#### 3.2.2 Update Profile

**`PATCH /api/users/me`** — Auth Required

**Request Body (all fields optional):**

| Field | Type | Validation |
|-------|------|------------|
| `firstName` | string | Min 1, max 50 characters |
| `lastName` | string | Min 1, max 50 characters |
| `bio` | string | Max 500 characters |
| `avatar` | file (multipart) | Max 2MB, jpg/png/webp only |

**Behavior:**

- Avatar uploads go to cloud storage (S3 or Cloudinary). Store the resulting URL in the database.
- Returns the updated user object.

---

#### 3.2.3 Get Public Profile

**`GET /api/users/:userId`** — Auth Required

Returns another user's public profile. Same shape as "Get Current User" but **excludes** `email`.

---

#### 3.2.4 Change Password

**`POST /api/users/me/change-password`** — Auth Required

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `currentPassword` | string | Yes |
| `newPassword` | string | Yes (same validation as registration) |

**Error Cases:**

| Status | Condition | Message |
|--------|-----------|---------|
| 400 | Current password incorrect | "Current password is incorrect." |
| 400 | New password same as current | "New password must be different from current password." |

---

### 3.3 Programs (Cohorts)

Programs represent BGG's cohort-based initiatives (e.g., "Entrepreneurship Bootcamp 2026", "Leadership Accelerator Cohort 3").

**Key rules:**

- All members can **view** all programs.
- Members **cannot self-enroll**. Admins assign members to cohorts.
- Being a cohort member grants access to that cohort's private discussion forum.

---

#### 3.3.1 Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Program name (max 200 chars) |
| `description` | text (rich text) | Detailed program description |
| `coverImage` | string (URL) | Banner/cover image |
| `status` | enum | `upcoming` · `active` · `completed` |
| `startDate` | date | When the program starts |
| `endDate` | date | When the program ends |
| `memberCount` | number | Number of assigned members (computed) |
| `sessionCount` | number | Number of linked sessions (computed) |
| `createdAt` | datetime | — |
| `updatedAt` | datetime | — |

---

#### 3.3.2 List Programs

**`GET /api/programs`** — Auth Required

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `all` | Filter: `upcoming`, `active`, `completed`, `all` |
| `search` | string | — | Search title and description |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Entrepreneurship Bootcamp 2026",
      "description": "...",
      "coverImage": "https://...",
      "status": "active",
      "startDate": "2026-03-01",
      "endDate": "2026-06-01",
      "memberCount": 25,
      "sessionCount": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

#### 3.3.3 Get Program Details

**`GET /api/programs/:programId`** — Auth Required

Returns full program details plus:

- List of sessions under this program (summary: id, title, thumbnail, sessionDate, duration).
- Whether the current user is a member: `isMember: boolean`.
- Member count (but **not** the full member list — privacy for non-admin users).

---

#### 3.3.4 Create Program

**`POST /api/programs`** — Admin Only

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Max 200 chars |
| `description` | string | Yes | — |
| `coverImage` | file (multipart) | No | Max 5MB, jpg/png/webp |
| `status` | enum | Yes | `upcoming`, `active`, `completed` |
| `startDate` | date | Yes | — |
| `endDate` | date | Yes | Must be after `startDate` |

---

#### 3.3.5 Update Program

**`PATCH /api/programs/:programId`** — Admin Only

Same fields as create, all optional.

---

#### 3.3.6 Delete Program

**`DELETE /api/programs/:programId`** — Admin Only

**Behavior:**

- **Soft delete** (sets `deletedAt` timestamp).
- Associated sessions are **not** deleted — they become independent sessions (their `programId` is set to `null`).
- The cohort forum associated with this program is also soft-deleted.

---

#### 3.3.7 Manage Cohort Members

**Add Members:**  
**`POST /api/programs/:programId/members`** — Admin Only

```json
{
  "userIds": ["uuid-1", "uuid-2"]
}
```

- Supports single or bulk add.
- Sends a `cohort_added` notification to each added user.
- Added members gain access to the cohort's discussion forum.

**Remove Member:**  
**`DELETE /api/programs/:programId/members/:userId`** — Admin Only

- Sends a `cohort_removed` notification to the removed user.
- Removed members lose access to the cohort's discussion forum.

**List Members:**  
**`GET /api/programs/:programId/members`** — Admin Only

- Paginated list of cohort members (id, firstName, lastName, avatar, joinedAt).

---

### 3.4 Sessions (Replays)

Sessions are recorded video sessions (workshops, webinars, mentorship calls) embedded via YouTube. A session can either be **independent** (standalone) or **linked to a program**. Both types are valid.

---

#### 3.4.1 Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Session title (max 200 chars) |
| `description` | text (rich text) | Summary or notes for the session |
| `videoUrl` | string | YouTube video URL |
| `thumbnail` | string (URL) | Thumbnail image (auto-extracted from YouTube or manually uploaded) |
| `programId` | UUID (nullable) | Linked program — `null` means independent |
| `programTitle` | string (nullable) | Denormalized program title for listing convenience |
| `duration` | number | Duration in minutes |
| `sessionDate` | date | Original date the session was held |
| `tags` | string[] | Categorization tags (e.g., "leadership", "finance", "branding") |
| `isPublished` | boolean | Only published sessions are visible to members |
| `createdAt` | datetime | — |
| `updatedAt` | datetime | — |

---

#### 3.4.2 List Sessions

**`GET /api/sessions`** — Auth Required

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `programId` | UUID | — | Filter by program. Pass `none` for independent sessions only. Omit for all. |
| `search` | string | — | Search title, description, and tags |
| `tags` | string | — | Comma-separated tag filter (e.g., `leadership,finance`) |
| `sort` | string | `newest` | `newest` or `oldest` |
| `page` | number | 1 | — |
| `limit` | number | 12 | Max 50 |

**Behavior:**

- Non-admin users only see sessions where `isPublished: true`.
- Admin users see all sessions (published and unpublished).

---

#### 3.4.3 Get Session Details

**`GET /api/sessions/:sessionId`** — Auth Required

Returns the full session object including `videoUrl` for YouTube embedding on the frontend.

---

#### 3.4.4 Create Session

**`POST /api/sessions`** — Admin Only

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Max 200 chars |
| `description` | string | Yes | — |
| `videoUrl` | string | Yes | Must be a valid YouTube URL |
| `thumbnail` | file (multipart) | No | Max 2MB, jpg/png/webp. If omitted, auto-extract from YouTube. |
| `programId` | UUID | No | If provided, must reference an existing program |
| `duration` | number | Yes | In minutes |
| `sessionDate` | date | Yes | — |
| `tags` | string[] | No | — |
| `isPublished` | boolean | No | Default: `false` |

**Behavior:**

- When `isPublished` is set to `true`, a `new_session` notification is sent to all members.
- A feed item is created.

---

#### 3.4.5 Update Session

**`PATCH /api/sessions/:sessionId`** — Admin Only

Same fields as create, all optional.

- If `isPublished` changes from `false` to `true`, trigger the notification and feed item.

---

#### 3.4.6 Delete Session

**`DELETE /api/sessions/:sessionId`** — Admin Only

Soft delete.

---

### 3.5 Discussion Forums

The platform has **two types** of forums:

| Type | Access | Description |
|------|--------|-------------|
| **General** | All logged-in members | Community-wide discussions (e.g., "General Discussion", "Introductions") |
| **Cohort** | Only members of that specific cohort | Private discussions for a program's participants |

Each forum contains **threads**, and each thread contains **replies**.

---

#### 3.5.1 Data Models

**Forum:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Forum name |
| `description` | string | Brief purpose description |
| `type` | enum | `general` or `cohort` |
| `programId` | UUID (nullable) | Linked program (only for `cohort` type) |
| `threadCount` | number | Count of threads (computed) |
| `lastActivityAt` | datetime | Timestamp of most recent thread or reply |
| `createdAt` | datetime | — |

**Thread:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `forumId` | UUID | Parent forum |
| `authorId` | UUID | Thread creator |
| `title` | string | Thread title (max 300 chars) |
| `body` | text (rich text) | Thread content (max 10,000 chars) |
| `isPinned` | boolean | Pinned threads appear first |
| `isLocked` | boolean | Locked threads cannot receive new replies |
| `replyCount` | number | Cached reply count |
| `lastActivityAt` | datetime | Updated on each new reply |
| `createdAt` | datetime | — |
| `updatedAt` | datetime | — |

**Reply:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `threadId` | UUID | Parent thread |
| `authorId` | UUID | Reply author |
| `body` | text (rich text) | Reply content (max 5,000 chars) |
| `createdAt` | datetime | — |
| `updatedAt` | datetime | — |

---

#### 3.5.2 List Forums

**`GET /api/forums`** — Auth Required

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `type` | string | `all` — can be `general`, `cohort`, or `all` |

**Access Logic:**

- Always return all `general` forums.
- Only return `cohort` forums where the current user is a member of the linked program.
- Admins see **all** forums.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "General Discussion",
      "description": "Open discussion for the entire community.",
      "type": "general",
      "programId": null,
      "threadCount": 42,
      "lastActivityAt": "2026-02-23T18:00:00Z"
    }
  ]
}
```

---

#### 3.5.3 Create Forum

**`POST /api/forums`** — Admin Only

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Max 100 chars |
| `description` | string | Yes | Max 500 chars |
| `type` | enum | Yes | `general` or `cohort` |
| `programId` | UUID | Conditional | **Required** if `type` is `cohort`; must reference an existing program |

**Note:** Cohort forums are **not** auto-created when a program is created. Admins explicitly create them.

---

#### 3.5.4 Delete Forum

**`DELETE /api/forums/:forumId`** — Admin Only

Soft delete. All threads and replies within are also soft-deleted.

---

#### 3.5.5 List Threads

**`GET /api/forums/:forumId/threads`** — Auth Required + Access Check

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search thread title and body |
| `sort` | string | `latest` | `latest` (by lastActivityAt), `oldest`, `most_replies` |
| `page` | number | 1 | — |
| `limit` | number | 20 | Max 50 |

**Behavior:**

- **Pinned threads always appear first**, regardless of sort order.
- Access check: If the forum is `cohort` type, verify the user is a member of that cohort (or is an admin).

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Tips for pitching to investors",
      "author": {
        "id": "uuid",
        "firstName": "Nia",
        "lastName": "Johnson",
        "avatar": "https://..."
      },
      "replyCount": 12,
      "isPinned": false,
      "isLocked": false,
      "lastActivityAt": "2026-02-20T14:30:00Z",
      "createdAt": "2026-02-18T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### 3.5.6 Get Thread with Replies

**`GET /api/forums/:forumId/threads/:threadId`** — Auth Required + Access Check

**Query Parameters (for replies):**

| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 20 (max 50) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "uuid",
      "forumId": "uuid",
      "title": "Tips for pitching to investors",
      "body": "<p>I've been preparing for my first pitch...</p>",
      "author": {
        "id": "uuid",
        "firstName": "Nia",
        "lastName": "Johnson",
        "avatar": "https://..."
      },
      "isPinned": false,
      "isLocked": false,
      "replyCount": 12,
      "createdAt": "2026-02-18T10:00:00Z",
      "updatedAt": "2026-02-18T10:00:00Z"
    },
    "replies": {
      "data": [
        {
          "id": "uuid",
          "body": "<p>Great question! Here's what worked for me...</p>",
          "author": {
            "id": "uuid",
            "firstName": "Amara",
            "lastName": "Williams",
            "avatar": "https://..."
          },
          "createdAt": "2026-02-18T11:30:00Z",
          "updatedAt": "2026-02-18T11:30:00Z"
        }
      ],
      "pagination": { ... }
    }
  }
}
```

---

#### 3.5.7 Create Thread

**`POST /api/forums/:forumId/threads`** — Auth Required + Access Check

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Max 300 chars |
| `body` | string | Yes | Max 10,000 chars |

**Behavior:**

- Creates a new thread.
- Sets `lastActivityAt` to current time.
- Creates a feed item if the forum is `general` type.

---

#### 3.5.8 Edit Thread

**`PATCH /api/forums/:forumId/threads/:threadId`** — Author or Admin

**Request Body (all optional):**

| Field | Type |
|-------|------|
| `title` | string |
| `body` | string |

Updates `updatedAt`. Frontend shows an "(edited)" indicator when `updatedAt > createdAt`.

---

#### 3.5.9 Delete Thread

**`DELETE /api/forums/:forumId/threads/:threadId`** — Author or Admin

Soft delete. All replies within are also soft-deleted.

---

#### 3.5.10 Create Reply

**`POST /api/forums/:forumId/threads/:threadId/replies`** — Auth Required + Access Check

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `body` | string | Yes | Max 5,000 chars |

**Behavior:**

1. **Reject if thread is locked** → 403: *"This thread is locked."*
2. Increment `replyCount` on the thread.
3. Update `lastActivityAt` on the thread.
4. Send a `forum_reply` notification to the thread author (unless the replier IS the author).

---

#### 3.5.11 Edit Reply

**`PATCH /api/forums/:forumId/threads/:threadId/replies/:replyId`** — Author or Admin

**Request Body:**

| Field | Type |
|-------|------|
| `body` | string |

---

#### 3.5.12 Delete Reply

**`DELETE /api/forums/:forumId/threads/:threadId/replies/:replyId`** — Author or Admin

Soft delete. Decrements `replyCount` on the parent thread.

---

#### 3.5.13 Pin / Unpin Thread

**`PATCH /api/forums/:forumId/threads/:threadId/pin`** — Admin Only

```json
{ "isPinned": true }
```

Sends a `thread_pinned` notification to the thread author when pinning.

---

#### 3.5.14 Lock / Unlock Thread

**`PATCH /api/forums/:forumId/threads/:threadId/lock`** — Admin Only

```json
{ "isLocked": true }
```

---

### 3.6 Notifications

In-app notifications to keep members informed about activity relevant to them.

---

#### 3.6.1 Notification Types

| Type | Trigger | Example Message |
|------|---------|-----------------|
| `forum_reply` | Someone replies to your thread | "Amara replied to your thread 'Tips for pitching to investors'" |
| `cohort_added` | Admin adds you to a cohort | "You've been added to Entrepreneurship Bootcamp 2026" |
| `cohort_removed` | Admin removes you from a cohort | "You've been removed from Entrepreneurship Bootcamp 2026" |
| `announcement` | Admin sends an announcement | "New announcement: Spring Retreat Details" |
| `new_session` | A new session replay is published | "New session available: Building Your Brand" |
| `thread_pinned` | Admin pins your thread | "Your thread 'Tips for pitching' has been pinned" |

---

#### 3.6.2 Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | UUID | Recipient |
| `type` | enum | One of the types above |
| `title` | string | Short notification title |
| `message` | string | Descriptive message |
| `metadata` | JSON | Related entity IDs for frontend navigation (e.g., `{ "threadId": "...", "forumId": "..." }`) |
| `isRead` | boolean | Default: `false` |
| `createdAt` | datetime | — |

---

#### 3.6.3 Endpoints

**List Notifications:**  
**`GET /api/notifications`** — Auth Required

| Param | Type | Default |
|-------|------|---------|
| `isRead` | boolean | — (optional filter) |
| `page` | number | 1 |
| `limit` | number | 20 (max 50) |

Response includes `unreadCount` for the notification badge.

**Mark as Read:**  
**`PATCH /api/notifications/:notificationId/read`** — Auth Required (must be recipient)

**Mark All as Read:**  
**`POST /api/notifications/read-all`** — Auth Required

**Get Unread Count:**  
**`GET /api/notifications/unread-count`** — Auth Required

```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

---

### 3.7 Announcements

Admin-created messages broadcast to **all members** via **email** and stored as in-app notifications.

---

#### 3.7.1 Data Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Announcement title (max 200 chars) |
| `body` | text (rich text) | Announcement content (max 5,000 chars) |
| `authorId` | UUID | Admin who created it |
| `createdAt` | datetime | — |

---

#### 3.7.2 Send Announcement

**`POST /api/announcements`** — Admin Only

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | Yes |
| `body` | string | Yes |

**Behavior:**

1. Save the announcement to the database.
2. Create an `announcement` notification for every active, non-banned user.
3. Send an **email** to every active, non-banned user with the announcement content.
4. Email sending must be **asynchronous** (via a background job queue) to prevent API timeouts.
5. Create a feed item.

---

#### 3.7.3 List Announcements

**`GET /api/announcements`** — Auth Required

Paginated, sorted by `createdAt` descending.

---

#### 3.7.4 Get Announcement Details

**`GET /api/announcements/:announcementId`** — Auth Required

---

### 3.8 Activity Feed

A community-wide feed showing recent public activity on the platform.

---

#### 3.8.1 What Appears in the Feed

| Event | Condition |
|-------|-----------|
| New thread created | Only from **general** forums (cohort threads are private) |
| New session published | When `isPublished` becomes `true` |
| New announcement | When an admin sends an announcement |
| New program created | When an admin creates a program |

---

#### 3.8.2 Get Activity Feed

**`GET /api/feed`** — Auth Required

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 20 (max 50) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "new_thread",
      "title": "Tips for pitching to investors",
      "summary": "I've been preparing for my first pitch...",
      "author": {
        "id": "uuid",
        "firstName": "Nia",
        "lastName": "Johnson",
        "avatar": "https://..."
      },
      "metadata": {
        "threadId": "uuid",
        "forumId": "uuid"
      },
      "createdAt": "2026-02-20T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 3.9 Admin Dashboard

---

#### 3.9.1 Dashboard Stats

**`GET /api/admin/stats`** — Admin Only

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalUsers": 250,
    "activeUsers": 180,
    "bannedUsers": 3,
    "totalPrograms": 8,
    "activePrograms": 3,
    "totalSessions": 45,
    "totalThreads": 120,
    "totalReplies": 890,
    "newUsersThisMonth": 15,
    "newUsersThisWeek": 4
  }
}
```

---

#### 3.9.2 User Management

**List Users:**  
**`GET /api/admin/users`** — Admin Only

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search by name or email |
| `role` | string | — | Filter by `member` or `admin` |
| `status` | string | — | Filter: `active` or `banned` |
| `page` | number | 1 | — |
| `limit` | number | 20 | Max 50 |

**Get User Details:**  
**`GET /api/admin/users/:userId`** — Admin Only

Returns full user profile including cohort memberships and activity counts (threads, replies).

**Ban User:**  
**`POST /api/admin/users/:userId/ban`** — Admin Only

```json
{ "reason": "Violation of community guidelines" }
```

- Sets user as banned.
- Invalidates all their active refresh tokens (immediately logs them out).

**Unban User:**  
**`POST /api/admin/users/:userId/unban`** — Admin Only

**Change Role:**  
**`PATCH /api/admin/users/:userId/role`** — Admin Only

```json
{ "role": "admin" }
```

---

## 4. Technical Requirements

### 4.1 API Standards

- **RESTful API** with JSON request/response bodies.
- Base URL: `/api` (e.g., `https://api.blackgirlsgather.com/api`).
- All endpoints (except public auth routes) require a valid `accessToken` in an httpOnly cookie.

### 4.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| `200` | Successful read or update |
| `201` | Successful creation |
| `204` | Successful deletion (no content) |
| `400` | Validation error or bad request |
| `401` | Not authenticated |
| `403` | Forbidden (insufficient permissions, banned, unverified, locked thread) |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `429` | Rate limited |
| `500` | Internal server error |

### 4.3 Standard Error Response

```json
{
  "success": false,
  "message": "Human-readable summary of the error.",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use."
    }
  ]
}
```

The `errors` array is included only for validation errors. For other error types, just `message` is sufficient.

### 4.4 Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

The `pagination` object is only included for list endpoints.

### 4.5 Authentication & Security

| Requirement | Details |
|------------|---------|
| Token type | JWT (access + refresh) |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 7 days |
| Token storage | httpOnly, Secure (in production), SameSite=Strict cookies |
| Refresh token rotation | Old token invalidated after each refresh |
| Password hashing | bcrypt with minimum 12 salt rounds |
| CORS | Restrict to frontend domain only |
| Input sanitization | Sanitize all rich text to prevent XSS |
| SQL injection | Use parameterized queries or ORM |
| HTTPS | Required in production |

### 4.6 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | 5 per 15 min per IP |
| `POST /api/auth/register` | 3 per hour per IP |
| `POST /api/auth/forgot-password` | 3 per hour per email |
| `POST /api/auth/resend-verification` | 3 per hour per email |
| All other endpoints | 100 per minute per user (general protection) |

### 4.7 File Uploads

| Upload Type | Max Size | Allowed Formats |
|-------------|----------|-----------------|
| User avatar | 2 MB | jpg, png, webp |
| Program cover image | 5 MB | jpg, png, webp |
| Session thumbnail | 2 MB | jpg, png, webp |

- Store uploads in **cloud storage** (AWS S3 or Cloudinary recommended).
- Return the public URL and store it in the database.
- Generate a unique filename to avoid collisions.

### 4.8 Email Service

Transactional emails are required for:

| Email Type | Trigger |
|------------|---------|
| Verification email | User registers |
| Password reset email | User requests password reset |
| Announcement email | Admin sends announcement |

**Requirements:**

- Use a transactional email provider (SendGrid, AWS SES, Resend, or similar).
- Sender address: `noreply@blackgirlsgather.com` (or configured via env var).
- Email templates should be HTML-formatted and mobile-responsive.
- Announcement emails must be sent via a **background job queue** (e.g., Bull, BullMQ, Celery) to handle bulk sending without blocking the API.

### 4.9 Database

- **PostgreSQL** (recommended).
- All tables include `createdAt` and `updatedAt` timestamps (auto-managed).
- Soft deletes via `deletedAt` column on: programs, sessions, forums, threads, replies.
- Soft-deleted records are excluded from all queries by default.

**Required Indexes:**

| Table | Columns | Purpose |
|-------|---------|---------|
| `users` | `email` (unique) | Login lookup |
| `users` | `googleId` (unique, partial) | OAuth lookup |
| `threads` | `forumId`, `lastActivityAt` | Thread listing sorted by activity |
| `threads` | `forumId`, `isPinned`, `lastActivityAt` | Pin-first sorting |
| `replies` | `threadId`, `createdAt` | Reply listing |
| `notifications` | `userId`, `isRead`, `createdAt` | Notification listing + unread count |
| `sessions` | `programId` | Sessions by program |
| `program_members` | `programId`, `userId` (unique) | Membership lookup |
| `feed_items` | `createdAt` | Feed listing |

---

## 5. Database Schema

```
users
├── id              UUID, PK
├── firstName       VARCHAR(50), NOT NULL
├── lastName        VARCHAR(50), NOT NULL
├── email           VARCHAR(255), NOT NULL, UNIQUE
├── passwordHash    VARCHAR(255), NULLABLE  (null for Google-only accounts)
├── googleId        VARCHAR(255), NULLABLE, UNIQUE
├── role            ENUM('member', 'admin'), DEFAULT 'member'
├── avatar          VARCHAR(500), NULLABLE
├── bio             TEXT, NULLABLE
├── emailVerified   BOOLEAN, DEFAULT false
├── isBanned        BOOLEAN, DEFAULT false
├── banReason       VARCHAR(500), NULLABLE
├── createdAt       TIMESTAMP, DEFAULT NOW()
├── updatedAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

tokens
├── id              UUID, PK
├── userId          UUID, FK → users.id
├── token           VARCHAR(500), NOT NULL
├── type            ENUM('refresh', 'email_verification', 'password_reset')
├── expiresAt       TIMESTAMP, NOT NULL
├── isUsed          BOOLEAN, DEFAULT false
└── createdAt       TIMESTAMP, DEFAULT NOW()

programs
├── id              UUID, PK
├── title           VARCHAR(200), NOT NULL
├── description     TEXT, NOT NULL
├── coverImage      VARCHAR(500), NULLABLE
├── status          ENUM('upcoming', 'active', 'completed'), NOT NULL
├── startDate       DATE, NOT NULL
├── endDate         DATE, NOT NULL
├── createdAt       TIMESTAMP, DEFAULT NOW()
├── updatedAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

program_members
├── id              UUID, PK
├── programId       UUID, FK → programs.id, NOT NULL
├── userId          UUID, FK → users.id, NOT NULL
├── joinedAt        TIMESTAMP, DEFAULT NOW()
└── UNIQUE(programId, userId)

sessions
├── id              UUID, PK
├── title           VARCHAR(200), NOT NULL
├── description     TEXT, NOT NULL
├── videoUrl        VARCHAR(500), NOT NULL
├── thumbnail       VARCHAR(500), NULLABLE
├── programId       UUID, FK → programs.id, NULLABLE
├── duration        INTEGER, NOT NULL  (minutes)
├── sessionDate     DATE, NOT NULL
├── tags            TEXT[]  (PostgreSQL array, or JSON)
├── isPublished     BOOLEAN, DEFAULT false
├── createdAt       TIMESTAMP, DEFAULT NOW()
├── updatedAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

forums
├── id              UUID, PK
├── name            VARCHAR(100), NOT NULL
├── description     TEXT, NOT NULL
├── type            ENUM('general', 'cohort'), NOT NULL
├── programId       UUID, FK → programs.id, NULLABLE
├── createdAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

threads
├── id              UUID, PK
├── forumId         UUID, FK → forums.id, NOT NULL
├── authorId        UUID, FK → users.id, NOT NULL
├── title           VARCHAR(300), NOT NULL
├── body            TEXT, NOT NULL
├── isPinned        BOOLEAN, DEFAULT false
├── isLocked        BOOLEAN, DEFAULT false
├── replyCount      INTEGER, DEFAULT 0
├── lastActivityAt  TIMESTAMP, DEFAULT NOW()
├── createdAt       TIMESTAMP, DEFAULT NOW()
├── updatedAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

replies
├── id              UUID, PK
├── threadId        UUID, FK → threads.id, NOT NULL
├── authorId        UUID, FK → users.id, NOT NULL
├── body            TEXT, NOT NULL
├── createdAt       TIMESTAMP, DEFAULT NOW()
├── updatedAt       TIMESTAMP, DEFAULT NOW()
└── deletedAt       TIMESTAMP, NULLABLE

notifications
├── id              UUID, PK
├── userId          UUID, FK → users.id, NOT NULL
├── type            ENUM('forum_reply', 'cohort_added', 'cohort_removed',
│                        'announcement', 'new_session', 'thread_pinned')
├── title           VARCHAR(200), NOT NULL
├── message         TEXT, NOT NULL
├── metadata        JSONB, NULLABLE
├── isRead          BOOLEAN, DEFAULT false
└── createdAt       TIMESTAMP, DEFAULT NOW()

announcements
├── id              UUID, PK
├── title           VARCHAR(200), NOT NULL
├── body            TEXT, NOT NULL
├── authorId        UUID, FK → users.id, NOT NULL
└── createdAt       TIMESTAMP, DEFAULT NOW()

feed_items
├── id              UUID, PK
├── type            ENUM('new_thread', 'new_session', 'announcement', 'new_program')
├── referenceId     UUID, NOT NULL  (ID of the related entity)
├── title           VARCHAR(300), NOT NULL
├── summary         TEXT, NULLABLE
├── authorId        UUID, FK → users.id, NULLABLE
├── metadata        JSONB, NULLABLE
└── createdAt       TIMESTAMP, DEFAULT NOW()
```

---

## 6. API Endpoints Summary

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/login` | Log in with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Log out (requires auth) |

### Users (Auth Required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Any | Get current user profile |
| PATCH | `/api/users/me` | Any | Update profile |
| POST | `/api/users/me/change-password` | Any | Change password |
| GET | `/api/users/:userId` | Any | Get public profile |

### Programs (Auth Required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/programs` | Any | List all programs |
| GET | `/api/programs/:id` | Any | Get program details |
| POST | `/api/programs` | Admin | Create program |
| PATCH | `/api/programs/:id` | Admin | Update program |
| DELETE | `/api/programs/:id` | Admin | Delete program |
| GET | `/api/programs/:id/members` | Admin | List cohort members |
| POST | `/api/programs/:id/members` | Admin | Add members to cohort |
| DELETE | `/api/programs/:id/members/:userId` | Admin | Remove member from cohort |

### Sessions (Auth Required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/sessions` | Any | List sessions |
| GET | `/api/sessions/:id` | Any | Get session details |
| POST | `/api/sessions` | Admin | Create session |
| PATCH | `/api/sessions/:id` | Admin | Update session |
| DELETE | `/api/sessions/:id` | Admin | Delete session |

### Forums (Auth Required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/forums` | Any | List accessible forums |
| GET | `/api/forums/:id` | Any + Access | Get forum details |
| POST | `/api/forums` | Admin | Create forum |
| DELETE | `/api/forums/:id` | Admin | Delete forum |

### Threads (Auth Required + Access Check)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/forums/:fid/threads` | Any + Access | List threads |
| GET | `/api/forums/:fid/threads/:tid` | Any + Access | Get thread with replies |
| POST | `/api/forums/:fid/threads` | Any + Access | Create thread |
| PATCH | `/api/forums/:fid/threads/:tid` | Author/Admin | Edit thread |
| DELETE | `/api/forums/:fid/threads/:tid` | Author/Admin | Delete thread |
| PATCH | `/api/forums/:fid/threads/:tid/pin` | Admin | Pin/unpin thread |
| PATCH | `/api/forums/:fid/threads/:tid/lock` | Admin | Lock/unlock thread |

### Replies (Auth Required + Access Check)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/forums/:fid/threads/:tid/replies` | Any + Access | Create reply |
| PATCH | `/api/forums/:fid/threads/:tid/replies/:rid` | Author/Admin | Edit reply |
| DELETE | `/api/forums/:fid/threads/:tid/replies/:rid` | Author/Admin | Delete reply |

### Notifications (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| POST | `/api/notifications/read-all` | Mark all as read |

### Announcements (Auth Required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/announcements` | Any | List announcements |
| GET | `/api/announcements/:id` | Any | Get announcement details |
| POST | `/api/announcements` | Admin | Send announcement |

### Feed (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get activity feed |

### Admin (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user details |
| POST | `/api/admin/users/:id/ban` | Ban user |
| POST | `/api/admin/users/:id/unban` | Unban user |
| PATCH | `/api/admin/users/:id/role` | Change user role |

### Health Check (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

**Total: 48 endpoints**

---

## 7. Non-Functional Requirements

### 7.1 Performance

- API response time under 500ms for all endpoints under normal load.
- Initial capacity: 1,000 concurrent users.
- Bulk email sending (announcements) must not block the API — use background jobs.

### 7.2 Scalability

- Stateless API (JWT-based, no server sessions).
- Cloud file storage (not local filesystem).
- Proper database indexing and pagination on all list endpoints.
- Background job queue for async tasks (emails, bulk notifications).

### 7.3 Security

- HTTPS enforced in production.
- httpOnly cookies (tokens never exposed to JavaScript).
- CORS restricted to the frontend domain.
- Rate limiting on authentication and sensitive endpoints.
- Passwords never stored in plain text (bcrypt with 12+ rounds).
- Admin routes protected by role-checking middleware.
- Cohort forum access verified on every request (not just frontend).
- Input sanitization on all user-submitted content.

### 7.4 Reliability

- Consistent error responses across all endpoints.
- No stack traces exposed to clients.
- Soft deletes to allow data recovery.
- Graceful handling of third-party service failures (email, storage).

### 7.5 Monitoring

- Request logging: method, path, status code, response time.
- Error logging with full stack traces (server-side only).
- Health check endpoint: `GET /api/health` → `{ "status": "ok" }`.

---

## 8. Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `NODE_ENV` | Environment | `development` · `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/bgg` |
| `JWT_ACCESS_SECRET` | Access token signing secret | Random 256-bit string |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Random 256-bit string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Console |
| `FRONTEND_URL` | Frontend URL (CORS + email links) | `https://blackgirlsgather.com` |
| `SMTP_HOST` | Email service host | `smtp.sendgrid.net` |
| `SMTP_PORT` | Email service port | `587` |
| `SMTP_USER` | Email service username | `apikey` |
| `SMTP_PASS` | Email service password | SendGrid API key |
| `EMAIL_FROM` | Sender email address | `noreply@blackgirlsgather.com` |
| `CLOUD_STORAGE_BUCKET` | S3 bucket or Cloudinary cloud name | `bgg-uploads` |
| `CLOUD_STORAGE_KEY` | Cloud storage access key | From provider |
| `CLOUD_STORAGE_SECRET` | Cloud storage secret | From provider |
| `REDIS_URL` | Redis URL (for job queue) | `redis://localhost:6379` |

---

## 9. Seed Data

For development and testing, provide seed scripts that create:

1. **Admin account**
   - Email: `admin@blackgirlsgather.com`
   - Password: `Admin123!`
   - Role: `admin`

2. **5 test member accounts** with verified emails

3. **2 sample programs**
   - 1 with status `active`, 3 members assigned
   - 1 with status `completed`, 2 members assigned

4. **5 sample sessions**
   - 3 linked to the active program
   - 2 independent (no program)
   - All with `isPublished: true`

5. **3 forums**
   - "General Discussion" (general)
   - "Introductions" (general)
   - 1 cohort forum linked to the active program

6. **Sample threads and replies**
   - 2–3 threads per forum
   - 3–5 replies per thread

7. **1 sample announcement**

---

*End of document.*
