# API Integration Tasks

> **Created:** April 16, 2026
> **Backend:** `https://bggather-api.duckdns.org/api/v1`
> **Stack:** SWR + Clerk `getToken()` + centralized `apiClient`
> **Total Phases:** 12 (0–11) | **Ready:** 8 | **Blocked:** 4

---

## Backend Readiness Matrix

| Module | BE Endpoints | BE Status | FE UI |
|--------|:-----------:|:---------:|:-----:|
| Auth + Users | 7 | ✅ Built | ✅ |
| Members | 2 | ✅ Built | ✅ |
| Events | 8 | ✅ Built | ✅ |
| Cohorts | 19 | ✅ Built | ✅ |
| Jobs | 9 | ✅ Built | ✅ |
| Community | 14 | ✅ Built | ✅ |
| Admin Users (suspend/warn/add) | 8 | ❌ PRD only | ✅ |
| Notifications | 3 | ❌ PRD only | ✅ |
| Analytics/Export | 4 | ❌ PRD only | ✅ |
| Moderation (reports) | 7 | ❌ PRD only | ✅ |
| Dev Plan | 6 | ❌ PRD only | ✅ |

---

## Critical Alignment Notes (BE vs FE)

1. **Response shape**: `{ success: true, data: ... }` single items; `{ success: true, data: [...], nextCursor: "..." }` paginated
2. **Roles**: BE uses uppercase `ADMIN | MEMBER`; FE uses lowercase — normalize in hooks
3. **Profile names**: BE uses `firstName`/`lastName`, not single `displayName` — map in onboarding
4. **Privacy**: BE has single `isPublic` boolean; FE has 4 toggles (only one is real)
5. **Avatar**: BE max **2MB** (not 5MB), field name `avatar`, JPEG/PNG/WebP only
6. **Community model**: BE uses Groups → Channels → Posts → Comments hierarchy, not flat
7. **Cohort bulk add**: BE expects `{ userIds: [] }` not emails — partially blocked without `/admin/users`
8. **Public routes** (no auth): events, cohorts, members, jobs list/detail
9. **Event type enum**: `WORKSHOP | QA | SPEAKER_SERIES | SOCIAL | HACKATHON`
10. **RSVP response**: `POST /events/:id/rsvp` → `{ success: true, data: { rsvped: boolean } }`

---

## Phase 0: Foundation — ✅ COMPLETE

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Install `swr` | ✅ Done | `package.json` |
| 2 | Create `.env.local` with `NEXT_PUBLIC_API_URL` | ✅ Done | `.env.local` (NEW) |
| 3 | Create `src/lib/api.ts` — centralized fetch wrapper with Clerk token, JSON/FormData, error handling | ✅ Done | `src/lib/api.ts` (NEW) |
| 4 | Create `src/lib/swr.tsx` — `SWRProvider` with global SWR defaults | ✅ Done | `src/lib/swr.tsx` (NEW) |
| 5 | Create `src/lib/types.ts` — all API types matching BE schemas | ✅ Done | `src/lib/types.ts` (NEW) |
| 6 | Create `src/hooks/use-auth-swr.ts` — `useAuthSWR` wrapper with Clerk token | ✅ Done | `src/hooks/use-auth-swr.ts` (NEW) |
| 7 | Create `src/hooks/use-api-mutation.ts` — reusable POST/PATCH/DELETE + SWR invalidation | ✅ Done | `src/hooks/use-api-mutation.ts` (NEW) |
| 8 | Wrap `SWRProvider` in root `layout.tsx` inside `<ClerkProvider>` | ✅ Done | `src/app/layout.tsx` (MODIFIED) |
| 9 | Verify build succeeds (49/49 pages) | ✅ Done | — |

---

## Phase 1: Auth & User Profile — ✅ COMPLETE

**Depends on:** Phase 0 ✅ | **BE Status:** ✅ 7 endpoints built

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-current-user.ts` → SWR for `GET /users/me` | ✅ Done | `src/hooks/use-current-user.ts` (NEW) |
| 2 | Update `UserContext.tsx` — replace static mock user with `useCurrentUser()` data; normalize role | ✅ Done | `src/context/UserContext.tsx` (MODIFY) |
| 3 | Update `AuthContext.tsx` — strip mock user DB, wire Clerk + API for logout, derive role from API | ✅ Done | `src/context/AuthContext.tsx` (MODIFY) |
| 4 | Wire profile page — `PATCH /users/me/profile`, `POST /users/me/avatar` (FormData, 2MB), `PATCH /users/me/privacy` | ✅ Done | `src/app/member/profile/page.tsx` (MODIFY) |
| 5 | Wire onboarding — `PATCH /users/me/profile` + `POST /users/me/avatar` + `POST /users/me/onboarding-complete` | ✅ Done | `src/app/onboarding/page.tsx` (MODIFY) |
| 6 | Wire `DELETE /auth/account` + sign-out in settings | ✅ Done | `src/app/member/settings/page.tsx` (MODIFY) |
| 7 | Legacy `/auth` page — replaced with redirect to Clerk `/sign-in` | ✅ Done | `src/app/auth/page.tsx` (MODIFY) |

---

## Phase 2: Members Directory — ✅ DONE

**Depends on:** Phase 1 | **BE Status:** ✅ 2 endpoints built

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-members.ts` — `useMembers(cursor?)` + `useMember(id)` | ✅ | `src/hooks/use-members.ts` (NEW) |
| 2 | Wire member directory page — replace mock array, profile modal via `GET /members/:id` | ✅ | `src/app/member/members/page.tsx` (MODIFY) |

---

## Phase 3: Events — Member + Admin — ✅ DONE

**Depends on:** Phase 2 | **BE Status:** ✅ 8 endpoints built | **Can run parallel with Phase 4–6**

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-events.ts` — `useEvents()`, `useEvent(id)`, `rsvpEvent(id)` | ✅ | `src/hooks/use-events.ts` (NEW) |
| 2 | Wire member dashboard Schedule section — replace mock, wire RSVP toggle | ✅ | `src/app/member/page.tsx` (MODIFY) |
| 3 | Wire member schedule page — full events list from API | ✅ | `src/app/member/schedule/page.tsx` (MODIFY) |
| 4 | Create `src/hooks/use-admin-events.ts` — CRUD + RSVP report + recording | ✅ | `src/hooks/use-admin-events.ts` (NEW) |
| 5 | Wire admin events list + create/edit forms | ✅ | `src/app/admin/events/page.tsx` (MODIFY) |
| 6 | Wire admin event detail — RSVP report + recording attachment | ✅ | `src/app/admin/events/[id]/page.tsx` (MODIFY) |

---

## Phase 4: Cohorts — Member + Admin — ✅ DONE

**Depends on:** Phase 2 | **BE Status:** ✅ 19 endpoints built | **Can run parallel with Phase 3**

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-cohorts.ts` — list, detail, members, sessions, resources, session RSVP | ✅ | `src/hooks/use-cohorts.ts` (NEW) |
| 2 | Wire cohort detail tabs (Members, Resources, Sessions, Recordings, Feed) | ✅ | `src/app/member/cohorts/[slug]/page.tsx` (MODIFY) |
| 3 | Wire sidebar nav — derive cohort list from `useCohorts()` instead of hardcoded | ✅ | `src/app/member/layout.tsx` (MODIFY) |
| 4 | Create `src/hooks/use-admin-cohorts.ts` — CRUD, stats, members, sessions, resources, announcements | ✅ | `src/hooks/use-admin-cohorts.ts` (NEW) |
| 5 | Wire admin cohorts list + create | ✅ | `src/app/admin/cohorts/page.tsx` (MODIFY) |
| 6 | Wire admin cohort detail — all tabs + CRUD | ✅ | `src/app/admin/cohorts/[slug]/page.tsx` (MODIFY) |

---

## Phase 5: Jobs & Referrals — ❌ NOT STARTED

**Depends on:** Phase 2 | **BE Status:** ✅ 9 endpoints built | **Can run parallel with Phase 3**

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-jobs.ts` — `useJobs()`, `useJob(id)`, `requestReferral()` | ❌ | `src/hooks/use-jobs.ts` (NEW) |
| 2 | Wire member jobs page — replace mock, wire referral request | ❌ | `src/app/member/jobs/page.tsx` (MODIFY) |
| 3 | Wire member dashboard Featured Jobs section | ❌ | `src/app/member/page.tsx` (MODIFY) |
| 4 | Create `src/hooks/use-admin-jobs.ts` — CRUD, toggle featured, referral requests | ❌ | `src/hooks/use-admin-jobs.ts` (NEW) |
| 5 | Wire admin jobs page — list + create/edit + referral panel | ❌ | `src/app/admin/jobs/page.tsx` (MODIFY) |

---

## Phase 6: Community — ❌ NOT STARTED

**Depends on:** Phase 2 | **BE Status:** ✅ 14 endpoints built | **Can run parallel with Phase 3**

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Create `src/hooks/use-community.ts` — groups, channels, posts, comments, join/leave | ❌ | `src/hooks/use-community.ts` (NEW) |
| 2 | Wire member community page — group/channel hierarchy, join/leave, post/comment CRUD | ❌ | `src/app/member/community/page.tsx` (MODIFY) |
| 3 | Create `src/hooks/use-admin-community.ts` — group CRUD, channels, announcements | ❌ | `src/hooks/use-admin-community.ts` (NEW) |
| 4 | Wire admin community page | ❌ | `src/app/admin/community/page.tsx` (MODIFY) |
| 5 | Wire admin moderation — delete posts/comments (admin can delete any) | ❌ | `src/app/admin/moderation/page.tsx` (MODIFY) |

---

## Phase 7: Dashboard Finalization — ❌ NOT STARTED

**Depends on:** Phases 3–6 | **BE Status:** ✅ All endpoints available

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Final wiring of member dashboard — Schedule → events API, Jobs → jobs API, Recordings → cohort sessions | ❌ | `src/app/member/page.tsx` (MODIFY) |
| 2 | Wire recordings page — derive from cohort sessions with `recordingUrl` | ❌ | `src/app/member/recordings/page.tsx` (MODIFY) |
| 3 | Wire admin dashboard stats — aggregate from `GET /admin/cohorts/:id/stats` | ❌ | `src/app/admin/page.tsx` (MODIFY) |

---

## Phase 8: Admin Members — ⛔ BLOCKED (BE not built)

**BE Status:** ❌ `/admin/users/*` endpoints in PRD only, not implemented

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Wire member list display from `GET /members` | ⏳ Partial possible | Can show public members |
| 2 | Wire suspend/warning/remove/add/bulk-add actions | ⛔ Blocked | Needs `/admin/users/*` endpoints |

**Workaround:** Display member list via `GET /members`, leave action buttons disabled with "Coming soon"

---

## Phase 9: Analytics & Export — ⛔ BLOCKED (BE not built)

**BE Status:** ❌ `/admin/analytics/*` endpoints in PRD only, not implemented

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Wire analytics overview + cohort analytics | ⛔ Blocked | Needs `GET /admin/analytics/overview`, `/cohorts` |
| 2 | Wire export (CSV/PDF) | ⛔ Blocked | Needs `GET /admin/analytics/export` |

**Workaround:** Aggregate from `GET /admin/cohorts/:id/stats` as stopgap

---

## Phase 10: Notifications — ⛔ BLOCKED (BE not built)

**BE Status:** ❌ `/notifications/*` endpoints in PRD only, not implemented

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Wire NotificationsTray — list, mark read, mark all read | ⛔ Blocked | Needs `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |

**Workaround:** Keep mock data in `NotificationsTray.tsx`

---

## Phase 11: Dev Plan — ⛔ BLOCKED (BE not built)

**BE Status:** ❌ `/users/me/plan/*` endpoints in PRD only, not implemented

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Wire dev plan page — CRUD milestones, mark complete | ⛔ Blocked | Needs `GET /users/me/plan`, `PATCH /users/me/plan/milestones/:id/complete`, etc. |
| 2 | Wire Action Center on dashboard | ⛔ Blocked | Same endpoints |

**Workaround:** Keep localStorage persistence

---

## Summary

| Phase | Name | Tasks | Status |
|:-----:|------|:-----:|:------:|
| 0 | Foundation | 9 | ✅ **COMPLETE** |
| 1 | Auth & User Profile | 7 | ✅ **COMPLETE** |
| 2 | Members Directory | 2 | ✅ **COMPLETE** |
| 3 | Events (member + admin) | 6 | ✅ **COMPLETE** |
| 4 | Cohorts (member + admin) | 6 | ✅ **COMPLETE** |
| 5 | Jobs & Referrals | 5 | ❌ Not started |
| 6 | Community | 5 | ❌ Not started |
| 7 | Dashboard Finalization | 3 | ❌ Not started |
| 8 | Admin Members | 2 | ⛔ Blocked |
| 9 | Analytics & Export | 2 | ⛔ Blocked |
| 10 | Notifications | 1 | ⛔ Blocked |
| 11 | Dev Plan | 2 | ⛔ Blocked |
| | **TOTAL** | **49** | **5/12 phases done** |
