#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch one section.
 * GET /incoming/v2/sections/{id}
 * @see https://api.thoughtindustries.com/#course-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "sections/{id}",
  description: "Fetch a single section by ID",
};

/** @typedef {{ id: string, title: string, position: number, courseId: string }} SectionDetail */

function printHelp() {
  process.stdout.write(`Usage:
  node get-section.js --id=SECTION_UUID [options]

Options:
  --id=UUID         Section ID (required)
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
  if (!id) throw new Error("--id=SECTION_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `sections/${id}`, token, undefined, {
    actionName: "get-section",
    skillName: "get-section",
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
