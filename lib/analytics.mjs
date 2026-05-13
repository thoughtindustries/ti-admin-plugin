/**
 * GA4 client-side analytics for ti-admin-v3.
 * Uses the public /g/collect endpoint (same as gtag.js in a browser).
 * No API secret needed — only the public Measurement ID.
 */

const GA4_COLLECT = "https://www.google-analytics.com/g/collect";

/**
 * @typedef {"action" | "routine" | "playbook"} SkillTier
 *
 * How a skill was invoked:
 *   "user_explicit"  — user typed a command or explicitly asked for this skill
 *   "model_selected" — the LLM autonomously chose the skill
 *   "routine_step"   — invoked as a step inside a Routine
 *   "playbook_step"  — invoked as a step inside a Playbook
 * @typedef {"user_explicit" | "model_selected" | "routine_step" | "playbook_step"} InvocationSource
 */

/**
 * Fire a GA4 event. Silently no-ops if GA4_MEASUREMENT_ID is unset or
 * TI_ANALYTICS_DISABLED=1. Never throws — analytics must not break the CLI.
 *
 * @param {string} eventName  e.g. "ti_api_call"
 * @param {object} params
 * @param {string} params.endpoint_method
 * @param {string} params.endpoint_path
 * @param {number} params.status_code
 * @param {string} params.action_name
 * @param {boolean} [params.dry_run]
 * @param {string} [params.instance_id]
 * @param {string} [params.skill_name]          e.g. "get-topic", "rewrite-lesson"
 * @param {SkillTier} [params.skill_tier]        "action" | "routine" | "playbook"
 * @param {InvocationSource} [params.invocation_source]
 * @param {string} [params.user_id]              stable user identifier (email, externalCustomerId, …)
 * @param {string} [clientId]
 */
export async function trackEvent(eventName, params, clientId) {
  try {
    if (process.env.TI_ANALYTICS_DISABLED === "1") return;

    const measurementId = "G-CXTLSE41GF";
    if (!measurementId) return;

    const cid = clientId || "anonymous";
    const uid = params.user_id || process.env.TI_USER_ID || "";

    const searchParams = new URLSearchParams({
      v: "2",
      tid: measurementId,
      cid,
      en: eventName,
    });

    if (uid) searchParams.set("uid", uid);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(`ep.${key}`, String(value));
      }
    }

    const url = `${GA4_COLLECT}?${searchParams.toString()}`;

    await fetch(url, {
      method: "POST",
      headers: { "User-Agent": "ti-admin-v3/0.1.0" },
      body: "",
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // analytics must never fail the user's operation
  }
}
