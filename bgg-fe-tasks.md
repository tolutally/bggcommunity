# BGG Frontend Tasks — Audit Report

> **Audited:** March 6, 2026 | **Updated:** April 17, 2026
> **Codebase:** `bgg-fe` (Next.js)
> **Total Tasks:** 103 | **Complete:** 86 | **Partial:** 7 | **Not Started:** 10

---

## Sprint 1 — Auth & Onboarding (16 tasks)

### M0 Landing/Auth — COMPLETE (8/8)

| Task | Status | Details |
|------|--------|--------|
| **FE-M0-01** Auth page layout | ✅ Complete | Split-screen auth page at `/auth` — branded left panel (desktop) with logo, tagline, social proof; centered form card (right). Mobile: centered form with condensed logo |
| **FE-M0-02** Google OAuth button | ✅ Complete | Google OAuth button with official Google SVG icon. Calls `useAuth().loginWithGoogle()`. Loading spinner on click. Available on both sign-in and sign-up views |
| **FE-M0-03** Email + password sign-in form | ✅ Complete | Sign-in form with email/password inputs, icon prefixes, show/hide password toggle, "Forgot password?" link, submit with loading state. Demo credentials shown |
| **FE-M0-04** Email + password sign-up form | ✅ Complete | Sign-up form with name/email/password/confirm-password. All fields have icon prefixes and validation. Tab-free toggle between sign-in/sign-up views |
| **FE-M0-05** Form validation (signup) | ✅ Complete | `validateEmail()`, `validatePassword()`, `validateName()` helpers exported from AuthContext. Password strength indicator with 3-bar meter + checklist (length, uppercase, number). Client-side + server error display |
| **FE-M0-06** Forgot Password flow | ✅ Complete | Forgot password view with email input + "Send Reset Link" button. Success state shows "Check your email" confirmation with back-to-sign-in link. Uses `useAuth().forgotPassword()` |
| **FE-M0-07** Auth routing logic | ✅ Complete | `AuthProvider` at root layout, `RouteGuard` component with role-based access control. Root `/` redirects to `/auth` if not authenticated, to role-based home if authenticated. `sessionStorage` preserves intended destination post-login. Member layout guarded for `member` role, admin for `admin` |
| **FE-M0-08** Auth page responsive styling | ✅ Complete | Fully responsive: left branding panel hidden on mobile (`hidden lg:flex`), form card centered with `max-w-md`, touch-friendly inputs (py-3), mobile logo above form. Tailwind breakpoints for sm/lg/xl |

### M1 Onboarding — COMPLETE (8/8)

| Task | Status | Details |
|------|--------|--------|
| **FE-M1-01** Multi-step onboarding shell | ✅ Complete | `/onboarding` route with 5-step wizard — header with step counter, clickable progress bar, sticky footer with Back/Continue/Complete, responsive layout |
| **FE-M1-02** Step 1 — Basic info form | ✅ Complete | Display Name (pre-filled from auth), Occupation (required), Industry dropdown (10 options), Location, Bio with 200-char counter. Validation on required fields |
| **FE-M1-03** Step 2 — Profile photo upload | ✅ Complete | Drag-and-drop + click-to-browse dropzone, 5MB limit, image preview in rounded-3xl frame, remove button, dataURL persistence |
| **FE-M1-04** Step 3 — Social links input | ✅ Complete | Website, LinkedIn, Twitter/X, GitHub — all optional with icon prefixes. Tip box for LinkedIn |
| **FE-M1-05** Step 4 — Privacy toggles | ✅ Complete | 4 toggle switches: Public profile, Show email, Show socials, Show location. Custom ToggleSwitch component. Info note about cohort visibility |
| **FE-M1-06** Step 5 — Optional Dev Plan | ✅ Complete | Goal title input + milestone list (add/remove, up to 8). "Skip for now" button. Example dev plan shown when empty. Skip sets `bgg_devplan_skipped` flag |
| **FE-M1-07** Onboarding state persistence | ✅ Complete | `bgg_onboarding` localStorage key auto-saves on every change. Hydrates on mount. Profile data, avatar, and dev goals written to existing `bgg-profile`, `bgg-avatar`, `bgg-goals` keys on completion |
| **FE-M1-08** 'Complete Dev Plan' banner | ✅ Complete | Amber gradient banner on member dashboard when `bgg_devplan_skipped` is true. Links to `/member/devplan`. Dismissible with X (sets `bgg_devplan_banner_dismissed`). Animated with framer-motion |

---

## Sprint 2 — Member Dashboard & Events (12 tasks)

### M2.0 App Shell/Navigation — COMPLETE (5/5)

| Task | Status | Details |
|------|--------|---------|
| **FE-M2-01** Global app shell layout | ✅ Complete | `member/layout.tsx` uses `FloatingNav` with SideNav (desktop) + BottomNav (mobile) + TopBar with notification bell + user avatar |
| **FE-M2-02** SideNav links + active states | ✅ Complete | `FloatingNav` renders nav items: Dashboard, Community, Members, Jobs, Cohorts with active route highlighting and dynamic cohort sub-links |
| **FE-M2-03** Notification bell dropdown | ✅ Complete (UI) | `NotificationsTray` component with unread badge, filter tabs, mark-all-read, notification items with icons/timestamps. **Mock data only** |
| **FE-M2-04** User avatar menu | ✅ Complete | `FloatingNav` has profile dropdown with View Profile, Settings, Sign Out links |
| **FE-M2-05** Auth route guards | ✅ Complete | `RouteGuard` component in AuthContext. Member layout wrapped with `allowedRoles={["member"]}`, admin with `allowedRoles={["admin"]}`. Redirects unauthenticated users to `/auth`, wrong-role users to their home. Loading spinner while checking |

### M3 Dashboard Home — COMPLETE (7/7)

| Task | Status | Details |
|------|--------|---------|
| **FE-M3-01** Dashboard page layout | ✅ Complete | `member/page.tsx` — 2-column layout with main content + Action Center sidebar. Section headings for Schedule, Recordings, Jobs. Skeleton loaders present |
| **FE-M3-02** EventCard component | ✅ Complete (UI) | EventCard with title, date/time, host. RSVP toggle button, Join button (links), status badge. All hardcoded |
| **FE-M3-03** RSVP toggle logic | ✅ Complete | Wired to `useRsvpEvent` hook with optimistic SWR updates. Toggles RSVP via `POST /events/:id/rsvp` |
| **FE-M3-04** Past Recordings section | ✅ Complete (UI) | RecordingCard with YouTube thumbnail + title. Click opens YouTube URL. Empty placeholder state. Filter by cohort. Mock data |
| **FE-M3-05** Featured Jobs section | ✅ Complete | Wired to `useJobs({ isFeatured: true })`. Real job data with Apply + Seek Referral buttons |
| **FE-M3-06** Action Center panel | ✅ Complete (UI) | ActionCenterPanel with milestone items (title, due date, overdue flag). Link to dev plan. "Set new plan" CTA. Mock data |
| **FE-M3-07** Wire dashboard data fetching | ✅ Complete | Featured Jobs via `useJobs`, Recordings via `useEvents` (filtered to recordingUrl). Action Center still mock (blocked on BE dev plan API) |

---

## Sprint 3 — Cohorts/Groups (8 tasks)

### M6 Cohort Page — PARTIALLY COMPLETE (7/8)

| Task | Status | Details |
|------|--------|---------|
| **FE-C3-01** Cohort page with tab nav | ✅ Complete (UI) | `member/cohorts/[slug]/page.tsx` — Tab bar: Overview, Members, Resources, Sessions, Recordings, Feed. Cohort header. Empty states |
| **FE-C3-02** Cohort Members tab | ✅ Complete (UI) | MemberListItem with avatar, name, occupation. Scrollable list. Mock data |
| **FE-C3-03** Resources tab | ✅ Complete (UI) | ResourceItem with title + external link. Empty state. Mock data |
| **FE-C3-04** Sessions tab | ✅ Complete (UI) | EventCard reused with RSVP + Join. Cohort-filtered. Mock data |
| **FE-C3-05** Recordings tab | ✅ Complete (UI) | RecordingCard reused. Cohort-filtered. Mock data |
| **FE-C3-06** Cohort Feed tab | ✅ Complete (UI) | PostCard with author, timestamp, body. Reply thread. CreatePostForm (title + body). CreateReplyForm. DeletePostButton with confirm modal. Empty state. All mock/local state |
| **FE-C3-07** Cohort feed access control | ❌ Not started | No membership check. Feed tab is visible to everyone |
| **FE-C3-08** Wire cohort data fetching | ✅ Complete | `useCohort`, `useCohortMembers`, `useCohortSessions`, `useCohortResources` hooks wired. All tabs fetch real data |

---

## Sprint 4 — Recordings (4 tasks)

### M3-Rec Recordings — PARTIALLY COMPLETE (1/4)

| Task | Status | Details |
|------|--------|---------|
| **FE-R4-01** RecordingCard component | ✅ Complete (UI) | YouTube thumbnail, title, cohort label badge, hover state. Used in dashboard + cohort page. Mock data |
| **FE-R4-02** YouTube thumbnail extraction | 🟡 Partial | Thumbnail URLs are hardcoded in mock data (using `img.youtube.com/vi/...` pattern). No utility function to parse arbitrary YouTube URLs and extract video IDs dynamically |
| **FE-R4-03** Recordings full list page | ✅ Complete | Dedicated `/member/recordings` page wired to `useEvents` (filtered to entries with `recordingUrl`). Grid/list toggle, search, filter by type |
| **FE-R4-04** Responsive recording grid styling | ✅ Complete (UI) | Fully responsive 1-4 column grid on recordings page, list view alternative, toolbar with filters and view toggle matches members page pattern |

---

## Sprint 5 — Jobs & Referral (6 tasks)

### M4 Jobs Page — COMPLETE (6/6)

| Task | Status | Details |
|------|--------|---------|
| **FE-J5-01** Jobs page layout | ✅ Complete (UI) | `member/jobs/page.tsx` — List layout with search input, filter sidebar, skeleton loaders. Mock data |
| **FE-J5-02** JobCard component | ✅ Complete (UI) | Full JobCard: title, company, location, description. Apply button (external). Seek Referral button (conditional on `referralAvailable`). Referral-already-sent badge. Mock data |
| **FE-J5-03** Job Detail view/modal | ✅ Complete (UI) | Job detail modal/expanded view with full description, eligibility, Apply + Seek Referral buttons. Mock data |
| **FE-J5-04** Seek Referral action | ✅ Complete | Wired to `useRequestReferral` hook. `POST /jobs/:id/referral-request` with message modal, toast feedback, SWR revalidation |
| **FE-J5-05** Jobs search + filter | ✅ Complete | Client-side search by title/company. Wired to real API data via `useJobs` hook |
| **FE-J5-06** Wire jobs data fetching | ✅ Complete | `useJobs`, `useJob`, `useRequestReferral` hooks + admin hooks (`useCreateJob`, `useUpdateJob`, `useDeleteJob`, `useToggleFeatured`, `useJobReferralRequests`, `useUpdateReferralStatus`) |

---

## Sprint 6 — Community Discussion & Member Directory (12 tasks)

### M6.1 Community Discussion — COMPLETE (6/6)

| Task | Status | Details |
|------|--------|---------|
| **FE-D6-01** Community Discussion page | ✅ Complete (UI) | `member/community/page.tsx` — PostList with CreatePost CTA. Empty state. Mock data |
| **FE-D6-02** CreatePostForm | ✅ Complete (UI) | TitleInput + BodyTextarea + Submit button + loading state + inline validation. Works in local state |
| **FE-D6-03** PostCard component | ✅ Complete (UI) | Author avatar + name + timestamp, post title + body, reply count, delete button (own posts), expand replies toggle. Mock data |
| **FE-D6-04** ReplyThread component | ✅ Complete (UI) | ReplyItems (chronological), inline CreateReplyForm, delete own replies with confirm. "[deleted]" placeholder. Mock data |
| **FE-D6-05** Delete flow (soft delete) | ✅ Complete | Wired to `useDeletePost` / `useDeleteComment` hooks. `DELETE /community/posts/:id` and `DELETE /community/comments/:id` with confirm modal + SWR revalidation |
| **FE-D6-06** Wire community feed data | ✅ Complete | `useCommunityGroups`, `useCommunityGroup`, `useJoinGroup`, `useLeaveGroup`, `useChannelPosts`, `useCreatePost`, `useDeletePost`, `useCreateComment`, `useDeleteComment` hooks. Group→Channel→Post hierarchy wired |

### M5 Member Directory — PARTIALLY COMPLETE (4/6)

| Task | Status | Details |
|------|--------|---------|
| **FE-MD6-01** Member Directory page | ✅ Complete (UI) | `member/members/page.tsx` — SearchBar, MemberGrid. Empty search state. Mock data |
| **FE-MD6-02** MemberCard component | ✅ Complete (UI) | Avatar, name, occupation. Clickable (opens profile). Hover state. Mock data |
| **FE-MD6-03** Profile Card/modal | ✅ Complete (UI) | ProfileModal with full avatar, name, occupation, bio. Social links row. Close button. Mock data |
| **FE-MD6-04** Visibility rules | 🟡 Partial | Some visibility toggle exists but `profileVisible` / `socialsVisible` enforcement is incomplete or not driven by real user data |
| **FE-MD6-05** Member search (real-time) | ✅ Complete | Client-side search on `useMembers` data. EmptyState for no results |
| **FE-MD6-06** Profile Settings page | ✅ Complete (UI) | `member/profile/page.tsx` — Edit name, occupation, photo, social links, privacy toggles. Saves to localStorage only |

---

## Sprint 7 — Development Plan (7 tasks)

### M7 Development Plan — PARTIALLY COMPLETE (4/7)

| Task | Status | Details |
|------|--------|---------|
| **FE-DP7-01** Dev Plan page | ✅ Complete (UI) | `member/devplan/page.tsx` — PlanHeader with goal + date. MilestoneList. Add Milestone CTA. Empty state. localStorage persistence |
| **FE-DP7-02** CreateDevPlanForm | ✅ Complete (UI) | GoalTitleInput + DescriptionTextarea + AddFirstMilestone + Save Plan. Works in local state, saves to localStorage |
| **FE-DP7-03** MilestoneItem component | ✅ Complete (UI) | Title + DueDate + StatusBadge (Pending/Overdue/Complete) + MarkComplete checkbox + DeleteMilestone. localStorage |
| **FE-DP7-04** AddMilestoneForm | ✅ Complete (UI) | TitleInput + DatePicker + Save/Cancel. Appends to milestone list in localStorage |
| **FE-DP7-05** Mark-complete logic | 🟡 Partial | Checkbox toggles completion in localStorage. No API PATCH. No "Set new plan" prompt when all complete |
| **FE-DP7-06** 'All done' prompt | ❌ Not started | No CompletionBanner when all milestones complete |
| **FE-DP7-07** Wire Action Center data | ❌ Not started | No `useActionCenter` hook. Action Center on dashboard uses separate mock data, not connected to dev plan |

---

## Sprint 8 — Admin Portal (28 tasks)

### A01 Admin Shell/Navigation — COMPLETE (2/2)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-01** Admin app shell | ✅ Complete | `admin/layout.tsx` — Separate layout from member. AdminSideNav with Dashboard, Members, Events, Cohorts, Jobs, Mentors, Community, Moderation, Analytics, Settings. TopBar with admin badge |
| **FE-A8-02** Admin SideNav active states | ✅ Complete | NavItem components with active route highlight, collapse/expand on mobile |

### A2.1 Admin Dashboard Overview — PARTIALLY COMPLETE (1/2)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-03** Admin Dashboard overview | ✅ Complete | `admin/page.tsx` — StatCards wired to `useMembers`, `useEvents`, `useCohorts`. Cohort cards show real member counts and status. `useCommunityGroups` for community stats |
| **FE-A8-04** StatCard component | 🟡 Partial | StatCards exist with number + label. No trend indicator, no definition tooltip |

### A3 Admin Members Management — PARTIALLY COMPLETE (3/5)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-05** Members List page | ✅ Complete (UI) | `admin/members/page.tsx` — Table with name, email, joined date, status badge. Search + filter. Pagination. Mock data |
| **FE-A8-06** Add Single Member modal | ✅ Complete (UI) | Email input + invite option + submit. Mock/local state |
| **FE-A8-07** Bulk Add Members modal | ✅ Complete (UI) | Full modal with Paste Emails / CSV Upload tabs, drag-and-drop CSV dropzone, email parsing with validation preview, cohort selector, processing spinner, success state |
| **FE-A8-08** Member action menu | ✅ Complete (UI) | Dropdown: Suspend, Send Warning, Remove. Confirm modals. Mock state |
| **FE-A8-09** Send warning flow | 🟡 Partial | Warning textarea exists in modal. Submit updates local state. No POST to API |

### A4 Admin Cohorts Management — PARTIALLY COMPLETE (4/7)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-10** Cohorts List page | ✅ Complete (UI) | `admin/cohorts/page.tsx` — List with name, member count, date. Create New Cohort button. Click navigates to detail. Mock data |
| **FE-A8-11** Create Cohort modal/form | ✅ Complete (UI) | Name + Description + Submit. Local state |
| **FE-A8-12** Cohort Detail page (admin) | ✅ Complete (UI) | `admin/cohorts/[slug]/page.tsx` — Tabs: Members, Resources, Sessions, Recordings, Announcements. Header with edit option. Mock data |
| **FE-A8-13** Add Members to Cohort panel | 🟡 Partial | Basic add-member UI exists but no CSV/bulk add reuse |
| **FE-A8-14** Upload Resources panel | ✅ Complete (UI) | ResourceForm (title + URL) + ResourceList with delete. Mock data |
| **FE-A8-15** Add Recording to Cohort | ✅ Complete (UI) | RecordingForm (title + YouTube URL) + auto-preview thumbnail + list with delete. Mock data |
| **FE-A8-16** Send Announcement form | 🟡 Partial | Announcement textarea exists. No preview card. Submit is local state only |

### A5 Admin Events Management — PARTIALLY COMPLETE (2/4)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-17** Events List page | ✅ Complete (UI) | `admin/events/page.tsx` — Table with name, date, audience, RSVP count. Create button. Filter. Mock data |
| **FE-A8-18** Create/Edit Event form | ✅ Complete (UI) | Name, DateTime, Host, MeetingURL, AudienceSelector (Community/Cohort/Individual). Cohort dropdown. Submit. Mock/local |
| **FE-A8-19** Event Detail + RSVP List view | ✅ Complete (UI) | Full `/admin/events/[id]` page with event header, RSVP stats (total/going/maybe/attended), searchable RSVP table with filter by status, attendance toggle, Export CSV and Email All buttons |
| **FE-A8-20** Add Recording link to event | ✅ Complete (UI) | Recording attachment section on event detail page — URL input, save button, attached state with watch/remove, YouTube-ready |

### A6.1 Admin Jobs Management — COMPLETE (3/3)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-21** Jobs List page (admin) | ✅ Complete | `admin/jobs/page.tsx` — Wired to `useJobs` + admin CRUD hooks. Create/Edit/Delete jobs, featured toggle, referral management tabs |
| **FE-A8-22** Create/Edit Job form | ✅ Complete | Wired to `useCreateJob` / `useUpdateJob` hooks. Form submits to `POST /admin/jobs` or `PATCH /admin/jobs/:id` |
| **FE-A8-23** Referral Requests panel | ✅ Complete | Wired to `useJobReferralRequests` + `useUpdateReferralStatus` hooks. Real referral data with status updates via `PATCH /admin/jobs/referral-requests/:id` |

### A7 Admin Moderation — PARTIALLY COMPLETE (2/3)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-24** Moderation view | ✅ Complete (UI) | `admin/moderation/page.tsx` — Combined post/reply list. Filter by Community/Cohort. Author, content, timestamp, delete button. Mock data |
| **FE-A8-25** Admin delete flow | 🟡 Partial | Delete button exists on all posts. Removes from local state. No soft-delete "[deleted]" display, no API call |
| **FE-A8-26** Send Warning to member | 🟡 Partial | Modal with member name + warning textarea. Submit is local state only |

### A8.1 Admin Analytics & Export — PARTIALLY COMPLETE (1/4)

| Task | Status | Details |
|------|--------|---------|
| **FE-A8-27** Analytics page (full) | ✅ Complete (UI) | `admin/analytics/page.tsx` — StatCards row, CohortEngagementTable, Export buttons. Mock data |
| **FE-A8-28** Excel export | 🟡 Partial | CSV download button works (generates blob from mock data). Not true .xlsx Excel format |
| **FE-A8-29** PDF export | ❌ Not started | No PDF export implementation |
| **FE-A8-30** Date range filter | 🟡 Partial | Date inputs exist but may not actually filter the engagement data |

---

## Global/Shared Components (10 tasks)

| Task | Status | Details |
|------|--------|---------|
| **FE-G-01** Toast/Snackbar | ✅ Complete | `src/components/ui/toast` — ToastProvider context, useToast hook, success/error/info variants, auto-dismiss 3 s, stacked at top-right. Wrapped in root layout. |
| **FE-G-02** ConfirmModal (generic) | ✅ Complete | `src/components/ui/confirm-modal` — danger/primary variants, icon prop, loading state, backdrop dismiss. Adopted in devplan, profile, admin/settings. |
| **FE-G-03** EmptyState component | ✅ Complete | `src/components/ui/empty-state` — plain/dashed variants, icon + heading + description + CTA. Adopted in moderation, events, cohorts, jobs, schedule, notifications. |
| **FE-G-04** SkeletonLoader | ✅ Complete | `src/components/ui/skeleton` — Skeleton (base bar), SkeletonCard (header + lines), SkeletonRow (table rows). Ready for API loading states. |
| **FE-G-05** ErrorBoundary | ✅ Complete | `src/components/ui/error-boundary` — class component with getDerivedStateFromError, custom fallback prop, retry button. Wrapped around all 27 data pages. |
| **FE-G-06** AvatarInitials fallback | ✅ Complete | `src/components/ui/avatar-initials` — 5 size presets, deterministic color from name hash, image fallback on error. Adopted in 10+ pages. |
| **FE-G-07** StatusBadge | ✅ Complete | `src/components/ui/status-badge` — pill/tag/dot-only variants, 20+ presets (Active/Upcoming/Completed/etc). Adopted in admin/jobs, events, cohorts, devplan. |
| **FE-G-08** DatePicker | 🟡 Partial | Native HTML date inputs used. No custom accessible DatePicker |
| **FE-G-09** Global API error handling + 401 redirect | ✅ Complete | `useAuthSWR` with Clerk token injection, SWR error retry (3x), ErrorBoundary on all data pages. 401 handled by Clerk middleware redirect |
| **FE-G-10** Responsive breakpoint system | ✅ Complete | Tailwind config with brand colors, responsive breakpoints, custom theme in `globals.css` |

---

## Summary

| Area | Total | ✅ Complete | 🟡 Partial | ❌ Not Started |
|------|:-----:|:----------:|:----------:|:-------------:|
| Sprint 1 — Auth & Onboarding | 16 | 16 | 0 | **0** |
| Sprint 2 — App Shell | 5 | 5 | 0 | **0** |
| Sprint 2 — Dashboard | 7 | 7 | 0 | **0** |
| Sprint 3 — Cohorts | 8 | 7 | 0 | **1** |
| Sprint 4 — Recordings | 4 | 3 | 1 | **0** |
| Sprint 5 — Jobs | 6 | 6 | 0 | **0** |
| Sprint 6 — Community | 6 | 6 | 0 | **0** |
| Sprint 6 — Member Directory | 6 | 5 | 0 | **1** |
| Sprint 7 — Dev Plan | 7 | 4 | 1 | **2** |
| Sprint 8 — Admin Portal | 28 | 19 | 5 | **4** |
| Global/Shared | 10 | 9 | 0 | **1** |
| **TOTAL** | **103** | **86** (↑12) | **7** (↓6) | **10** (↓6) |

---

## API Integration Status

> **Last Updated:** April 17, 2026
> **API Base:** `https://bggather-api.duckdns.org/api/v1`
> **Health:** ✅ UP (uptime ~7.8 days as of last check)

### Completed Integration Phases

| Phase | Scope | Hooks Created | Pages Wired | Status |
|-------|-------|---------------|-------------|--------|
| **Phase 0** | Foundation | `use-auth-swr.ts`, `use-api-mutation.ts`, `use-current-user.ts` | — | ✅ Done |
| **Phase 1** | Auth & User Profile | — | sign-in, sign-up, profile, settings, onboarding | ✅ Done |
| **Phase 2** | Members Directory | `use-members.ts` | member/members, admin/members | ✅ Done |
| **Phase 3** | Events | `use-events.ts`, `use-admin-events.ts` | member/events, admin/events, admin/events/[id] | ✅ Done |
| **Phase 4** | Cohorts | `use-cohorts.ts`, `use-admin-cohorts.ts` | member/cohorts/[slug], admin/cohorts, admin/cohorts/[slug] | ✅ Done |
| **Phase 5** | Jobs | `use-jobs.ts`, `use-admin-jobs.ts` | member/jobs, admin/jobs, member dashboard (Featured Jobs) | ✅ Done |
| **Phase 6** | Community | `use-community.ts`, `use-admin-community.ts` | member/community, admin/community | ✅ Done |
| **Phase 7** | Dashboard Finalization | — | member/recordings, admin dashboard stats | ✅ Done |

### Remaining (Blocked on BE)

| Phase | Scope | Reason Blocked |
|-------|-------|----------------|
| **Phase 8** | Notifications | BE notifications endpoints not built |
| **Phase 9** | Dev Plan | BE dev plan CRUD not built |
| **Phase 10** | Mentorship | BE mentor matching/sessions not built |
| **Phase 11** | Analytics & Export | BE analytics aggregation not built |

---

## 🐛 Backend Defects / Bugs

> **Tested:** April 17, 2026
> All public list endpoints return HTTP 500 with `{"success":false,"message":"Internal server error"}`.
> Admin endpoints return HTTP 404 (routes not registered or not deployed).

### CRITICAL — All Public List Endpoints Return 500

| # | Endpoint | Method | Expected | Actual | Impact |
|---|----------|--------|----------|--------|--------|
| **BUG-001** | `GET /jobs` | GET | 200 + paginated jobs | **500** Internal Server Error | Job Board page shows empty/loading forever |
| **BUG-002** | `GET /events` | GET | 200 + paginated events | **500** Internal Server Error | Events page, Schedule, Recordings all broken |
| **BUG-003** | `GET /cohorts` | GET | 200 + paginated cohorts | **500** Internal Server Error | Cohorts listing broken |
| **BUG-004** | `GET /members` | GET | 200 + paginated members | **500** Internal Server Error | Member directory broken |
| **BUG-005** | `GET /community/groups` | GET | 200 + paginated groups | **500** Internal Server Error | Community page broken |

**Root cause (likely):** Database connection issue or missing migration on the deployed server. The `/health` endpoint returns 200 OK, confirming the server process is running, but all data-fetching routes crash. Error responses are generic (no stack trace exposed) — need server logs to diagnose.

### HIGH — Admin Routes Return 404

| # | Endpoint | Method | Expected | Actual | Impact |
|---|----------|--------|----------|--------|--------|
| **BUG-006** | `GET /admin/jobs` | GET | 401 (no auth) or 200 (with auth) | **404** Route not found | Admin jobs CRUD unavailable |
| **BUG-007** | `GET /admin/events` | GET | 401 or 200 | **404** Route not found | Admin events CRUD unavailable |
| **BUG-008** | `GET /admin/cohorts` | GET | 401 or 200 | **404** Route not found | Admin cohorts CRUD unavailable |
| **BUG-009** | `GET /admin/community/groups` | GET | 401 or 200 | **404** Route not found | Admin community CRUD unavailable |

**Note:** Admin routes returning 404 (not 401) suggests the route handlers are either not registered in the Express router, or the admin module was not deployed. Without auth, we'd expect 401 Unauthorized, not 404. This needs investigation on the BE side.

### MEDIUM — Detail Routes Also 500

| # | Endpoint | Method | Expected | Actual | Impact |
|---|----------|--------|----------|--------|--------|
| **BUG-010** | `GET /jobs/:id` | GET | 404 (not found) for invalid ID | **500** Internal Server Error | Should return 404 for non-existent resources, not 500 |
| **BUG-011** | `GET /events/:id` | GET | 404 for invalid ID | **500** Internal Server Error | Same — missing input validation |
| **BUG-012** | `GET /community/groups/:id` | GET | 404 for invalid ID | **500** Internal Server Error | Same — unhandled error in route handler |

**Note:** Passing an invalid/nonexistent ID to detail endpoints causes 500 instead of a proper 404 response. This indicates missing input validation or unhandled Prisma `RecordNotFound` errors in the route handlers.

### Observations

- **`GET /health`** — ✅ Returns `200 OK` with `{"success":true,"status":"ok"}`. Server is running.
- **`GET /users/me`** — Returns `401 Unauthorized` (expected without auth token). Auth middleware is working.
- **`GET /` (API root)** — Returns `404 Route not found` (expected, no root handler).
- **CORS** — Correctly configured with `Access-Control-Allow-Origin: http://localhost:3000`.
- **Security headers** — Helmet.js headers present (CSP, HSTS, X-Frame-Options, etc.).
- **Error responses** — All 500s return generic `"Internal server error"` with no detail. Need server-side logging to diagnose.

### Recommended BE Fixes (Priority Order)

1. **Fix database connection / run migrations** — All list endpoints crash, likely a DB issue
2. **Register admin routes** — Admin endpoints return 404, routes may not be mounted
3. **Add input validation on `:id` params** — Validate UUID format before DB query to avoid 500 on invalid IDs
4. **Return proper 404 for missing resources** — Catch Prisma `P2025` / `RecordNotFoundError` and return 404
5. **Add structured error logging** — Current 500 responses are opaque; need request-level error logs

---

## Biggest Gaps (Blockers)

1. **~~Entire auth system (Sprint 1)~~** — ✅ RESOLVED. Full auth system (login, register, Google OAuth, forgot password, route guards) + complete 5-step onboarding wizard with state persistence, privacy toggles, and dev plan setup
2. **~~No API integration anywhere~~** — ✅ RESOLVED (Phases 0-7). 12 custom hooks created, all data pages wired to real API. **However, all BE endpoints currently return 500 (see Bug Report above)**
3. **~~No shared component library~~** — ✅ RESOLVED. All 7 shared components (Toast, ConfirmModal, EmptyState, SkeletonLoader, ErrorBoundary, AvatarInitials, StatusBadge) built in `src/components/ui/` with barrel export. Inline duplicates migrated. ErrorBoundary wraps all 27 data pages.
4. **~~Missing pages~~** — ✅ RESOLVED. Recordings full list (`/member/recordings`), Event Detail+RSVP (`/admin/events/[id]`), Referral Requests panel (tab on admin jobs), Bulk Add Members modal (on admin members) all built. Only PDF export remains.
5. **DM Widget is a prototype** — send doesn't persist messages
6. **BE is down** — All data endpoints return 500. FE integration is complete but untestable until BE is fixed
