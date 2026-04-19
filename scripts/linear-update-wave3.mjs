#!/usr/bin/env node
/**
 * BGG-FE → Linear Status Update Script
 * Updates completed Wave 1/2/3 tasks to "Done" status.
 * Run once, then delete this file.
 */
import { LinearClient } from "@linear/sdk";

const API_KEY = process.env.LINEAR_API_KEY;
if (!API_KEY) { console.error("Set LINEAR_API_KEY"); process.exit(1); }

const linear = new LinearClient({ apiKey: API_KEY });

// All tasks completed in Wave 1, 2, 3
const COMPLETED_TASKS = [
  // Wave 1
  { id: "FE-DP7-06", note: "All-done banner with CheckCircle + Set New Plan button" },
  { id: "FE-DP7-07", note: "Action Center reads localStorage goals, Dev Plan hero shows live counts" },
  { id: "FE-R4-02", note: "extractYouTubeId + getYouTubeThumbnail in lib/utils.ts" },
  { id: "FE-MD6-04", note: "filteredMembers filters out profile.isPublic === false" },
  // Wave 2
  { id: "FE-A8-04", note: "AdminStatCard: trend prop (up/down/neutral) + tooltip with Info icon" },
  { id: "FE-A8-07", note: "BulkAddMembersModal with paste emails + CSV upload" },
  { id: "FE-A8-13", note: "Bulk add wired to all 3 Add Members buttons in cohort detail" },
  { id: "FE-A8-16", note: "AnnouncementForm 2-column layout with live preview card" },
  { id: "FE-A8-25", note: "Soft delete sets content='[deleted]', member feed detects deleted posts" },
  { id: "FE-C3-07", note: "Membership check with useCohortMembers + useUser, non-members see lock screen" },
  // Wave 3
  { id: "FE-G-08", note: "Custom DatePicker component in components/ui/date-picker" },
  { id: "FE-A8-28", note: "exportXLSX utility (Open XML format) in lib/export.ts" },
  { id: "FE-A8-29", note: "exportPDF utility (browser print-to-PDF) in lib/export.ts" },
  { id: "FE-A8-30", note: "DatePicker replaces native inputs in analytics custom range" },
];

async function main() {
  console.log("\n🔄 BGG-FE → Linear Status Update (Wave 1/2/3)\n");

  // Get team
  const teams = await linear.teams();
  const team = teams.nodes[0];
  if (!team) { console.error("No team found"); process.exit(1); }
  console.log(`Team: ${team.name} (${team.key})`);

  // Get "Done" state
  const states = await team.states();
  const doneState = states.nodes.find(s => s.type === "completed");
  if (!doneState) { console.error("No 'completed' state found"); process.exit(1); }
  console.log(`Done state: "${doneState.name}" (${doneState.id})\n`);

  let updated = 0, notFound = 0, alreadyDone = 0, failed = 0;

  for (const task of COMPLETED_TASKS) {
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

      if (issueState && issueState.type === "completed") {
        console.log(`  ✓ ALREADY DONE: ${task.id} — ${issue.title}`);
        alreadyDone++;
        continue;
      }

      // Update to Done + append completion note
      const newDesc = issue.description
        ? `${issue.description}\n\n---\n✅ **Completed:** ${task.note}`
        : `✅ **Completed:** ${task.note}`;

      await linear.updateIssue(issue.id, {
        stateId: doneState.id,
        description: newDesc,
      });

      console.log(`  ✅ UPDATED: ${task.id} → Done`);
      updated++;
    } catch (e) {
      console.log(`  ❌ FAILED: ${task.id} — ${e.message}`);
      failed++;
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`  ✅ Updated:      ${updated}`);
  console.log(`  ✓ Already done:  ${alreadyDone}`);
  console.log(`  ⚠ Not found:     ${notFound}`);
  console.log(`  ❌ Failed:        ${failed}`);
  console.log(`${"═".repeat(50)}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
