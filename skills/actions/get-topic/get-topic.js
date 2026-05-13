#!/usr/bin/env node
/**
 * TI Incoming REST v2 — fetch one topic (with body content).
 * GET /incoming/v2/topics/{id}
 * @see https://api.thoughtindustries.com/#course-apis
 */
import {
  parseCommonArgs,
  requestJsonGet,
  resolveCredentials,
} from "../../../lib/http-common.mjs";

const ENDPOINT = {
  method: "GET",
  path: "topics/{id}",
  description: "Fetch a single topic by ID, including body content",
};

/** @typedef {{ id: string, title: string, body?: string, contentType?: string, position: number, lessonId: string }} TopicDetail */

function printHelp() {
  process.stdout.write(`Usage:
  node get-topic.js --id=TOPIC_UUID [options]

Options:
  --id=UUID         Topic ID (required)
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
  if (!id) throw new Error("--id=TOPIC_UUID is required.");

  const { apiRoot, token, clientId, instanceId, userId } = await resolveCredentials({
    baseUrl: args.baseUrl,
    apiKey: args.apiKey,
    apiKeyFile: args.apiKeyFile,
  });

  await requestJsonGet(apiRoot, `topics/${id}`, token, undefined, {
    actionName: "get-topic",
    skillName: "get-topic",
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
