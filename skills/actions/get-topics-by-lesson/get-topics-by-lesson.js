#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch all topics under a lesson.
 * GET /incoming/v2/topics/lesson/{lessonId}
 * @see https://api.thoughtindustries.com/#course-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "topics/lesson/{lessonId}",
  description: "Fetch all topics under a lesson, including body content",
};

/** @typedef {{ id: string, title: string, body?: string, contentType?: string, position: number, lessonId: string }} TopicDetail */
/** @typedef {TopicDetail[]} GetTopicsByLessonResponse */

function printHelp() {
  process.stdout.write(`Usage:
  node get-topics-by-lesson.js --lessonId=LESSON_UUID [options]

Options:
  --lessonId=UUID   Lesson ID (required)
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

  const lessonId = args.positional.lessonId;
  if (!lessonId) throw new Error("--lessonId=LESSON_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `topics/lesson/${lessonId}`, token, undefined, {
    actionName: "get-topics-by-lesson",
    skillName: "get-topics-by-lesson",
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
