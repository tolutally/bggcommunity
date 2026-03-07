# Inline Duplicates Audit Report

> **Generated audit of all inline implementations across page files that should use shared components from `src/components/ui/`.**

---

## Shared Components Reference

| Component | File | Key Props |
|-----------|------|-----------|
| **StatusBadge** | `src/components/ui/status-badge/index.tsx` | `label`, `preset`, `color`, `variant` ("pill"\|"tag"\|"dot-only"), `dot`, `icon` |
| **ConfirmModal** | `src/components/ui/confirm-modal/index.tsx` | `open`, `onClose`, `onConfirm`, `title`, `description`, `variant` ("danger"\|"primary"), `icon`, `loading` |
| **EmptyState** | `src/components/ui/empty-state/index.tsx` | `icon`, `heading`, `description`, `action`, `variant` ("dashed"\|"plain") |
| **AvatarInitials** | `src/components/ui/avatar-initials/index.tsx` | `name`, `src`, `size` ("xs"\|"sm"\|"md"\|"lg"\|"xl") |
| **Skeleton / SkeletonCard / SkeletonRow** | `src/components/ui/skeleton/index.tsx` | `className`, `lines`, `cols` |
| **ErrorBoundary** | `src/components/ui/error-boundary/index.tsx` | `fallback` |
| **useToast / ToastProvider** | `src/components/ui/toast/index.tsx` | `toast(message, variant)`, `dismiss(id)` |

### StatusBadge Presets Available
`Active`, `Upcoming`, `Completed`, `On Leave`, `Suspended`, `Inactive`, `To Do`, `In Progress`, `High`, `Medium`, `Low`, `Remote`, `Hybrid`, `On-site`, `Zoom`, `Google Meet`, `Workshop`, `Q&A`, `Speaker Series`, `Social`, `Hackathon`

---

## Duplicates by File

---

### 1. `src/app/member/devplan/page.tsx`

**Already uses:** `EmptyState`, `useToast`

#### 1a. StatusBadge — Inline `STATUS_CONFIG` badge classes (Lines 97–99)
```tsx
const STATUS_CONFIG = {
    "not-started": { ..., badge: "bg-stone-100 text-stone-600 border-stone-200" },
    "in-progress": { ..., badge: "bg-amber-50 text-amber-700 border-amber-200" },
    "completed":   { ..., badge: "bg-green-50 text-green-700 border-green-200" },
};
```
**Used at:**
- **Line 289** — Progress summary cards: `<div className={...cfg.badge...}>`
- **Line 371** — Goal status label: `<span className={...cfg.badge}>{cfg.label}</span>`

**Replace with:** `<StatusBadge label={cfg.label} preset="To Do" />` / `preset="In Progress"` / `preset="Completed"`

#### 1b. ConfirmModal — Inline delete confirm buttons (Lines 383–387)
```tsx
{deleteConfirmId === goal.id ? (
    <div className="flex items-center gap-1">
        <button onClick={() => deleteGoal(goal.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold">Delete</button>
        <button onClick={() => setDeleteConfirmId(null)} className="p-2 text-stone-400 hover:bg-stone-50 rounded-xl text-xs font-bold">Cancel</button>
    </div>
) : ( ... )}
```
**Replace with:** `<ConfirmModal>` with `open={deleteConfirmId === goal.id}` — this is an inline Delete/Cancel pair rather than a modal, but should use ConfirmModal for consistency.

---

### 2. `src/app/member/profile/page.tsx`

**Already uses:** `useToast`

#### 2a. ConfirmModal — Inline Delete Account modal (Lines 468–483)
```tsx
{deleteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" ... />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 rounded-xl"><AlertTriangle size={24} className="text-rose-600" /></div>
                <h2 className="text-xl font-bold text-stone-900">Delete Account</h2>
            </div>
            ...Cancel / Delete Account buttons...
        </div>
    </div>
)}
```
**Replace with:** `<ConfirmModal open={deleteModal} variant="danger" title="Delete Account" description="..." icon={AlertTriangle}>` — Note: the "type DELETE to confirm" input is custom, so ConfirmModal may need a `children` slot or this specific modal may warrant keeping custom with ConfirmModal's overlay/button pattern at minimum.

---

### 3. `src/app/member/community/page.tsx`

**Already uses:** `EmptyState`

#### 3a. AvatarInitials — Inline `<img>` avatars in PostCard (Lines 449–450)
```tsx
<img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
```
Also in reply items (Line ~497):
```tsx
<img src={reply.avatar} alt={reply.author} className="w-6 h-6 rounded-full" />
```
**Replace with:** `<AvatarInitials name={post.author} src={post.avatar} size="sm" />` — provides initials fallback if image fails.

#### 3b. AvatarInitials — Inline `<img>` avatars in AnnouncementCard
Same pattern — `<img>` with no fallback.

---

### 4. `src/app/member/members/page.tsx`

#### 4a. AvatarInitials — Member card avatars (Lines 152–157)
```tsx
<div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-brand-100 to-orange-100 ...">
    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
</div>
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="xl" />` — Note: the gradient border is decorative; AvatarInitials can be wrapped in a gradient container.

#### 4b. AvatarInitials — MemberDetailModal avatar (Lines ~218–222)
```tsx
<div className="w-32 h-32 rounded-full p-1.5 bg-white shadow-xl">
    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover bg-stone-100" />
</div>
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="xl" />` (or custom size wrapper)

---

### 5. `src/app/member/page.tsx` (Dashboard)

#### 5a. StatusBadge — Inline `getTypeColor()` function (Lines 106–113)
```tsx
const getTypeColor = (type: string) => {
    switch (type) {
        case "Workshop": return "bg-brand-100 text-brand-700 border-brand-200";
        case "Q&A": return "bg-blue-100 text-blue-700 border-blue-200";
        case "Interactive": return "bg-amber-100 text-amber-700 border-amber-200";
        case "Speaker Series": return "bg-emerald-100 text-emerald-700 border-emerald-200";
        default: return "bg-stone-100 text-stone-700 border-stone-200";
    }
};
```
**Used at Line 270:**
```tsx
<span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${getTypeColor(session.type)}`}>
    {session.type}
</span>
```
**Replace with:** `<StatusBadge label={session.type} preset={session.type} />` — presets Workshop, Q&A, Speaker Series already exist.

#### 5b. StatusBadge — Inline "Required" badge (Lines 273–275)
```tsx
<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-rose-100 text-rose-600 border border-rose-200">
    Required
</span>
```
**Replace with:** `<StatusBadge label="Required" color={{ bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" }} />`

#### 5c. StatusBadge — Inline "Going" badge (Lines 277–279)
```tsx
<span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-green-100 text-green-700 border border-green-200">
    <CheckCircle size={12} /> Going
</span>
```
**Replace with:** `<StatusBadge label="Going" color={{ bg: "bg-green-100", text: "text-green-700", border: "border-green-200" }} icon={CheckCircle} />`

#### 5d. StatusBadge — Inline job card work mode badges (Lines 415–419)
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Hybrid
</span>
```
**Replace with:** `<StatusBadge label="Hybrid" preset="Hybrid" />` / `<StatusBadge label="Remote" preset="Remote" />`

---

### 6. `src/app/member/cohorts/[slug]/page.tsx`

**Already uses:** `EmptyState` (in ResourcesTab)

#### 6a. StatusBadge — Inline session type badges in SessionsTab (Lines 237–242)
```tsx
<span className="bg-brand-100 px-2 py-0.5 rounded text-xs font-semibold text-brand-700">Mandatory</span>
...
<span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Q&A</span>
<span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-semibold text-stone-600">Optional</span>
```
**Replace with:** `<StatusBadge label="Mandatory" color={{...}} />`, `<StatusBadge label="Q&A" preset="Q&A" />`, etc.

#### 6b. AvatarInitials — MembersTab member card avatars (Lines ~575–580)
```tsx
<img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="xl" />`

#### 6c. AvatarInitials — MemberDetailModal avatar (Lines ~660–670)
```tsx
<img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover bg-stone-100" />
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="xl" />`

#### 6d. StatusBadge — MemberDetailModal inline tags (Lines ~700–720)
```tsx
<span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
    Open to Opportunities
</span>
<span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-bold border border-brand-100">
    {member.industry}
</span>
```
**Replace with:** `<StatusBadge label="Open to Opportunities" color={{...}} />`, `<StatusBadge label={member.industry} color={{...}} />`

---

### 7. `src/app/member/jobs/page.tsx`

**Already uses:** `EmptyState`

#### 7a. StatusBadge — Inline work mode badges (Lines 121–123)
```tsx
<span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
    job.workMode === "Remote" ? "bg-green-50 text-green-700 border-green-100"
    : job.workMode === "Hybrid" ? "bg-blue-50 text-blue-700 border-blue-100"
    : "bg-stone-50 text-stone-600 border-stone-200"
}`}>
    {job.workMode}
</span>
```
**Replace with:** `<StatusBadge label={job.workMode} preset={job.workMode} />` — presets Remote, Hybrid, On-site already exist.

---

### 8. `src/app/member/schedule/page.tsx`

**Already uses:** `EmptyState`

#### 8a. StatusBadge — Inline `PLATFORM_META` color map (Lines 55–59)
```tsx
const PLATFORM_META: Record<Platform, { label: string; color: string; icon: typeof Video }> = {
    zoom: { label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Video },
    "google-meet": { label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200", icon: Video },
    other: { label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200", icon: Video },
};
```
**Replace with:** `<StatusBadge label="Zoom" preset="Zoom" />` / `<StatusBadge label="Google Meet" preset="Google Meet" />`

#### 8b. StatusBadge — Inline `TYPE_COLOR` map (Lines 61–67)
```tsx
const TYPE_COLOR: Record<string, string> = {
    Workshop: "bg-brand-100 text-brand-700 border-brand-200",
    "Q&A": "bg-blue-100 text-blue-700 border-blue-200",
    "Speaker Series": "bg-emerald-100 text-emerald-700 border-emerald-200",
    Social: "bg-amber-100 text-amber-700 border-amber-200",
    Hackathon: "bg-purple-100 text-purple-700 border-purple-200",
};
```
**Replace with:** `<StatusBadge label={event.type} preset={event.type} />` — presets Workshop, Q&A, Speaker Series, Social, Hackathon already exist.

---

### 9. `src/app/admin/cohorts/[slug]/page.tsx`

#### 9a. StatusBadge — Inline cohort status badge (Lines 163–167)
```tsx
const statusBadge = cohort.status === "Active"
    ? "bg-green-50 text-green-700"
    : cohort.status === "Upcoming"
    ? "bg-blue-50 text-blue-700"
    : "bg-stone-100 text-stone-600";
```
**Used at Line 195:**
```tsx
<span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge}`}>
    {cohort.status}
</span>
```
**Replace with:** `<StatusBadge label={cohort.status} preset={cohort.status} />`

#### 9b. StatusBadge — Inline "High Health" / "Medium Health" badge (Line 252)
```tsx
<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
    cohort.health === "High" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
}`}>
    {cohort.health} Health
</span>
```
**Replace with:** `<StatusBadge label={cohort.health + " Health"} preset={cohort.health} />`

#### 9c. StatusBadge — Inline member status with colored dots (Lines 402–412)
```tsx
<span className={`flex items-center gap-1.5 text-xs font-semibold ${
    member.status === "Active" || member.status === "Graduated" ? "text-green-600"
    : member.status === "Enrolled" ? "text-blue-600" : "text-stone-400"
}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${
        member.status === "Active" || member.status === "Graduated" ? "bg-green-500"
        : member.status === "Enrolled" ? "bg-blue-500" : "bg-stone-300"
    }`}></span>
    {member.status}
</span>
```
**Replace with:** `<StatusBadge label={member.status} preset={member.status} variant="dot-only" />` (or preset="Active" for Active/Graduated)

#### 9d. AvatarInitials — Member table avatars (Line 396)
```tsx
<img src={member.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="sm" />`

#### 9e. StatusBadge — Session status badges "Upcoming" / "Completed" (Lines 457, 476)
```tsx
<span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700">Upcoming</span>
...
<span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-stone-100 text-stone-500">Completed</span>
```
**Replace with:** `<StatusBadge label="Upcoming" preset="Upcoming" />` / `<StatusBadge label="Completed" preset="Completed" />`

#### 9f. EmptyState — Inline "No upcoming sessions" text (Line 292)
```tsx
<p className="text-sm text-stone-400 py-4 text-center">No upcoming sessions scheduled.</p>
```
**Replace with:** `<EmptyState icon={Video} heading="No upcoming sessions" description="No sessions are currently scheduled." variant="plain" />`

---

### 10. `src/app/admin/members/page.tsx`

**Already uses:** `StatusBadge` (in `MemberListRow`), `EmptyState`

#### 10a. StatusBadge — Inline status badge in `MemberGridCard` (Lines 221–222)
```tsx
<span className={`px-2 py-1 rounded-md text-xs font-bold border ${
    member.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100'
    : member.status === 'On Leave' ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
    : 'bg-stone-50 text-stone-500 border-stone-100'
}`}>
    {member.status}
</span>
```
**Replace with:** `<StatusBadge label={member.status} preset={member.status} />` — same pattern already used in `MemberListRow` on the same page.

#### 10b. AvatarInitials — Inline `<img>` avatar in `MemberGridCard` (Line 209)
```tsx
<img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full object-cover border-4 border-stone-50 shadow-sm ..." />
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="xl" />`

#### 10c. AvatarInitials — Inline `<img>` avatar in `MemberListRow` (Line 250)
```tsx
<img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
```
**Replace with:** `<AvatarInitials name={member.name} src={member.avatar} size="sm" />`

---

### 11. `src/app/admin/moderation/page.tsx`

**Already uses:** `StatusBadge` (for severity badges)

#### 11a. EmptyState — Inline "All Caught Up!" empty state (Lines 355–368)
```tsx
<div className="h-full flex flex-col items-center justify-center text-center ...">
    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <CheckCircle size={48} />
    </div>
    <h2 className="text-3xl font-bold text-stone-900 mb-2">
        {tab === "pending" ? "All Caught Up!" : "No Matching History"}
    </h2>
    <p className="text-xl text-stone-500 max-w-md mx-auto">
        {tab === "pending" ? "Amazing work. The moderation queue is empty..." : "Try adjusting your filters..."}
    </p>
</div>
```
**Replace with:** `<EmptyState icon={CheckCircle} heading={...} description={...} variant="plain" />`

---

### 12. `src/app/admin/events/page.tsx`

**Already uses:** `ConfirmModal` (for delete)

#### 12a. StatusBadge — Inline `PLATFORMS` color map (Lines 37–41)
```tsx
const PLATFORMS: { key: Platform; label: string; color: string }[] = [
    { key: "zoom", label: "Zoom", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "google-meet", label: "Google Meet", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "other", label: "Other", color: "bg-stone-50 text-stone-600 border-stone-200" },
];
```
**Used via `platformBadge()` at Lines 138, 177:**
```tsx
<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${platformBadge(event.platform)}`}>
    {platformLabel(event.platform)}
</span>
```
**Replace with:** `<StatusBadge label={platformLabel(event.platform)} preset={platformLabel(event.platform)} />`

#### 12b. StatusBadge — Inline event type badge (Line 137)
```tsx
<span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
    {event.type}
</span>
```
**Replace with:** `<StatusBadge label={event.type} preset={event.type} />` — presets Workshop, Q&A, Speaker Series, Social, Hackathon exist.

#### 12c. StatusBadge — Inline "Past" badge (Line 138)
```tsx
{event.status === "past" && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-500">Past</span>}
```
**Replace with:** `<StatusBadge label="Past" color={{ bg: "bg-stone-100", text: "text-stone-500" }} />`

#### 12d. EmptyState — Inline empty filter state (Lines 126–130)
```tsx
{filtered.length === 0 && (
    <div className="text-center py-16">
        <Calendar className="mx-auto text-stone-300 mb-4" size={48} />
        <p className="text-stone-500 font-semibold">No events match your filters.</p>
    </div>
)}
```
**Replace with:** `<EmptyState icon={Calendar} heading="No events match your filters" variant="plain" />`

---

### 13. `src/app/admin/analytics/page.tsx`

No inline duplicates of shared components found. This page has custom chart components and metric cards that don't duplicate the shared UI components.

---

### 14. `src/app/admin/page.tsx` (Dashboard)

**Already uses:** `AvatarInitials` (for recently added users)

#### 14a. StatusBadge — Inline "High Health" / "Medium Health" in `CohortStatusCard` (Lines ~305–306)
```tsx
<span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
    health === "High" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
}`}>
    {health} Health
</span>
```
**Replace with:** `<StatusBadge label={health + " Health"} preset={health} />`

#### 14b. ConfirmModal — All modals use custom inline implementations
The `AddUserModal` and `NewEventModal` are form modals (not confirm modals), so they don't directly duplicate ConfirmModal. However, they share the exact same overlay/close-button pattern `fixed inset-0 z-50 ... bg-black/40 backdrop-blur-sm`. These could share a base `Modal` wrapper, but this is a structural refactor beyond the scope of shared UI components.

---

### 15. `src/app/admin/settings/page.tsx`

#### 15a. ConfirmModal — Inline Reset Data confirm pattern (Lines 192–199)
```tsx
{!resetConfirm ? (
    <button onClick={() => setResetConfirm(true)} ...>Reset Data</button>
) : (
    <div className="flex gap-2">
        <button onClick={handleResetData} className="flex-1 bg-red-600 text-white ...">Confirm</button>
        <button onClick={() => setResetConfirm(false)} className="flex-1 bg-white border ...">Cancel</button>
    </div>
)}
```
**Replace with:** `<ConfirmModal open={resetConfirm} onConfirm={handleResetData} onClose={() => setResetConfirm(false)} title="Reset Test Data" description="Clears all mock posts, comments, and reports." variant="danger" />`

#### 15b. StatusBadge — Inline integration status badges (Line 221 in `IntegrationCard`)
```tsx
<span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
    isConnected ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
}`}>
    {integration.status}
</span>
```
**Replace with:** `<StatusBadge label={integration.status} preset={isConnected ? "Active" : "Inactive"} />`

---

### 16. `src/app/mentor/page.tsx` (Dashboard)

#### 16a. AvatarInitials — Inline initials circle in `BookingRequestItem` (Lines 109–111)
```tsx
<div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
    {name[0]}
</div>
```
**Replace with:** `<AvatarInitials name={name} size="sm" />` — handles initials extraction and deterministic color.

#### 16b. StatusBadge — Inline "Upcoming - Starts in 2h" badge (Line 62)
```tsx
<span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-2">
    Upcoming - Starts in 2h
</span>
```
**Replace with:** `<StatusBadge label="Upcoming - Starts in 2h" preset="Upcoming" />`

---

### 17. `src/app/mentor/mentees/page.tsx`

#### 17a. AvatarInitials — Inline `<img>` avatars in `ReviewCard` (Line ~176)
```tsx
<img src={avatar} className="w-6 h-6 rounded-full" />
```
**Replace with:** `<AvatarInitials name={user} src={avatar} size="xs" />`

#### 17b. AvatarInitials — Inline `<img>` avatars in `MenteeCard` (Line ~194)
```tsx
<img src={mentee.image} alt={mentee.name} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm" />
```
**Replace with:** `<AvatarInitials name={mentee.name} src={mentee.image} size="lg" />`

#### 17c. AvatarInitials — Inline `<img>` avatars in `ActivityRow` (Line ~238)
```tsx
<img src={avatar} className="w-10 h-10 rounded-full flex-shrink-0" />
```
**Replace with:** `<AvatarInitials name={user} src={avatar} size="sm" />`

#### 17d. StatusBadge — Inline review type badge in `ReviewCard` (Lines ~162–164)
```tsx
<div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
    urgent ? 'bg-red-50 text-red-600' : 'bg-stone-100 text-stone-500'
}`}>
    {type}
</div>
```
**Replace with:** `<StatusBadge label={type} color={urgent ? {...red} : {...stone}} />`

---

### 18. `src/app/mentor/sessions/page.tsx`

#### 18a. AvatarInitials — Inline `<img>` avatar in `CoachingCard` (Line ~107)
```tsx
<img src={avatar} className="w-10 h-10 rounded-full" />
```
**Replace with:** `<AvatarInitials name={mentee} src={avatar} size="sm" />`

#### 18b. StatusBadge — Inline session type badge in `SessionRow` (Line ~127)
```tsx
<span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{type}</span>
```
**Replace with:** `<StatusBadge label={type} preset={type} />` — preset "Workshop" exists.

---

### 19. `src/app/mentor/resources/page.tsx`

No duplicates of the shared UI components found. The upload modal is a form modal (not a confirm modal). No inline badges, avatars, or empty states that duplicate shared components.

---

## Summary

| Component | Total Inline Duplicates | Files Affected |
|-----------|------------------------|----------------|
| **StatusBadge** | **~25 instances** | 12 files |
| **AvatarInitials** | **~14 instances** | 8 files |
| **ConfirmModal** | **~3 instances** | 3 files |
| **EmptyState** | **~3 instances** | 3 files |
| **Skeleton** | 0 | — |
| **ErrorBoundary** | 0 | — |

### Highest Priority (most duplication):
1. **StatusBadge** — Massive duplication. The same color-mapping pattern (`bg-green-50 text-green-700`, etc.) is re-implemented in nearly every page file, often with helper functions like `getTypeColor()`, `platformBadge()`, `TYPE_COLOR`, `PLATFORM_META`, and `STATUS_CONFIG`.
2. **AvatarInitials** — `<img>` tags with no initials fallback appear throughout member cards, modals, and activity feeds.
3. **ConfirmModal** — Three pages have inline confirm/delete patterns that should use the shared modal.
4. **EmptyState** — Three pages have custom inline empty states instead of using the shared component.
