/**
 * Credentials + identity cache for ti-admin-v3.
 * Persists to ~/.ti-admin-v3/config.json on first skill usage.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const CONFIG_DIR = join(homedir(), ".ti-admin-v3");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

/** @typedef {{ base_url: string, api_key: string, client_id: string, instance_id: string, user_id?: string }} CachedConfig */

/**
 * @returns {Promise<CachedConfig | null>}
 */
export async function loadCachedConfig() {
  try {
    const text = await readFile(CONFIG_FILE, "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * @param {CachedConfig} config
 */
export async function saveCachedConfig(config) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
}

/**
 * Extract hostname from a TI base URL.
 * @param {string} baseUrl
 * @returns {string}
 */
export function extractInstanceId(baseUrl) {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return baseUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

/**
 * Resolve credentials with cache fallback and persist on first use.
 * Priority: explicit args > env vars > cached config > error.
 * @param {{ baseUrl?: string | null, apiKey?: string | null, apiKeyFile?: string | null }} opts
 * @returns {Promise<{ apiRoot: string, token: string, clientId: string, instanceId: string }>}
 */
export async function resolveCredentials(opts = {}) {
  const cached = await loadCachedConfig();

  const baseUrl = resolveValue(
    opts.baseUrl,
    [process.env.TI_INCOMING_BASE_URL, process.env.TI_BASE_URL],
    cached?.base_url,
    "Missing base URL: pass --base-url=, set TI_BASE_URL, or run once to cache.",
  );

  let token = opts.apiKey?.trim() || "";
  if (!token) {
    token = (process.env.TI_API_KEY ?? process.env.THOUGHT_INDUSTRIES_API_KEY ?? "").trim();
  }
  if (!token && opts.apiKeyFile) {
    token = (await readFile(opts.apiKeyFile, "utf8")).trim();
  }
  if (!token && cached?.api_key) {
    token = cached.api_key;
  }
  if (!token) {
    throw new Error(
      "Missing API key: set TI_API_KEY, use --api-key=, or run once to cache.",
    );
  }

  const instanceId = extractInstanceId(baseUrl);
  const clientId = cached?.client_id || randomUUID();
  const userId = (process.env.TI_USER_ID ?? process.env.TI_USER_EMAIL ?? "").trim()
    || cached?.user_id
    || "";

  if (
    !cached ||
    cached.base_url !== baseUrl ||
    cached.api_key !== token ||
    !cached.client_id ||
    (userId && cached.user_id !== userId)
  ) {
    await saveCachedConfig({
      base_url: baseUrl,
      api_key: token,
      client_id: clientId,
      instance_id: instanceId,
      user_id: userId || undefined,
    });
  }

  const apiRoot = toApiRoot(baseUrl);
  return { apiRoot, token, clientId, instanceId, userId };
}

/**
 * @param {string | null | undefined} explicit
 * @param {(string | undefined)[]} envVars
 * @param {string | undefined} cachedValue
 * @param {string} errorMsg
 * @returns {string}
 */
function resolveValue(explicit, envVars, cachedValue, errorMsg) {
  const fromFlag = explicit?.trim() ?? "";
  if (fromFlag) return fromFlag;
  for (const env of envVars) {
    const v = env?.trim() ?? "";
    if (v) return v;
  }
  if (cachedValue?.trim()) return cachedValue.trim();
  throw new Error(errorMsg);
}

/**
 * @param {string} base
 * @returns {string}
 */
function toApiRoot(base) {
  const trimmed = base.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Base URL must be absolute (https://...), got: ${base}`);
  }
  if (/\/incoming\/v2$/i.test(trimmed)) return trimmed;
  return `${trimmed}/incoming/v2`;
}
