#!/usr/bin/env node
/**
 * BGG-FE → Linear Import Script
 *
 * Imports ALL 103 frontend tasks into Linear with:
 *   - Correct statuses (Done / In Progress / Todo)
 *   - Labels (type, area, original sprint)
 *   - 5 dev cycles for remaining work in logical dependency order
 *   - Completed tasks imported for audit trail (no cycle)
 *
 * Usage:
 *   npm install @linear/sdk
 *   set LINEAR_API_KEY=lin_api_xxxxxxxxx
 *   node scripts/linear-import.mjs
 */

import { LinearClient } from "@linear/sdk";

// ─── Config ─────────────────────────────────────────────────────────────────
const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) {
  console.error("❌ Set LINEAR_API_KEY env variable first.\n   $env:LINEAR_API_KEY=\"lin_api_xxxx\"");
  process.exit(1);
}

const linear = new LinearClient({ apiKey: API_KEY });

// ─── Cycle Definitions (for UNDONE work only) ──────────────────────────────
// Two-week cycles starting from next Monday
const CYCLE_START = new Date("2026-03-09"); // adjust to your actual start

function cycleDate(weekOffset) {
  const d = new Date(CYCLE_START);
  d.setDate(d.getDate() + weekOffset * 7);
  return d.toISOString().split("T")[0];
}

const CYCLES = [
  {
    name: "C1 — Foundation & Shared Components",
    description: "Shared component library (DONE — 7/7 components built & adopted) + API layer + global error handling. Remaining: DatePicker, API error handling.",
    startsAt: cycleDate(0),
    endsAt: cycleDate(2),
  },
  {
    name: "C2 — Auth & Onboarding",
    description: "Login, registration, OAuth, forgot password, email verification, multi-step onboarding, route guards.",
    startsAt: cycleDate(2),
    endsAt: cycleDate(4),
  },
  {
    name: "C3 — API Integration: Dashboard, Cohorts & Recordings",
    description: "Wire existing dashboard/cohort/recording UI to real backend APIs. Complete partial features.",
    startsAt: cycleDate(4),
    endsAt: cycleDate(6),
  },
  {
    name: "C4 — API Integration: Jobs, Community, Members & Dev Plan",
    description: "Wire remaining member-facing pages to backend APIs. Complete partial implementations.",
    startsAt: cycleDate(6),
    endsAt: cycleDate(8),
  },
  {
    name: "C5 — Admin Gaps, Missing Pages & Exports",
    description: "Build missing admin screens, bulk operations, referral panel, PDF/Excel exports, and polish.",
    startsAt: cycleDate(8),
    endsAt: cycleDate(10),
  },
];

// ─── Label Definitions ──────────────────────────────────────────────────────
const LABEL_COLORS = {
  // Type labels
  Screen: "#4338ca",
  Component: "#0891b2",
  Logic: "#d97706",
  State: "#7c3aed",
  Style: "#ec4899",
  // Area labels
  Auth: "#dc2626",
  Onboarding: "#ea580c",
  "App Shell": "#65a30d",
  Dashboard: "#2563eb",
  Cohorts: "#9333ea",
  Recordings: "#0d9488",
  Jobs: "#ca8a04",
  Community: "#e11d48",
  Members: "#6366f1",
  "Dev Plan": "#059669",
  Admin: "#7c2d12",
  Global: "#475569",
  // Sprint origin labels
  "Sprint 1": "#16a34a",
  "Sprint 2": "#16a34a",
  "Sprint 3": "#d97706",
  "Sprint 4": "#d97706",
  "Sprint 5": "#0d9488",
  "Sprint 6": "#0d9488",
  "Sprint 7": "#7c3aed",
  "Sprint 8": "#7c3aed",
};

// ─── All 103 Tasks ──────────────────────────────────────────────────────────
// status: "Done" | "In Progress" | "Todo"
// cycle: null (completed/audit) or 1-5 (which dev cycle)
// priority: "Urgent"|"High"|"Medium"|"Low"
// labels: array of label names from LABEL_COLORS

const TASKS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 1 — AUTH & ONBOARDING (all not started → Cycle 2)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-M0-01", title: "Scaffold auth page layout and route", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Screen"], desc: "Auth route group and branded auth layout are implemented in `src/app/(auth)/layout.tsx`." },
  { id: "FE-M0-02", title: "Build Sign In with Google button", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Component"], desc: "Google social auth button and Clerk OAuth strategy are implemented on sign-in/sign-up screens." },
  { id: "FE-M0-03", title: "Build email + password sign-in form", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Component"], desc: "Email/password sign-in implemented with Clerk password strategy and finalize flow." },
  { id: "FE-M0-04", title: "Build email + password sign-up form", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Component"], desc: "Email/password sign-up and email verification are implemented with Clerk." },
  { id: "FE-M0-05", title: "Implement form validation (signup)", status: "In Progress", priority: "Urgent", cycle: 2, labels: ["Sprint 1", "Auth", "Logic"], desc: "Core validation and error messaging exist inline; reusable validation hook/pattern still pending." },
  { id: "FE-M0-06", title: "Build Forgot Password flow", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Screen"], desc: "Forgot-password now supports code request, code verification, and password submission via Clerk reset APIs." },
  { id: "FE-M0-07", title: "Handle auth routing logic", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 1", "Auth", "Logic"], desc: "Clerk middleware, post-auth redirects, and onboarding/member gating are implemented." },
  { id: "FE-M0-08", title: "Style auth page — responsive layout", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 1", "Auth", "Style"], desc: "Responsive auth layouts and controls are implemented across auth screens." },

  { id: "FE-M1-01", title: "Scaffold multi-step onboarding shell", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "Screen"], desc: "Multi-step onboarding route and shell are implemented at `/onboarding`." },
  { id: "FE-M1-02", title: "Onboarding Step 1 — Basic info form", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Step 1 is implemented with required employment status and occupation/future-role framing; company is optional." },
  { id: "FE-M1-03", title: "Onboarding Step 2 — Profile photo upload", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Step 2 avatar upload with live preview is implemented." },
  { id: "FE-M1-04", title: "Onboarding Step 3 — Social links input", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Step 3 website, LinkedIn, and X/Twitter inputs are implemented." },
  { id: "FE-M1-05", title: "Onboarding Step 4 — Privacy toggles", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Step 4 privacy toggles are implemented and persisted." },
  { id: "FE-M1-06", title: "Onboarding Step 5 — Optional Dev Plan setup", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Step 5 supports optional skip plus dynamic milestone add/remove before finish." },
  { id: "FE-M1-07", title: "Implement onboarding state persistence", status: "Done", priority: "High", cycle: null, labels: ["Sprint 1", "Onboarding", "State"], desc: "Per-user onboarding draft state persists in localStorage and resumes correctly." },
  { id: "FE-M1-08", title: "'Complete Dev Plan' prompt if skipped", status: "Done", priority: "Low", cycle: null, labels: ["Sprint 1", "Onboarding", "Component"], desc: "Dashboard reminder banner now prompts users to complete dev plan until milestones are completed." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 2 — APP SHELL (mostly done)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-M2-01", title: "Build global app shell layout", status: "Done", priority: "High", cycle: null, labels: ["Sprint 2", "App Shell", "Screen"], desc: "SideNav (desktop), BottomNav (mobile), TopBar with notification bell + user avatar, route outlet." },
  { id: "FE-M2-02", title: "Build SideNav links and active states", status: "Done", priority: "High", cycle: null, labels: ["Sprint 2", "App Shell", "Component"], desc: "Nav items: Dashboard, Jobs, Community, Members, Cohorts. ActiveLink highlight. Dynamic cohort sub-links." },
  { id: "FE-M2-03", title: "Build notification bell dropdown", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 2", "App Shell", "Component"], desc: "NotificationBell with unread badge, NotificationsDropdown, NotificationItem, mark-all-read. Mock data." },
  { id: "FE-M2-04", title: "Build user avatar menu (top right)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 2", "App Shell", "Component"], desc: "UserAvatarMenu dropdown: View Profile, Settings, Log out. Display name + avatar." },
  { id: "FE-M2-05", title: "Implement auth route guards", status: "Done", priority: "Urgent", cycle: null, labels: ["Sprint 2", "App Shell", "Logic"], desc: "Clerk middleware protects routes and member area includes onboarding completion gating." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 2 — DASHBOARD (mostly done)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-M3-01", title: "Scaffold Dashboard page layout", status: "Done", priority: "High", cycle: null, labels: ["Sprint 2", "Dashboard", "Screen"], desc: "2-column layout (main + action center), section headings, skeleton loaders." },
  { id: "FE-M3-02", title: "Build EventCard component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 2", "Dashboard", "Component"], desc: "EventCard: title, date/time, host, RSVPStatusBadge, RSVPToggleButton, JoinButton. Hardcoded." },
  { id: "FE-M3-03", title: "Implement RSVP toggle logic", status: "In Progress", priority: "Medium", cycle: 3, labels: ["Sprint 2", "Dashboard", "Logic"], desc: "Toggle works in local state only. Need: RSVP API call, optimistic UI update, sync to server." },
  { id: "FE-M3-04", title: "Build Past Recordings section", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 2", "Dashboard", "Component"], desc: "RecordingCard: YouTube thumbnail + title, click opens URL, empty state, filter by cohort. Mock data." },
  { id: "FE-M3-05", title: "Build Featured Jobs section (dashboard)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 2", "Dashboard", "Component"], desc: "JobCardMini: title, company, location, ApplyButton, SeekReferralButton. Mock data." },
  { id: "FE-M3-06", title: "Build Action Center panel", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 2", "Dashboard", "Component"], desc: "ActionCenterPanel, MilestoneItem, link to dev plan, 'Set new plan' CTA. Mock data." },
  { id: "FE-M3-07", title: "Wire dashboard data fetching", status: "Todo", priority: "High", cycle: 3, labels: ["Sprint 2", "Dashboard", "State"], desc: "Need: useSchedule, useRecordings, useFeaturedJobs, useActionCenter hooks. Error boundary per section. All data is currently hardcoded." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 3 — COHORTS (mostly done)
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-C3-01", title: "Scaffold Cohort page with tab navigation", status: "Done", priority: "High", cycle: null, labels: ["Sprint 3", "Cohorts", "Screen"], desc: "CohortPage layout, TabBar (Members|Resources|Sessions|Recordings|Feed), header, empty states." },
  { id: "FE-C3-02", title: "Build Cohort Members tab", status: "Done", priority: "High", cycle: null, labels: ["Sprint 3", "Cohorts", "Component"], desc: "MemberListItem: avatar, name, occupation. Scrollable. Mock data." },
  { id: "FE-C3-03", title: "Build Resources tab", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 3", "Cohorts", "Component"], desc: "ResourceItem: title + external link, open in new tab, empty state. Mock data." },
  { id: "FE-C3-04", title: "Build Sessions tab (cohort events)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 3", "Cohorts", "Component"], desc: "Reuse EventCard from dashboard. RSVP + Join identical. Cohort-filtered. Mock data." },
  { id: "FE-C3-05", title: "Build Recordings tab (cohort)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 3", "Cohorts", "Component"], desc: "Reuse RecordingCard. Cohort-filtered. Mock data." },
  { id: "FE-C3-06", title: "Build Cohort Feed tab", status: "Done", priority: "High", cycle: null, labels: ["Sprint 3", "Cohorts", "Component"], desc: "PostCard, ReplyThread, CreatePostForm, CreateReplyForm, DeletePostButton + confirm. Mock/local state." },
  { id: "FE-C3-07", title: "Implement cohort feed access control", status: "Todo", priority: "High", cycle: 3, labels: ["Sprint 3", "Cohorts", "Logic"], desc: "Hide feed/block compose for non-members. Guard route by cohort membership check." },
  { id: "FE-C3-08", title: "Wire cohort data fetching", status: "Todo", priority: "High", cycle: 3, labels: ["Sprint 3", "Cohorts", "State"], desc: "useCohort(cohortId) hook. Fetch members, resources, sessions, recordings, posts. Polling/real-time for feed." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 4 — RECORDINGS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-R4-01", title: "Build RecordingCard component (shared)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 4", "Recordings", "Component"], desc: "YouTube thumbnail, title, cohort label badge, click opens YouTube, hover state. Mock data." },
  { id: "FE-R4-02", title: "Implement YouTube thumbnail extraction", status: "In Progress", priority: "Low", cycle: 3, labels: ["Sprint 4", "Recordings", "Logic"], desc: "Need: parse YouTube URL → video ID, construct thumbnail URL, fallback placeholder. Currently hardcoded." },
  { id: "FE-R4-03", title: "Build Recordings page / full list view", status: "Todo", priority: "Medium", cycle: 3, labels: ["Sprint 4", "Recordings", "Screen"], desc: "No dedicated /member/recordings page. Need: RecordingsPage, filter by cohort dropdown, grid/list toggle, empty state." },
  { id: "FE-R4-04", title: "Style recording grid — responsive", status: "In Progress", priority: "Low", cycle: 3, labels: ["Sprint 4", "Recordings", "Style"], desc: "Grid on dashboard works. Need dedicated page layout with 2-col desktop / 1-col mobile + maintained aspect ratio." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 5 — JOBS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-J5-01", title: "Scaffold Jobs page layout", status: "Done", priority: "High", cycle: null, labels: ["Sprint 5", "Jobs", "Screen"], desc: "JobsPage with list + filter sidebar, page header, search input, skeleton loaders. Mock data." },
  { id: "FE-J5-02", title: "Build JobCard component (full)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 5", "Jobs", "Component"], desc: "Title, company, location, description, ApplyButton, SeekReferralButton, ReferralRequestedBadge. Mock data." },
  { id: "FE-J5-03", title: "Build Job Detail view / modal", status: "Done", priority: "High", cycle: null, labels: ["Sprint 5", "Jobs", "Screen"], desc: "JobDetailModal: full description, eligibility, company, Apply + Seek Referral, back nav. Mock data." },
  { id: "FE-J5-04", title: "Implement Seek Referral action + dedup", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 5", "Jobs", "Logic"], desc: "Button click updates local state only. Need: POST referral request, disable + 'Request already sent', toast, prevent duplicate on load." },
  { id: "FE-J5-05", title: "Build Jobs search + filter", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 5", "Jobs", "Component"], desc: "Search input filters by title. Location/role type dropdowns may be incomplete. Need useJobFilters hook." },
  { id: "FE-J5-06", title: "Wire jobs data fetching", status: "Todo", priority: "High", cycle: 4, labels: ["Sprint 5", "Jobs", "State"], desc: "Need: useJobs hook with filter params, useReferralStatus(jobId), empty state." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 6 — COMMUNITY DISCUSSION
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-D6-01", title: "Scaffold Community Discussion page", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Community", "Screen"], desc: "CommunityPage layout, PostList, CreatePost CTA, empty state. Mock data." },
  { id: "FE-D6-02", title: "Build CreatePostForm component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Community", "Component"], desc: "TitleInput, BodyTextarea, Submit + loading, inline validation. Local state." },
  { id: "FE-D6-03", title: "Build PostCard component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Community", "Component"], desc: "Author avatar/name/timestamp, title + body, ReplyCount badge, DeleteButton (own), expand toggle. Mock." },
  { id: "FE-D6-04", title: "Build ReplyThread component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Community", "Component"], desc: "ReplyItem (chronological), inline CreateReplyForm, DeleteButton on own, [deleted] placeholder. Mock." },
  { id: "FE-D6-05", title: "Implement delete flow (soft delete)", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 6", "Community", "Logic"], desc: "Confirm modal exists. Removes from local state. Need: API call, '[deleted]' display for replies, admin hard delete." },
  { id: "FE-D6-06", title: "Wire community feed data + pagination", status: "Todo", priority: "High", cycle: 4, labels: ["Sprint 6", "Community", "State"], desc: "Need: useCommunityFeed hook, paginate or infinite scroll, optimistic post creation." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 6 — MEMBER DIRECTORY
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-MD6-01", title: "Scaffold Member Directory page", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Members", "Screen"], desc: "DirectoryPage layout, SearchBar, MemberGrid/MemberList, empty search state. Mock data." },
  { id: "FE-MD6-02", title: "Build MemberCard component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Members", "Component"], desc: "Avatar, name, occupation. Clickable if profileVisible. 'Private profile' indicator. Hover state. Mock." },
  { id: "FE-MD6-03", title: "Build Profile Card / modal", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Members", "Component"], desc: "ProfileModal: avatar, name, occupation, bio, SocialLinksRow (if visible), SocialLinkButton, close. Mock." },
  { id: "FE-MD6-04", title: "Implement visibility rules (frontend)", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 6", "Members", "Logic"], desc: "Some toggle exists but profileVisible/socialsVisible not enforced from real user data." },
  { id: "FE-MD6-05", title: "Build member search (real-time)", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 6", "Members", "Logic"], desc: "Debounced client-side filter by name. Need: API search, no-results empty state." },
  { id: "FE-MD6-06", title: "Build Profile Settings page", status: "Done", priority: "High", cycle: null, labels: ["Sprint 6", "Members", "Screen"], desc: "EditProfileForm, EditSocialsForm, visibility toggles, save button. Saves to localStorage only." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 7 — DEV PLAN
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-DP7-01", title: "Scaffold Dev Plan page", status: "Done", priority: "High", cycle: null, labels: ["Sprint 7", "Dev Plan", "Screen"], desc: "DevPlanPage layout, PlanHeader (goal + date), MilestoneList, Add Milestone CTA, empty state. localStorage." },
  { id: "FE-DP7-02", title: "Build CreateDevPlanForm", status: "Done", priority: "High", cycle: null, labels: ["Sprint 7", "Dev Plan", "Component"], desc: "GoalTitleInput, DescriptionTextarea, AddFirstMilestone inline, Save Plan. localStorage." },
  { id: "FE-DP7-03", title: "Build MilestoneItem component", status: "Done", priority: "High", cycle: null, labels: ["Sprint 7", "Dev Plan", "Component"], desc: "Title + DueDate + StatusBadge (Pending/Overdue/Complete) + MarkComplete + DueDatePicker + Delete. localStorage." },
  { id: "FE-DP7-04", title: "Build AddMilestoneForm (inline)", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 7", "Dev Plan", "Component"], desc: "TitleInput, DatePicker, Save + Cancel. Appends to milestone list." },
  { id: "FE-DP7-05", title: "Implement mark-complete logic", status: "In Progress", priority: "Medium", cycle: 4, labels: ["Sprint 7", "Dev Plan", "Logic"], desc: "Checkbox toggles in localStorage. Need: PATCH milestone API, remove from Action Center, trigger 'Set new plan' prompt." },
  { id: "FE-DP7-06", title: "Build 'All done' prompt", status: "Todo", priority: "Low", cycle: 4, labels: ["Sprint 7", "Dev Plan", "Component"], desc: "CompletionBanner: 'You've completed your plan!' CTAs: 'Set a new plan' | 'Add more milestones'." },
  { id: "FE-DP7-07", title: "Wire Action Center data to dev plan", status: "Todo", priority: "High", cycle: 4, labels: ["Sprint 7", "Dev Plan", "State"], desc: "useActionCenter hook: fetch milestones due in 7 days + overdue. Sort by urgency. Link items to dev plan page." },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 8 — ADMIN PORTAL
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-A8-01", title: "Scaffold Admin app shell", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "AdminLayout wrapper, AdminSideNav, TopBar with admin badge, role guard redirect." },
  { id: "FE-A8-02", title: "Build Admin SideNav with active states", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "NavItem components, active route highlight, collapse/expand for mobile." },
  { id: "FE-A8-03", title: "Build Admin Dashboard overview page", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "StatCards (Total/Active/Inactive Members), CohortEngagementTable, date range selector. Mock data." },
  { id: "FE-A8-04", title: "StatCard — add trend indicator + tooltip", status: "In Progress", priority: "Low", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "StatCards have number + label. Need: trend indicator (up/down arrow), definition tooltip." },
  { id: "FE-A8-05", title: "Build Members List page (admin)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "MembersTable: name, email, joined date, status badge. Search + filter + pagination. Mock data." },
  { id: "FE-A8-06", title: "Build Add Single Member modal", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "EmailInput, send invite option, submit + success toast. Mock state." },
  { id: "FE-A8-07", title: "Build Bulk Add Members modal", status: "Todo", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "TabBar: CSV Upload | Paste Emails. CSVDropzone with validation, EmailTextarea, Process button, ResultsSummary." },
  { id: "FE-A8-08", title: "Build member action menu (per row)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "DropdownMenu: Suspend | Send Warning | Remove. Confirm modals. Reinstate for suspended." },
  { id: "FE-A8-09", title: "Implement send warning flow", status: "In Progress", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Logic"], desc: "Warning textarea in modal. Submit updates local state only. Need: POST to notifications API, success toast." },
  { id: "FE-A8-10", title: "Build Cohorts List page (admin)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "CohortListItem: name, member count, created date. Create button. Click → detail. Mock data." },
  { id: "FE-A8-11", title: "Build Create Cohort modal / form", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "NameInput, DescriptionTextarea, Submit + redirect to detail. Local state." },
  { id: "FE-A8-12", title: "Build Cohort Detail page (admin)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "CohortDetailTabs: Members|Resources|Sessions|Recordings|Announcements. Header + Edit. Mock data." },
  { id: "FE-A8-13", title: "Add Members to Cohort — bulk support", status: "In Progress", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "Basic add-member UI exists. Need: reuse Bulk Add component (CSV + paste), ResultsSummary." },
  { id: "FE-A8-14", title: "Build Upload Resources panel", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "ResourceForm: title + URL. ResourceList with delete. Mock data." },
  { id: "FE-A8-15", title: "Build Add Recording to Cohort", status: "Done", priority: "Medium", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "RecordingForm: title + YouTube URL. Auto-preview thumbnail. RecordingList with delete. Mock data." },
  { id: "FE-A8-16", title: "Send Announcement form — add preview", status: "In Progress", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "Announcement textarea exists. Need: preview card, submit → post to feed + trigger notifications." },
  { id: "FE-A8-17", title: "Build Events List page (admin)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "EventsTable: name, date, audience, RSVP count. Create button. Filter upcoming/past. Mock data." },
  { id: "FE-A8-18", title: "Build Create / Edit Event form", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "Name, DateTime, Host, MeetingURL, AudienceSelector, CohortDropdown, IndividualEmailSearch. Mock." },
  { id: "FE-A8-19", title: "Build Event Detail + RSVP List view", status: "Todo", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Screen"], desc: "EventDetailCard (all fields), RSVPTable (member name, status, timestamp), RSVP count summary, Add Recording link." },
  { id: "FE-A8-20", title: "Build Add Recording link to event", status: "Todo", priority: "Low", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "RecordingURLInput + title, YouTube thumbnail preview, Save → attaches to event." },
  { id: "FE-A8-21", title: "Build Jobs List page (admin)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "JobsTable: title, company, referral flag, posted date. Create button. View referral requests." },
  { id: "FE-A8-22", title: "Build Create / Edit Job form", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Component"], desc: "Title, Company, Location, Description, ExternalURL, ReferralAvailableToggle, ReferralContact. Mock." },
  { id: "FE-A8-23", title: "Build Referral Requests panel", status: "Todo", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "ReferralRequestTable: member name, email, timestamp. StatusSelect per request (New|Contacted|Closed). Export." },
  { id: "FE-A8-24", title: "Build Moderation view", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "ModerationFeedView: combined post/reply list. FilterBar: Community | Cohort. Author, content, delete. Mock." },
  { id: "FE-A8-25", title: "Admin delete flow — soft delete + API", status: "In Progress", priority: "High", cycle: 5, labels: ["Sprint 8", "Admin", "Logic"], desc: "Delete button removes from local state. Need: API call, soft-delete '[deleted]' display, thread integrity." },
  { id: "FE-A8-26", title: "Send Warning to member — wire to API", status: "In Progress", priority: "Medium", cycle: 5, labels: ["Sprint 8", "Admin", "Logic"], desc: "WarnMemberModal exists. Need: POST → notification sent to member, success confirmation." },
  { id: "FE-A8-27", title: "Build Analytics page (full)", status: "Done", priority: "High", cycle: null, labels: ["Sprint 8", "Admin", "Screen"], desc: "StatCards row, CohortEngagementTable, date range filter, export buttons. Mock data." },
  { id: "FE-A8-28", title: "Excel export — proper .xlsx format", status: "In Progress", priority: "Low", cycle: 5, labels: ["Sprint 8", "Admin", "Logic"], desc: "CSV download works from mock data. Need: trigger API export endpoint, download .xlsx via blob URL." },
  { id: "FE-A8-29", title: "PDF export implementation", status: "Todo", priority: "Low", cycle: 5, labels: ["Sprint 8", "Admin", "Logic"], desc: "No PDF export. Need: trigger API endpoint or print layout, download .pdf, loading state." },
  { id: "FE-A8-30", title: "Build date range filter for analytics", status: "In Progress", priority: "Low", cycle: 5, labels: ["Sprint 8", "Admin", "Component"], desc: "Date inputs exist. Need: DateRangePicker component, apply filter → refresh engagement data." },

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL / SHARED COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  { id: "FE-G-01", title: "Build shared Toast/Snackbar component", status: "Done", priority: "High", cycle: null, labels: ["Global", "Component"], desc: "ToastProvider context, useToast hook, success/error/info variants, auto-dismiss 3s, stacked top-right. Wrapped in root layout." },
  { id: "FE-G-02", title: "Extract shared ConfirmModal component", status: "Done", priority: "Medium", cycle: null, labels: ["Global", "Component"], desc: "Shared ConfirmModal with danger/primary variants, icon prop, loading state, backdrop dismiss. Adopted in devplan, profile, admin/settings." },
  { id: "FE-G-03", title: "Extract shared EmptyState component", status: "Done", priority: "Medium", cycle: null, labels: ["Global", "Component"], desc: "Shared EmptyState with plain/dashed variants, icon + heading + description + CTA. Adopted in moderation, events, cohorts, jobs, schedule, notifications." },
  { id: "FE-G-04", title: "Build SkeletonLoader components", status: "Done", priority: "Medium", cycle: null, labels: ["Global", "Component"], desc: "Skeleton (base bar), SkeletonCard (header + lines), SkeletonRow (table rows). Ready for API loading states." },
  { id: "FE-G-05", title: "Add ErrorBoundary components", status: "Done", priority: "High", cycle: null, labels: ["Global", "Logic"], desc: "Class component with getDerivedStateFromError, custom fallback prop, retry button. Wrapped around all 27 data pages." },
  { id: "FE-G-06", title: "Extract shared AvatarInitials component", status: "Done", priority: "Low", cycle: null, labels: ["Global", "Component"], desc: "5 size presets (xs-xl), deterministic color from name hash, image fallback on error. Adopted in 10+ pages." },
  { id: "FE-G-07", title: "Extract shared StatusBadge component", status: "Done", priority: "Low", cycle: null, labels: ["Global", "Component"], desc: "Pill/tag/dot-only variants, 20+ presets (Active/Upcoming/Completed/etc). Adopted in admin/jobs, events, cohorts, devplan." },
  { id: "FE-G-08", title: "Build accessible DatePicker component", status: "In Progress", priority: "Low", cycle: 1, labels: ["Global", "Component"], desc: "Currently native HTML date inputs. Need custom accessible DatePicker for dev plan + events." },
  { id: "FE-G-09", title: "Global API error handling + 401 redirect", status: "Todo", priority: "Urgent", cycle: 1, labels: ["Global", "Logic"], desc: "No API layer exists. Need: fetch wrapper/axios instance, error interceptors, 401 → redirect to /auth." },
  { id: "FE-G-10", title: "Responsive breakpoint system", status: "Done", priority: "High", cycle: null, labels: ["Global", "Style"], desc: "Tailwind config with brand colors, responsive breakpoints, custom theme in globals.css." },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function bar(current, total, label) {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round(pct / 5);
  const empty = 20 - filled;
  process.stdout.write(`\r  [${"█".repeat(filled)}${"░".repeat(empty)}] ${pct}% ${label} (${current}/${total})`);
  if (current === total) process.stdout.write("\n");
}

// ─── Main Import ────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 BGG-FE → Linear Import\n");

  // 1. Get team
  console.log("📋 Fetching team...");
  const teams = await linear.teams();
  if (teams.nodes.length === 0) {
    console.error("❌ No teams found. Create a team in Linear first.");
    process.exit(1);
  }

  let team;
  if (teams.nodes.length === 1) {
    team = teams.nodes[0];
  } else {
    console.log("\n   Available teams:");
    teams.nodes.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} (${t.key})`));
    // Use first team or set TEAM_KEY env var
    const teamKey = process.env.LINEAR_TEAM_KEY;
    team = teamKey ? teams.nodes.find((t) => t.key === teamKey) : teams.nodes[0];
    if (!team) {
      console.error(`❌ Team with key "${teamKey}" not found.`);
      process.exit(1);
    }
  }
  console.log(`   ✓ Using team: ${team.name} (${team.key})\n`);

  // 2. Get workflow states
  console.log("📋 Fetching workflow states...");
  const statesResult = await team.states();
  const stateMap = {};
  for (const s of statesResult.nodes) {
    stateMap[s.name] = s.id;
    // Map common names
    if (s.type === "completed") stateMap["Done"] = stateMap["Done"] || s.id;
    if (s.type === "started") stateMap["In Progress"] = stateMap["In Progress"] || s.id;
    if (s.type === "unstarted") stateMap["Todo"] = stateMap["Todo"] || s.id;
  }
  console.log(`   ✓ States: ${Object.keys(stateMap).join(", ")}\n`);

  // 3. Create project
  console.log("📁 Creating project...");
  let project;
  try {
    const projectResult = await linear.createProject({
      name: "BGG Frontend",
      description: "Black Girls Gather — Community Platform frontend. 103 tasks across 8 original sprints. See bgg-fe-tasks.md for full audit.",
      teamIds: [team.id],
    });
    project = await projectResult.project;
    console.log(`   ✓ Project: ${project.name}\n`);
  } catch (e) {
    console.log(`   ⚠ Project creation failed (may already exist): ${e.message}`);
    const projects = await linear.projects({ filter: { name: { eq: "BGG Frontend" } } });
    project = projects.nodes[0];
    if (!project) {
      console.error("❌ Could not create or find project.");
      process.exit(1);
    }
    console.log(`   ✓ Using existing project: ${project.name}\n`);
  }

  // 4. Create labels
  console.log("🏷️  Creating labels...");
  const labelNames = [...new Set(TASKS.flatMap((t) => t.labels))];
  const labelMap = {};

  // Fetch existing labels first
  const existingLabels = await linear.issueLabels({ filter: { team: { id: { eq: team.id } } } });
  for (const l of existingLabels.nodes) {
    labelMap[l.name] = l.id;
  }

  for (let i = 0; i < labelNames.length; i++) {
    const name = labelNames[i];
    if (labelMap[name]) {
      bar(i + 1, labelNames.length, name);
      continue;
    }
    try {
      const result = await linear.createIssueLabel({
        name,
        color: LABEL_COLORS[name] || "#6b7280",
        teamId: team.id,
      });
      const label = await result.issueLabel;
      labelMap[name] = label.id;
    } catch {
      // label may exist at workspace level
      const all = await linear.issueLabels({ filter: { name: { eq: name } } });
      if (all.nodes.length > 0) labelMap[name] = all.nodes[0].id;
    }
    bar(i + 1, labelNames.length, name);
    await sleep(200);
  }
  console.log(`   ✓ ${labelNames.length} labels ready\n`);

  // 5. Create cycles
  console.log("🔄 Creating cycles...");
  const cycleMap = {};
  for (let i = 0; i < CYCLES.length; i++) {
    const c = CYCLES[i];
    try {
      const result = await linear.createCycle({
        name: c.name,
        description: c.description,
        teamId: team.id,
        startsAt: new Date(c.startsAt).toISOString(),
        endsAt: new Date(c.endsAt).toISOString(),
      });
      const cycle = await result.cycle;
      cycleMap[i + 1] = cycle.id;
      bar(i + 1, CYCLES.length, c.name);
    } catch (e) {
      console.log(`\n   ⚠ Cycle "${c.name}" may already exist: ${e.message}`);
    }
    await sleep(300);
  }
  console.log(`   ✓ ${CYCLES.length} cycles created\n`);

  // 6. Create issues
  console.log("📝 Importing issues...");
  const priorityMap = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
  let created = 0;
  let failed = 0;

  for (let i = 0; i < TASKS.length; i++) {
    const t = TASKS[i];
    const title = `[${t.id}] ${t.title}`;
    const labelIds = t.labels.map((l) => labelMap[l]).filter(Boolean);
    const stateId = stateMap[t.status] || stateMap["Todo"];

    const input = {
      title,
      description: t.desc,
      priority: priorityMap[t.priority] || 3,
      teamId: team.id,
      stateId,
      labelIds,
      projectId: project.id,
    };

    // Assign undone tasks to their cycle
    if (t.cycle && cycleMap[t.cycle]) {
      input.cycleId = cycleMap[t.cycle];
    }

    try {
      await linear.createIssue(input);
      created++;
    } catch (e) {
      console.log(`\n   ❌ Failed: ${title} — ${e.message}`);
      failed++;
    }

    bar(i + 1, TASKS.length, `${t.id}`);
    await sleep(150); // rate limit
  }

  console.log(`\n   ✓ Created: ${created} | Failed: ${failed}\n`);

  // 7. Summary
  const done = TASKS.filter((t) => t.status === "Done").length;
  const inProg = TASKS.filter((t) => t.status === "In Progress").length;
  const todo = TASKS.filter((t) => t.status === "Todo").length;

  console.log("═══════════════════════════════════════════════════");
  console.log("  ✅ IMPORT COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Project:      BGG Frontend`);
  console.log(`  Team:         ${team.name} (${team.key})`);
  console.log(`  Total issues: ${TASKS.length}`);
  console.log(`  ✅ Done:       ${done}`);
  console.log(`  🔄 In Progress: ${inProg}`);
  console.log(`  📋 Todo:       ${todo}`);
  console.log(`  Cycles:       ${CYCLES.length}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("\n  Cycle breakdown (remaining work):");
  CYCLES.forEach((c, i) => {
    const count = TASKS.filter((t) => t.cycle === i + 1).length;
    console.log(`    ${c.name}: ${count} issues`);
  });
  console.log(`    Completed (no cycle): ${TASKS.filter((t) => !t.cycle).length} issues`);
  console.log("");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
