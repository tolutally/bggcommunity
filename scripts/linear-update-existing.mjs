#!/usr/bin/env node

import { LinearClient } from "@linear/sdk";

const apiKey = process.env.LINEAR_API_KEY;

if (!apiKey) {
  console.error("LINEAR_API_KEY is not set in this shell.");
  process.exit(1);
}

const linear = new LinearClient({ apiKey });

const updates = [
  { id: "FE-M0-01", status: "Done" },
  { id: "FE-M0-02", status: "Done" },
  { id: "FE-M0-03", status: "Done" },
  { id: "FE-M0-04", status: "Done" },
  { id: "FE-M0-05", status: "In Progress" },
  { id: "FE-M0-06", status: "Done" },
  { id: "FE-M0-07", status: "Done" },
  { id: "FE-M0-08", status: "Done" },
  { id: "FE-M1-01", status: "Done" },
  { id: "FE-M1-02", status: "Done" },
  { id: "FE-M1-03", status: "Done" },
  { id: "FE-M1-04", status: "Done" },
  { id: "FE-M1-05", status: "Done" },
  { id: "FE-M1-06", status: "Done" },
  { id: "FE-M1-07", status: "Done" },
  { id: "FE-M1-08", status: "Done" },
  { id: "FE-M2-05", status: "Done" },
];

async function main() {
  const projectsConn = await linear.projects({
    filter: { name: { eq: "BGG Frontend" } },
  });

  if (projectsConn.nodes.length === 0) {
    console.error('Project "BGG Frontend" not found.');
    process.exit(1);
  }

  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  let missingStateMap = 0;

  for (const project of projectsConn.nodes) {
    console.log(`\nProcessing project: ${project.name} (${project.id})`);

    const teamsConn = await project.teams();
    const team = teamsConn.nodes[0];
    if (!team) {
      console.log("SKIP project with no team attached.");
      continue;
    }

    const states = await team.states();
    const stateMap = {};
    for (const state of states.nodes) {
      stateMap[state.name] = state.id;
      if (state.type === "completed") stateMap.Done ??= state.id;
      if (state.type === "started") stateMap["In Progress"] ??= state.id;
      if (state.type === "unstarted") stateMap.Todo ??= state.id;
    }

    const issuesConn = await linear.issues({
      first: 250,
      filter: { project: { id: { eq: project.id } } },
    });
    const issues = issuesConn.nodes;

    for (const task of updates) {
      const issue = issues.find((i) => i.title.startsWith(`[${task.id}]`));
      if (!issue) {
        missing += 1;
        console.log(`SKIP missing: ${task.id}`);
        continue;
      }

      const nextStateId = stateMap[task.status];
      if (!nextStateId) {
        missingStateMap += 1;
        console.log(`SKIP missing state mapping: ${task.id} -> ${task.status}`);
        continue;
      }

      if (issue.stateId === nextStateId) {
        unchanged += 1;
        console.log(`UNCHANGED: ${task.id}`);
        continue;
      }

      await linear.updateIssue(issue.id, { stateId: nextStateId });
      updated += 1;
      console.log(`UPDATED: ${task.id} -> ${task.status}`);
    }
  }

  console.log("\nSUMMARY");
  console.log(`updated=${updated}`);
  console.log(`unchanged=${unchanged}`);
  console.log(`missing=${missing}`);
  console.log(`missingStateMap=${missingStateMap}`);
}

main().catch((error) => {
  console.error("Failed to update Linear issues:", error.message);
  process.exit(1);
});
