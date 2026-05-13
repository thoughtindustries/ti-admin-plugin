#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch one lesson.
 * GET /incoming/v2/lessons/{id}
 * @see https://api.thoughtindustries.com/#course-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "lessons/{id}",
  description: "Fetch a single lesson by ID",
};

/** @typedef {{ id: string, title: string, position: number, sectionId: string, openType?: string }} LessonDetail */

function printHelp() {
  process.stdout.write(`Usage:
  node get-lesson.js --id=LESSON_UUID [options]

Options:
  --id=UUID         Lesson ID (required)
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
  if (!id) throw new Error("--id=LESSON_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `lessons/${id}`, token, undefined, {
    actionName: "get-lesson",
    skillName: "get-lesson",
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
