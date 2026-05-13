#!/usr/bin/env node
/**
 * TI Incoming REST v2 — create course(s) as draft.
 * POST /incoming/v2/content/course/create
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
  method: "POST",
  path: "content/course/create",
  description: "Create one or more courses as draft",
};

const LIMITS = {
  maxCoursesPerRequest: 100,
  maxChildEntitiesPerCourse: 25,
};

/**
 * @typedef {{
 *   title: string,
 *   kind: "courseGroup" | "microCourse" | "article" | "scorm" | "xapi",
 *   description?: string,
 *   slug?: string,
 *   sections?: SectionInput[],
 *   articleVariant?: string,
 *   scormUrl?: string,
 * }} CourseInput
 *
 * @typedef {{ title: string, lessons?: LessonInput[] }} SectionInput
 * @typedef {{ title: string, openType?: string, topics?: TopicInput[] }} LessonInput
 * @typedef {{ title: string, body?: string, contentType?: string }} TopicInput
 *
 * @typedef {{
 *   courseIds?: string[],
 *   backgroundJob?: { id: string, status: string },
 * }} CreateCourseResponse
 */

/** @typedef {Record<string, unknown>} JsonObject */

/**
 * Normalize input into { courseAttributes: [...] } and validate limits.
 * @param {unknown} raw
 * @returns {{ courseAttributes: JsonObject[] }}
 */
function normalizeCreateBody(raw) {
  if (raw == null || typeof raw !== "object") {
    throw new Error("Body must be a JSON object or array.");
  }

  /** @type {JsonObject[]} */
  let courses;

  if (Array.isArray(raw)) {
    courses = raw;
  } else {
    const obj = /** @type {JsonObject} */ (raw);
    if ("courseAttributes" in obj) {
      const ca = obj.courseAttributes;
      if (!Array.isArray(ca)) {
        throw new Error('"courseAttributes" must be an array of course objects.');
      }
      courses = ca;
    } else if (typeof obj.title === "string" && typeof obj.kind === "string") {
      courses = [obj];
    } else {
      throw new Error(
        'Expected { courseAttributes: [...] }, a course object with "title" + "kind", or an array of course objects.',
      );
    }
  }

  if (courses.length > LIMITS.maxCoursesPerRequest) {
    throw new Error(
      `Too many courses: ${courses.length} exceeds limit of ${LIMITS.maxCoursesPerRequest} per request.`,
    );
  }

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    if (typeof c.title !== "string" || !c.title.trim()) {
      throw new Error(`Course at index ${i} is missing a "title".`);
    }
    if (typeof c.kind !== "string" || !c.kind.trim()) {
      throw new Error(`Course at index ${i} is missing a "kind".`);
    }
    const childCount = countChildren(c);
    if (childCount > LIMITS.maxChildEntitiesPerCourse) {
      throw new Error(
        `Course "${c.title}" has ${childCount} child entities (sections+lessons+topics), exceeding limit of ${LIMITS.maxChildEntitiesPerCourse}. Split into smaller batches.`,
      );
    }
  }

  return { courseAttributes: courses };
}

/**
 * Count total sections + lessons + topics in a course object.
 * @param {JsonObject} course
 * @returns {number}
 */
function countChildren(course) {
  let count = 0;
  const sections = /** @type {JsonObject[] | undefined} */ (course.sections);
  if (!Array.isArray(sections)) return count;
  count += sections.length;
  for (const sec of sections) {
    const lessons = /** @type {JsonObject[] | undefined} */ (sec.lessons);
    if (!Array.isArray(lessons)) continue;
    count += lessons.length;
    for (const les of lessons) {
      const topics = /** @type {JsonObject[] | undefined} */ (les.topics);
      if (Array.isArray(topics)) count += topics.length;
    }
  }
  return count;
}

function printHelp() {
  process.stdout.write(`Usage:
  node create-course-draft.js [--file=PATH | --json='...' | -] [options]

Creates courses as DRAFT. Never auto-publishes.

Limits:
  Max ${LIMITS.maxCoursesPerRequest} courses per request.
  Max ${LIMITS.maxChildEntitiesPerCourse} child entities (sections+lessons+topics) per course.

Normalization:
  • { "courseAttributes": [ ... ] } — passed through
  • Single course { "title", "kind", ... } — wrapped as one element
  • Array of courses — becomes courseAttributes

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

  const body = normalizeCreateBody(parsed);

  if (args.dryRun) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
    return;
  }

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJson("POST", apiRoot, ENDPOINT.path, token, body, {
    actionName: "create-course-draft",
    skillName: "create-course-draft",
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
