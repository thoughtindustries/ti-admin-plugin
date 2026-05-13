#!/usr/bin/env node
/**
 * TI Incoming REST v2 — update course content (partial).
 * PUT /incoming/v2/content/course/update
 * @see https://api.thoughtindustries.com/#course-apis
 *
 * HARD-GATE: This script NEVER calls releaseContent. All content stays as draft.
 */
import {
  parseCommonArgs,
  loadJsonRaw,
  requestJson,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "PUT",
  path: "content/course/update",
  description: "Partial update of course content (topics, lessons, sections) by UUID",
};

/**
 * @typedef {{
 *   courseGroups?: CourseGroupUpdate[],
 *   courses?: CourseUpdate[],
 *   sections?: SectionUpdate[],
 *   lessons?: LessonUpdate[],
 *   topics?: TopicUpdate[],
 * }} UpdateCourseAttributes
 *
 * @typedef {{ id: string, title?: string, description?: string }} CourseGroupUpdate
 * @typedef {{ id: string, title?: string }} CourseUpdate
 * @typedef {{ id: string, title?: string, position?: number }} SectionUpdate
 * @typedef {{ id: string, title?: string, position?: number, openType?: string }} LessonUpdate
 * @typedef {{ id: string, title?: string, body?: string, contentType?: string, position?: number }} TopicUpdate
 */

/** @typedef {Record<string, unknown>} JsonObject */

const UPDATE_ENTITY_KEYS = ["courseGroups", "courses", "sections", "lessons", "topics"];

/**
 * Normalize input into { courseAttributes: { ... } } for the update endpoint.
 * @param {unknown} raw
 * @returns {{ courseAttributes: JsonObject }}
 */
function normalizeUpdateBody(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Body must be a JSON object (not an array). Use create-course-draft for new courses.");
  }
  const obj = /** @type {JsonObject} */ (raw);

  if ("courseAttributes" in obj) {
    const ca = obj.courseAttributes;
    if (ca == null || typeof ca !== "object" || Array.isArray(ca)) {
      throw new Error('"courseAttributes" must be an object (not an array — that is the create shape).');
    }
    return { courseAttributes: /** @type {JsonObject} */ (ca) };
  }

  const hasEntity = UPDATE_ENTITY_KEYS.some((k) => k in obj && Array.isArray(obj[k]));
  if (!hasEntity) {
    throw new Error(
      `Expected "courseAttributes" object or at least one of: ${UPDATE_ENTITY_KEYS.join(", ")}.`,
    );
  }

  /** @type {JsonObject} */
  const inner = {};
  for (const k of UPDATE_ENTITY_KEYS) {
    if (k in obj) {
      const arr = obj[k];
      if (!Array.isArray(arr)) {
        throw new Error(`"${k}" must be an array.`);
      }
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (typeof item !== "object" || item == null || !("id" in item)) {
          throw new Error(`${k}[${i}] must have an "id" field for updates.`);
        }
      }
      inner[k] = arr;
    }
  }
  return { courseAttributes: inner };
}

function printHelp() {
  process.stdout.write(`Usage:
  node update-course-content.js [--file=PATH | --json='...' | -] [options]

Updates existing course content as DRAFT. Never auto-publishes.

Normalization:
  • { "courseAttributes": { "topics": [...], ... } } — passed through
  • Shorthand with any of: courseGroups, courses, sections, lessons, topics arrays

Options:
  --dry-run         Validate and print normalized JSON; no API call
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

  const rawText = await loadJsonRaw(args.file, args.json);
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Invalid JSON: ${/** @type {Error} */ (e).message}`);
  }

  const body = normalizeUpdateBody(parsed);

  if (args.dryRun) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
    return;
  }

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJson("PUT", apiRoot, ENDPOINT.path, token, body, {
    actionName: "update-course-content",
    skillName: "update-course-content",
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
