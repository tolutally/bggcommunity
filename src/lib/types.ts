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
  platform: string | null;
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
  title: string;
  url: string;
  createdAt: string;
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
  memberCount: number;
  newPostCount: number;
  createdAt: string;
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
  profile: Profile | null;
}
