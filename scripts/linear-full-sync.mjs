#!/usr/bin/env node
/**
 * BGG-FE → Linear Full Status Sync
 * Moves all verified-done tasks to "Done" and corrects FE-A8-26 to "Todo".
 * One-time script — delete after running.
 */
import { LinearClient } from "@linear/sdk";

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) { console.error("Set LINEAR_API_KEY"); process.exit(1); }
const linear = new LinearClient({ apiKey: API_KEY });

const UPDATES = [
  // ── Auth & Onboarding (16 tasks: Todo → Done) ──
  { id: "FE-M0-01", target: "Done", note: "Auth layout with split-panel, centered card, BGG logo, brand header" },
  { id: "FE-M0-02", target: "Done", note: "Google OAuth via Clerk SSO with GoogleIcon SVG" },
  { id: "FE-M0-03", target: "Done", note: "Email+password sign-in with Clerk, error handling, show/hide toggle" },
  { id: "FE-M0-04", target: "Done", note: "Sign-up form with firstName/lastName/email/password, terms checkbox, email verification" },
  { id: "FE-M0-05", target: "Done", note: "HTML required attrs, terms checkbox, Clerk server validation, AuthContext helpers" },
  { id: "FE-M0-06", target: "Done", note: "Forgot password with Clerk resetPasswordEmailCode, success confirmation" },
  { id: "FE-M0-07", target: "Done", note: "Auth layout redirects signed-in→/member, sign-up→/onboarding, RouteGuard role-based routing" },
  { id: "FE-M0-08", target: "Done", note: "Responsive split-panel (lg:w-[45%] brand panel, mobile logo, min-h-screen)" },
  { id: "FE-M1-01", target: "Done", note: "5-step onboarding shell with progress bar, step navigation, sticky footer" },
  { id: "FE-M1-02", target: "Done", note: "Step1BasicInfo with displayName, occupation, industry select, location, bio" },
  { id: "FE-M1-03", target: "Done", note: "Step2Photo with drag-drop, file input, preview, 2MB limit, remove button" },
  { id: "FE-M1-04", target: "Done", note: "Step3Socials with website, linkedin, twitter, github inputs with icons" },
  { id: "FE-M1-05", target: "Done", note: "Step4Privacy with profileVisible, showEmail, showSocials, showLocation toggles" },
  { id: "FE-M1-06", target: "Done", note: "Step5DevPlan with devGoalTitle and milestones, saves to localStorage" },
  { id: "FE-M1-07", target: "Done", note: "localStorage persistence via STORAGE_KEY, loadOnboarding/saveOnboarding, auto-save" },
  { id: "FE-M1-08", target: "Done", note: "Dashboard showDevPlanBanner with dismissable banner linking to /member/devplan" },

  // ── App Shell (1 task: Todo → Done) ──
  { id: "FE-M2-05", target: "Done", note: "RouteGuard in AuthContext + Clerk middleware protecting all non-public routes" },

  // ── Dashboard (2 tasks: Todo/InProgress → Done) ──
  { id: "FE-M3-03", target: "Done", note: "useRsvpEvent() hook calls POST /events/:id/rsvp via API, fully wired" },
  { id: "FE-M3-07", target: "Done", note: "Dashboard uses useEvents() and useJobs() hooks with real API via useAuthSWR" },

  // ── Cohorts (1 task: Todo → Done) ──
  { id: "FE-C3-08", target: "Done", note: "useCohorts/useCohort/useCohortMembers/useCohortSessions/useCohortResources all wired to API" },

  // ── Recordings (2 tasks: Todo/InProgress → Done) ──
  { id: "FE-R4-03", target: "Done", note: "Full recordings page with grid+list views, search, type filter, recording count" },
  { id: "FE-R4-04", target: "Done", note: "Responsive grid (1/2/3 cols), list view toggle, fully styled" },

  // ── Jobs (3 tasks: Todo/InProgress → Done) ──
  { id: "FE-J5-04", target: "Done", note: "useRequestReferral() calling POST /jobs/:id/referral-request with dedup" },
  { id: "FE-J5-05", target: "Done", note: "Real-time search filtering by title, company, location via useMemo" },
  { id: "FE-J5-06", target: "Done", note: "useJobs() calling GET /jobs, useRequestReferral() calling POST via useAuthSWR" },

  // ── Community (2 tasks: Todo/InProgress → Done) ──
  { id: "FE-D6-05", target: "Done", note: "handleDeletePost() calling DELETE /community/posts/:id with auth token" },
  { id: "FE-D6-06", target: "Done", note: "useCommunityGroups/useChannelPosts with cursor-based pagination via useAuthSWR" },

  // ── Member Directory (1 task: InProgress → Done) ──
  { id: "FE-MD6-05", target: "Done", note: "Real-time search by name, role, location via searchTerm + filteredMembers useMemo" },

  // ── Dev Plan (1 task: InProgress → Done) ──
  { id: "FE-DP7-05", target: "Done", note: "cycleStatus() cycling not-started→in-progress→completed, persists to localStorage" },

  // ── Admin (3 tasks: Todo → Done) ──
  { id: "FE-A8-19", target: "Done", note: "Event detail + RSVP list with search, stats using useEvent()/useEventRsvps() hooks" },
  { id: "FE-A8-20", target: "Done", note: "recordingInput + saveRecording() using useAttachRecording(eventId) hook" },
  { id: "FE-A8-23", target: "Done", note: "ReferralsPanel with useJobReferralRequests() and useUpdateReferralStatus() hooks" },

  // ── Corrections ──
  { id: "FE-A8-26", target: "Todo", note: "No moderation API hooks exist — only mock data with local state" },
];

async function main() {
  console.log("\n🔄 BGG-FE → Linear Full Status Sync\n");

  const teams = await linear.teams();
  const team = teams.nodes[0];
  if (!team) { console.error("No team found"); process.exit(1); }
  console.log(`Team: ${team.name} (${team.key})`);

  const states = await team.states();
  const stateMap = {};
  for (const s of states.nodes) {
    if (s.type === "completed") stateMap["Done"] = stateMap["Done"] || s.id;
    if (s.type === "started") stateMap["In Progress"] = stateMap["In Progress"] || s.id;
    if (s.type === "unstarted") stateMap["Todo"] = stateMap["Todo"] || s.id;
  }
  console.log(`States: Done=${stateMap["Done"] ? "✓" : "✗"}, InProgress=${stateMap["In Progress"] ? "✓" : "✗"}, Todo=${stateMap["Todo"] ? "✓" : "✗"}\n`);

  let updated = 0, notFound = 0, alreadyCorrect = 0, failed = 0;

  for (const task of UPDATES) {
    const searchTitle = `[${task.id}]`;
    try {
      const results = await linear.issues({
        filter: { title: { contains: searchTitle }, team: { id: { eq: team.id } } }
      });

      if (results.nodes.length === 0) {
        console.log(`  ⚠ NOT FOUND: ${task.id}`);
        notFound++;
        continue;
      }

      const issue = results.nodes[0];
      const issueState = await issue.state;
      const targetStateType = task.target === "Done" ? "completed" : task.target === "In Progress" ? "started" : "unstarted";

      if (issueState && issueState.type === targetStateType) {
        console.log(`  ✓ ALREADY ${task.target.toUpperCase()}: ${task.id}`);
        alreadyCorrect++;
        continue;
      }

      const newDesc = issue.description
        ? `${issue.description}\n\n---\n✅ **Status update:** ${task.note}`
        : `✅ **Status update:** ${task.note}`;

      await linear.updateIssue(issue.id, {
        stateId: stateMap[task.target],
        description: newDesc,
      });

      console.log(`  ✅ UPDATED: ${task.id} → ${task.target}`);
      updated++;
    } catch (e) {
      console.log(`  ❌ FAILED: ${task.id} — ${e.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  ✅ Updated:         ${updated}`);
  console.log(`  ✓ Already correct:  ${alreadyCorrect}`);
  console.log(`  ⚠ Not found:        ${notFound}`);
  console.log(`  ❌ Failed:           ${failed}`);
  console.log(`  📊 Total processed: ${UPDATES.length}`);
  console.log(`${"═".repeat(50)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
