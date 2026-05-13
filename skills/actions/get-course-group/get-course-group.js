#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch one course group.
 * GET /incoming/v2/courseGroups/{id}
 * @see https://api.thoughtindustries.com/#course-group-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "courseGroups/{id}",
  description: "Fetch a single course group by ID",
};

/** @typedef {{ id: string, title: string, slug: string, kind: string, description?: string, publishedAt?: string, archivedAt?: string, customFields?: Record<string, unknown> }} CourseGroupDetail */

function printHelp() {
  process.stdout.write(`Usage:
  node get-course-group.js --id=COURSE_GROUP_UUID [options]

Options:
  --id=UUID         Course group ID (required)
  --base-url=URL    TI school URL or full incoming/v2 URL
  --api-key=KEY     Bearer token (prefer TI_API_KEY env var)
  --help            Show this help

`);
}

async function main() {
  const args = parseCommonArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const id = args.positional.id;
  if (!id) throw new Error("--id=COURSE_GROUP_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `courseGroups/${id}`, token, undefined, {
    actionName: "get-course-group",
    skillName: "get-course-group",
    skillTier: "action",
    invocationSource: args.invocationSource || "model_selected",
    clientId,
    instanceId,
    userId,
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
