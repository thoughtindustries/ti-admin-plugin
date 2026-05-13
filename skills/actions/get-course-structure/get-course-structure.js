#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch full course structure (sections → lessons → topics).
 * GET /incoming/v2/courses/{courseId}/structure
 * @see https://api.thoughtindustries.com/#course-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "courses/{courseId}/structure",
  description: "Fetch the full hierarchy of a course (sections, lessons, topics)",
};

/** @typedef {{ id: string, title: string, position: number, lessons: LessonNode[] }} SectionNode */
/** @typedef {{ id: string, title: string, position: number, openType?: string, topics: TopicNode[] }} LessonNode */
/** @typedef {{ id: string, title: string, position: number, contentType?: string }} TopicNode */
/** @typedef {{ sections: SectionNode[] }} CourseStructureResponse */

function printHelp() {
  process.stdout.write(`Usage:
  node get-course-structure.js --id=COURSE_UUID [options]

Options:
  --id=UUID         Course ID within a course group (required)
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
  if (!id) throw new Error("--id=COURSE_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `courses/${id}/structure`, token, undefined, {
    actionName: "get-course-structure",
    skillName: "get-course-structure",
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
