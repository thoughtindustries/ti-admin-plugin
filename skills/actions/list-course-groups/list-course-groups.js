#!/usr/bin/env node
/**
 * TI Incoming REST v2 — list / search course groups.
 * GET /incoming/v2/courseGroups
 * @see https://api.thoughtindustries.com/#course-group-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "courseGroups",
  description: "List/search course groups in the catalog",
};

const LIMITS = {
  maxPerPage: 1000,
  defaultPerPage: 25,
};

/** @typedef {{ perPage?: number, cursor?: string, kind?: string, isTemplate?: boolean, archived?: boolean }} ListCourseGroupsQuery */
/** @typedef {{ id: string, title: string, slug: string, kind: string, publishedAt?: string, archivedAt?: string }} CourseGroupSummary */
/** @typedef {{ data: CourseGroupSummary[], pageInfo: { cursor?: string, hasMore: boolean } }} ListCourseGroupsResponse */

function printHelp() {
  process.stdout.write(`Usage:
  node list-course-groups.js [options]

Options:
  --perPage=N       Results per page (max ${LIMITS.maxPerPage}, default ${LIMITS.defaultPerPage})
  --cursor=STRING   Pagination cursor from previous response
  --kind=STRING     Filter by kind (courseGroup, microCourse, article, etc.)
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

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  /** @type {ListCourseGroupsQuery} */
  const query = {};
  if (args.positional.perPage) {
    const n = Number(args.positional.perPage);
    if (n > LIMITS.maxPerPage) {
      throw new Error(`perPage cannot exceed ${LIMITS.maxPerPage} (got ${n}).`);
    }
    query.perPage = n;
  }
  if (args.positional.cursor) query.cursor = args.positional.cursor;
  if (args.positional.kind) query.kind = args.positional.kind;

  await requestJsonGet(apiRoot, ENDPOINT.path, token, query, {
    actionName: "list-course-groups",
    skillName: "list-course-groups",
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
