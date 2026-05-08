/**
 * n8n webhook integration (browser → n8n Production/Test URL).
 *
 * Set in .env or Vercel:
 *   VITE_N8N_WEBHOOK_STATUS_URL       — HR status changes except Shortlisted (or catch‑all if no shortlist URL)
 *   VITE_N8N_WEBHOOK_SHORTLIST_URL    — optional; when set, status Shortlisted POSTs here instead of STATUS_URL
 *   VITE_N8N_WEBHOOK_APPLICATION_URL  — new applications (candidate apply); falls back to VITE_N8N_WEBHOOK_URL
 *   VITE_N8N_WEBHOOK_URL              — single webhook if everything routes in one n8n workflow + Switch on `event`
 *
 * Your n8n instance must allow CORS from your frontend origin, or call webhooks from the backend instead.
 */

function trimEnv(name) {
  const v = import.meta.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export function getN8nWebhookStatusUrl() {
  return (
    trimEnv("VITE_N8N_WEBHOOK_STATUS_URL") || trimEnv("VITE_N8N_WEBHOOK_URL")
  );
}

export function getN8nWebhookApplicationUrl() {
  return (
    trimEnv("VITE_N8N_WEBHOOK_APPLICATION_URL") ||
    trimEnv("VITE_N8N_WEBHOOK_URL")
  );
}

/** Dedicated Shortlisted workflow; when set, shortlisted POSTs here. */
export function getN8nWebhookShortlistUrl() {
  return trimEnv("VITE_N8N_WEBHOOK_SHORTLIST_URL");
}

function resolveStatusWebhookUrl(status) {
  const st = String(status || "").toLowerCase();
  if (st === "shortlisted") {
    return getN8nWebhookShortlistUrl() || getN8nWebhookStatusUrl();
  }
  return getN8nWebhookStatusUrl();
}

export function n8nWebhooksConfigured() {
  return Boolean(
    getN8nWebhookStatusUrl() ||
      getN8nWebhookApplicationUrl() ||
      getN8nWebhookShortlistUrl(),
  );
}

const TOGGLE_KEY = "hr_n8n_workflow_toggle";

export function isWorkflowEnabled(workflowId) {
  try {
    const raw = localStorage.getItem(TOGGLE_KEY);
    const o = raw ? JSON.parse(raw) : {};
    if (Object.prototype.hasOwnProperty.call(o, workflowId))
      return Boolean(o[workflowId]);
    return true;
  } catch {
    return true;
  }
}

export function setWorkflowEnabled(workflowId, enabled) {
  try {
    const raw = localStorage.getItem(TOGGLE_KEY);
    const o = raw ? JSON.parse(raw) : {};
    o[workflowId] = enabled;
    localStorage.setItem(TOGGLE_KEY, JSON.stringify(o));
  } catch (_) {}
}

/**
 * POST JSON to n8n webhook. On HTTP success we only drain the body — never parse JSON.
 * n8n often returns 204/no body or non-JSON; parsing caused "Unexpected end of JSON input".
 */
async function postWebhook(url, body) {
  let payload;
  try {
    payload = JSON.stringify(body);
  } catch (e) {
    throw new Error(
      `n8n payload: ${e?.message || "could not serialize body"}`,
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: payload,
  });

  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch (_) {
      /* ignore */
    }
    throw new Error(
      (text || "").trim().slice(0, 200) || `Webhook HTTP ${res.status}`,
    );
  }

  try {
    await res.arrayBuffer();
  } catch (_) {
    /* response already accepted; automation side effects ran */
  }
}

/** Last-resort: some browsers/plugins surface empty-body quirks as SyntaxError. */
async function sendN8nWebhook(url, body) {
  try {
    await postWebhook(url, body);
  } catch (err) {
    const msg = String(err?.message || err || "");
    if (
      err instanceof SyntaxError ||
      /unexpected end of json|json input|json\.parse|failed to parse json/i.test(
        msg,
      )
    ) {
      console.warn("n8n webhook: treating body/parse issue as ok", err);
      return;
    }
    throw err;
  }
}

/**
 * HR changed candidate pipeline status — drives Gmail templates in n8n (Switch on `status`).
 */
export async function notifyCandidateStatusChanged(detail) {
  const st = String(detail.status || "").toLowerCase();
  const shouldSend =
    isWorkflowEnabled("auto3") ||
    (isWorkflowEnabled("auto2") && st === "shortlisted");
  if (!shouldSend)
    return { ok: false, skipped: true, reason: "workflow_disabled" };

  const url = resolveStatusWebhookUrl(st);
  if (!url) return { ok: false, skipped: true, reason: "no_webhook_url" };

  const body = {
    event: "candidate_status_changed",
    source: "smarthire_hr_portal",
    timestamp: new Date().toISOString(),
    ...detail,
  };
  await sendN8nWebhook(url, body);
  return { ok: true };
}

/**
 * Candidate submitted an application — confirmation / routing in n8n.
 */
export async function notifyApplicationSubmitted(detail) {
  const url = getN8nWebhookApplicationUrl();
  if (!url) return { ok: false, skipped: true, reason: "no_webhook_url" };
  if (!isWorkflowEnabled("auto1"))
    return { ok: false, skipped: true, reason: "workflow_disabled" };

  const body = {
    event: "application_submitted",
    source: "smarthire_candidate_portal",
    timestamp: new Date().toISOString(),
    ...detail,
  };
  await sendN8nWebhook(url, body);
  return { ok: true };
}

/**
 * HR Automations page — sends a safe test payload. Uses the same URLs as production.
 */
export async function notifyN8nTest(workflowId, extra = {}) {
  let url;
  if (workflowId === "auto1") {
    url = getN8nWebhookApplicationUrl();
  } else if (workflowId === "auto2") {
    url = getN8nWebhookShortlistUrl() || getN8nWebhookStatusUrl();
  } else {
    url = getN8nWebhookStatusUrl();
  }
  if (!url) {
    throw new Error(
      "Missing webhook URL. Set VITE_N8N_WEBHOOK_APPLICATION_URL, VITE_N8N_WEBHOOK_STATUS_URL, and optionally VITE_N8N_WEBHOOK_SHORTLIST_URL (or VITE_N8N_WEBHOOK_URL) in Vercel and redeploy.",
    );
  }

  const status =
    workflowId === "auto2"
      ? "shortlisted"
      : workflowId === "auto1"
        ? "new"
        : "reviewing";

  const body = {
    event:
      workflowId === "auto1"
        ? "application_submitted"
        : "candidate_status_changed",
    test: true,
    workflowId,
    source: "smarthire_automations_test",
    timestamp: new Date().toISOString(),
    candidateName: extra.candidateName || "SmartHire Test Candidate",
    candidateEmail: extra.candidateEmail || "test-candidate@example.com",
    candidatePhone: extra.candidatePhone || "",
    postId: extra.postId || "test-post-id",
    jobTitle: extra.jobTitle || "Test Role",
    applicationId: extra.applicationId || "test-application-id",
    status,
    statusLabel: extra.statusLabel || status,
    hrPortalApplicantId: extra.hrPortalApplicantId || "test--applicant",
    ...extra,
  };

  await sendN8nWebhook(url, body);
  return { ok: true };
}
