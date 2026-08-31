/* ──────────────────────────────────────────────
   Shared API types — mirrors BE Prisma schema
   ────────────────────────────────────────────── */

// ── Generic response wrappers ──

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  nextCursor: string | null;
}

// ── Enums ──

export type Role = "ADMIN" | "MEMBER";

export type EventType =
  | "WORKSHOP"
  | "QA"
  | "SPEAKER_SERIES"
  | "SOCIAL"
  | "HACKATHON";

export type CohortStatus = "ACTIVE" | "COMPLETED" | "UPCOMING";

export type ReferralRequestStatus = "PENDING" | "FULFILLED" | "DECLINED";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

// ── Available user (scoped to a group or cohort) ──

export interface AvailableUser {
  id: string;
  email: string;
  profile: { firstName: string; lastName: string } | null;
}

// ── User / Profile ──

export interface Profile {
  firstName: string;
  lastName: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  jobTitle: string | null;
  company: string | null;
  industry: string | null;
  location: string | null;
  isOpenToWork: boolean;
  isPublic: boolean;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  onboardingComplete: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  profile: Profile | null;
}

// ── Events ──

export interface Event {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  host: string;
  type: EventType;
  platform: "ZOOM" | "GOOGLE_MEET" | "OTHER";
  locationType: "online" | "in_person";
  venueAddress: string | null;
  linkType: "meeting" | "registration" | "other";
  meetingLink: string | null;
  recordingUrl: string | null;
  createdAt: string;
  _count: { rsvps: number };
}

export interface RsvpResponse {
  rsvped: boolean;
}

export interface RsvpUser {
  id: string;
  email: string;
  profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl"> | null;
  rsvpedAt: string;
}

// ── Cohorts ──

export interface Cohort {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CohortStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: { members: number };
}

export interface CohortMember {
  id: string;
  email: string;
  profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl" | "jobTitle"> | null;
  joinedAt: string;
}

export interface CohortSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  host: string;
  meetingLink: string | null;
  recordingUrl: string | null;
  _count: { rsvps: number };
}

export interface CohortResource {
  id: string;
  cohortId: string;
  uploadedById: string;
  title: string;
  description: string | null;
  url: string;
  accessType: "link" | "download";
  createdAt: string;
  deletedAt: null;
}

export interface CohortStats {
  memberCount: number;
  sessionsDone: number;
  activeRate: number;
}

// ── Jobs ──

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  externalUrl: string;
  isFeatured: boolean;
  referralAvailable: boolean;
  referralContact: string | null;
  createdAt: string;
}

export interface ReferralRequest {
  id: string;
  jobId: string;
  userId: string;
  status: ReferralRequestStatus;
  message: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl"> | null;
  };
  job?: Pick<Job, "id" | "title" | "company">;
}

// ── Community ──

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  colorTheme: string;
  isDefault: boolean;
  cohortId: string | null;
  memberCount?: number;
  newPostCount: number;
  isJoined?: boolean;
  createdAt: string;
  _count?: { members: number };
}

export interface CommunityGroupDetail extends CommunityGroup {
  channels: Channel[];
  isMember: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
}

export interface GroupMember {
  id: string;
  email: string;
  profile: { firstName: string; lastName: string; avatarUrl: string | null } | null;
}

export interface Post {
  id: string;
  title: string | null;
  body: string;
  isDeleted: boolean;
  createdAt: string;
  author: {
    id: string;
    profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl"> | null;
  };
  _count: { comments: number };
}

export interface Comment {
  id: string;
  body: string;
  isDeleted: boolean;
  createdAt: string;
  author: {
    id: string;
    profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl"> | null;
  };
}

// ── Members directory ──

export interface MemberCard {
  id: string;
  email: string;
  role?: string;
  status?: string;
  createdAt?: string;
  profile: Profile | null;
}

// ── Notifications ──

export type NotificationType =
  | "JOB_POSTED"
  | "EVENT_CREATED"
  | "ANNOUNCEMENT"
  | "SESSION_REMINDER"
  | "COHORT_INVITE"
  | "REFERRAL_UPDATE"
  | "WARNING_SENT"
  | "REPORT_RESOLVED";

export interface NotificationMeta {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  referenceType: string | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsPayload {
  notifications: AppNotification[];
  unreadCount: number;
  meta: NotificationMeta;
}

// ── Developer Plan ──

export interface Milestone {
  id: string;
  title: string;
  order: number;
  status: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface DeveloperPlan {
  id: string;
  userId: string;
  goal: string | null;
  milestones: Milestone[];
  percentage: number;
  createdAt: string;
}

// ── Moderation ──

// status field on the report record itself: "OPEN" (pending review) or "RESOLVED"
export type ModerationReportStatus = "OPEN" | "RESOLVED";
// resolution sub-type recorded when a report is resolved
export type ModerationReportResolution = "DISMISSED" | "WARNED" | "DELETED" | null;
// contentType as returned by the API (title-case)
export type ModerationContentType = "Post" | "Comment" | "Profile";

export type ReportReason =
  | "HARASSMENT"
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "MISINFORMATION"
  | "HATE_SPEECH";

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface ReportInput {
  reason: ReportReason;
  description?: string;
  severity?: ReportSeverity;
}

export interface ModerationReport {
  id: string;
  contentType: ModerationContentType;
  status: ModerationReportStatus;
  resolution: ModerationReportResolution;
  reason: string;
  description: string | null;
  severity: ReportSeverity;
  content: string | null;
  contentId: string | null;
  postId: string | null;
  commentId: string | null;
  reportedUser: {
    id: string;
    email: string;
    profile: (Pick<Profile, "firstName" | "lastName" | "avatarUrl"> & { flagCount?: number }) | null;
    accountAge?: string;
    trustScore?: string;
  };
  reporter: {
    id: string;
    email: string;
    profile: Pick<Profile, "firstName" | "lastName" | "avatarUrl"> | null;
  } | null;
  createdAt: string;
  resolvedAt: string | null;
}

// ── Analytics ──

export interface AnalyticsOverview {
  totalMembers: number;
  activeThisMonth: number;
  newThisMonth: number;
  totalEvents: number;
  totalRsvpsThisMonth: number;
  totalCohorts: number;
  activeCohorts: number;
  openReports: number;
}

export interface AnalyticsGrowthPoint {
  period: string;       // "YYYY-MM"
  totalMembers: number;
  newMembers: number;
  activeMembers: number;
  events: number;
  rsvps: number;
}
