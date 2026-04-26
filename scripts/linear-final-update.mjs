#!/usr/bin/env node
/**
 * Final Linear update: FE-G-09 → Done, add blocker notes to FE-A8-09 + FE-A8-26.
 */
import { LinearClient } from "@linear/sdk";

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) { console.error("Set LINEAR_API_KEY"); process.exit(1); }
const linear = new LinearClient({ apiKey: API_KEY });

const UPDATES = [
  {
    id: "FE-G-09",
    target: "Done",
    note: `✅ **Completed — Global API error handling + 401 redirect**

**Implementation (3 files):**
- \`src/lib/api.ts\`: Added \`handle401()\` utility — clears Clerk JWT from localStorage, redirects to \`/sign-in\` using \`window.location.replace()\`. Uses a \`redirecting\` flag to prevent multiple simultaneous redirects. Called automatically in \`apiClient\` when any response returns HTTP 401.
- \`src/lib/swr.tsx\`: \`SWRProvider\` now has global \`onError\` that catches 401 → calls \`handle401()\`. Added smart \`onErrorRetry\` — skips retry for 401/403/404, backs off exponentially for other errors, max 3 retries.
- \`src/hooks/use-api-mutation.ts\`: Imports \`handle401\`, calls it in the catch block when mutation returns 401.

**Coverage:** All authenticated API calls flow through either \`useAuthSWR\` (GET) or \`useApiMutation\` (POST/PATCH/DELETE), both of which use \`apiClient\`. The 401 intercept is in \`apiClient\` itself, so every API call is covered with zero changes needed to individual pages/hooks.`
  },
  {
    id: "FE-A8-09",
    target: null, // don't change status, just add note
    note: `🚫 **BLOCKED — Waiting on backend API**

**What exists (frontend):**
- Warning modal UI with textarea is fully built in admin moderation/members pages
- Submit updates local state (mock) — works end-to-end in the UI
- \`useApiMutation\` hook is ready to wire

**What's needed (backend):**
- POST endpoint for sending warnings/notifications to members (e.g. \`POST /admin/members/:id/warn\` or \`POST /admin/notifications\`)
- The backend API at \`bggather-api.duckdns.org\` currently returns 500 on most endpoints (DB issue) and 404 on admin routes
- Once the endpoint is available, wiring is ~10 lines: create a \`useApiMutation\` call with the endpoint path + revalidation key

**To unblock:** Backend team needs to deploy the moderation/notification endpoints and fix the DB connection issue.`
  },
  {
    id: "FE-A8-26",
    target: null, // don't change status, just add note
    note: `🚫 **BLOCKED — Waiting on backend API (same blocker as FE-A8-09)**

**What exists (frontend):**
- WarnMemberModal component exists with message textarea
- ConfirmModal for action confirmation is built and shared
- The admin moderation page uses MOCK_REPORTS/MOCK_RESOLVED with local state only
- No \`use-admin-moderation\` hook exists yet (needs to be created once endpoints are known)

**What's needed (backend):**
- POST endpoint for sending warning notification to a specific member
- Notification delivery mechanism (in-app notification, email, or both)
- Response contract (success/failure shape) so the frontend can show appropriate toast

**What's needed (frontend, once unblocked):**
1. Create \`src/hooks/use-admin-moderation.ts\` with \`useSendWarning(memberId)\` using \`useApiMutation\`
2. Wire the WarnMemberModal submit to call the mutation
3. Show success/error toast via \`useToast\`
4. Revalidate the member's status in the members list

**To unblock:** Same as FE-A8-09 — backend moderation/notification API endpoints need to be deployed.`
  },
];

async function main() {
  console.log("\n🔄 Final Linear Update\n");

  const teams = await linear.teams();
  const team = teams.nodes[0];
  if (!team) { console.error("No team found"); process.exit(1); }

  const states = await team.states();
  const stateMap = {};
  for (const s of states.nodes) {
    if (s.type === "completed") stateMap["Done"] = stateMap["Done"] || s.id;
  }

  for (const task of UPDATES) {
    try {
      const results = await linear.issues({
        filter: { title: { contains: `[${task.id}]` }, team: { id: { eq: team.id } } }
      });

      if (results.nodes.length === 0) {
        console.log(`  ⚠ NOT FOUND: ${task.id}`);
        continue;
      }

      const issue = results.nodes[0];
      const updatePayload = {};

      if (task.target === "Done") {
        updatePayload.stateId = stateMap["Done"];
      }

      updatePayload.description = issue.description
        ? `${issue.description}\n\n---\n${task.note}`
        : task.note;

      await linear.updateIssue(issue.id, updatePayload);
      console.log(`  ✅ ${task.id}: ${task.target ? `→ ${task.target}` : "notes added"}`);
    } catch (e) {
      console.log(`  ❌ FAILED: ${task.id} — ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\nDone.\n");
}

main().catch(e => { console.error(e); process.exit(1); });
