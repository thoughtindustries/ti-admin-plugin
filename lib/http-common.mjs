/**
 * Shared HTTP helpers for ti-admin-v3 skill CLIs (Incoming REST v2).
 */
import { readFile } from "node:fs/promises";
import { resolveCredentials } from "./config.mjs";
import { trackEvent } from "./analytics.mjs";

// ─── Arg parsing ────────────────────────────────────────────────────────────

/**
 * @param {string[]} argv
 */
export function parseCommonArgs(argv) {
  const out = {
    file: /** @type {string | null} */ (null),
    json: /** @type {string | null} */ (null),
    baseUrl: /** @type {string | null} */ (null),
    apiKey: /** @type {string | null} */ (null),
    apiKeyFile: /** @type {string | null} */ (null),
    invocationSource: /** @type {import("./analytics.mjs").InvocationSource | null} */ (null),
    dryRun: false,
    help: false,
    positional: /** @type {Record<string, string>} */ ({}),
  };
  for (const arg of argv.slice(2)) {
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg.startsWith("--file=")) out.file = arg.slice("--file=".length);
    else if (arg.startsWith("--json=")) out.json = arg.slice("--json=".length);
    else if (arg.startsWith("--base-url=")) out.baseUrl = arg.slice("--base-url=".length);
    else if (arg.startsWith("--api-key=")) out.apiKey = arg.slice("--api-key=".length);
    else if (arg.startsWith("--api-key-file=")) out.apiKeyFile = arg.slice("--api-key-file=".length);
    else if (arg.startsWith("--invocation-source=")) out.invocationSource = /** @type {import("./analytics.mjs").InvocationSource} */ (arg.slice("--invocation-source=".length));
    else if (arg.startsWith("--") && arg.includes("=")) {
      const eq = arg.indexOf("=");
      out.positional[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else if (!arg.startsWith("-") && out.file == null) out.file = arg;
  }
  return out;
}

// ─── Stdin / file loading ───────────────────────────────────────────────────

export function readStdinUtf8() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    process.stdin.on("error", reject);
  });
}

/**
 * @param {string | null} path
 * @param {string | null} inlineJson
 */
export async function loadJsonRaw(path, inlineJson) {
  if (inlineJson != null) return inlineJson;
  if (path === "-") return readStdinUtf8();
  if (path == null) {
    if (process.stdin.isTTY) {
      throw new Error("Provide JSON via --file=path.json, --json='{...}', or pipe JSON on stdin.");
    }
    return readStdinUtf8();
  }
  return readFile(path, "utf8");
}

// ─── HTTP requests with analytics ───────────────────────────────────────────

/**
 * @param {"GET"|"POST"|"PUT"|"DELETE"} method
 * @param {string} apiRoot
 * @param {string} path  relative to /incoming/v2
 * @param {string} token
 * @param {unknown} [body]
 * @param {{ actionName?: string, clientId?: string, instanceId?: string, skillName?: string, skillTier?: import("./analytics.mjs").SkillTier, invocationSource?: import("./analytics.mjs").InvocationSource, userId?: string }} [meta]
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function requestJson(method, apiRoot, path, token, body, meta = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiRoot}${p}`;
  /** @type {RequestInit} */
  const init = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
  if (body !== undefined) {
    init.headers = { ...init.headers, "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  trackEvent("ti_api_call", {
    endpoint_method: method,
    endpoint_path: path,
    status_code: res.status,
    action_name: meta.actionName || "",
    instance_id: meta.instanceId || "",
    skill_name: meta.skillName || meta.actionName || "",
    skill_tier: meta.skillTier,
    invocation_source: meta.invocationSource,
    user_id: meta.userId,
  }, meta.clientId).catch(() => {});

  if (!res.ok) {
    const msg = typeof data === "object" && data && "message" in data ? JSON.stringify(data) : text;
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg || "(empty body)"}`);
  }
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  return { ok: res.ok, status: res.status, data };
}

/**
 * GET request with query parameters.
 * @param {string} apiRoot
 * @param {string} path  relative to /incoming/v2
 * @param {string} token
 * @param {Record<string, string|number|boolean|undefined|null>} [query]
 * @param {{ actionName?: string, clientId?: string, instanceId?: string, skillName?: string, skillTier?: import("./analytics.mjs").SkillTier, invocationSource?: import("./analytics.mjs").InvocationSource, userId?: string }} [meta]
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function requestJsonGet(apiRoot, path, token, query, meta = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  let qs = "";
  if (query && typeof query === "object") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      params.set(key, String(value));
    }
    const s = params.toString();
    if (s) qs = `?${s}`;
  }
  const url = `${apiRoot}${p}${qs}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  trackEvent("ti_api_call", {
    endpoint_method: "GET",
    endpoint_path: path,
    status_code: res.status,
    action_name: meta.actionName || "",
    instance_id: meta.instanceId || "",
    skill_name: meta.skillName || meta.actionName || "",
    skill_tier: meta.skillTier,
    invocation_source: meta.invocationSource,
    user_id: meta.userId,
  }, meta.clientId).catch(() => {});

  if (!res.ok) {
    const msg = typeof data === "object" && data && "message" in data ? JSON.stringify(data) : text;
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${msg || "(empty body)"}`);
  }
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  return { ok: res.ok, status: res.status, data };
}

export { resolveCredentials } from "./config.mjs";
