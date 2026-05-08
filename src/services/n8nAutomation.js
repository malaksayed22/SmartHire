/**
 * n8n webhook integration (browser → n8n Production/Test URL).
 *
 * Set in .env or Vercel:
 *   VITE_N8N_WEBHOOK_STATUS_URL      — status changes (HR portal) + optional catch‑all
 *   VITE_N8N_WEBHOOK_APPLICATION_URL — new applications (candidate apply); falls back to VITE_N8N_WEBHOOK_URL
 *   VITE_N8N_WEBHOOK_URL             — single webhook if both flows use one n8n workflow + Switch on `event`
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

export function n8nWebhooksConfigured() {
  return Boolean(getN8nWebhookStatusUrl() || getN8nWebhookApplicationUrl());
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

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text?.slice(0, 200) || `Webhook HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return {};
}

/**
 * HR changed candidate pipeline status — drives Gmail templates in n8n (Switch on `status`).
 */
export async function notifyCandidateStatusChanged(detail) {
  const url = getN8nWebhookStatusUrl();
  if (!url) return { ok: false, skipped: true, reason: "no_webhook_url" };

  const st = String(detail.status || "").toLowerCase();
  const shouldSend =
    isWorkflowEnabled("auto3") ||
    (isWorkflowEnabled("auto2") && st === "shortlisted");
  if (!shouldSend)
    return { ok: false, skipped: true, reason: "workflow_disabled" };

  const body = {
    event: "candidate_status_changed",
    source: "smarthire_hr_portal",
    timestamp: new Date().toISOString(),
    ...detail,
  };
  await postJson(url, body);
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
  await postJson(url, body);
  return { ok: true };
}

/**
 * HR Automations page — sends a safe test payload. Uses the same URLs as production.
 */
export async function notifyN8nTest(workflowId, extra = {}) {
  const url =
    workflowId === "auto1"
      ? getN8nWebhookApplicationUrl()
      : getN8nWebhookStatusUrl();
  if (!url) {
    throw new Error(
      "Missing webhook URL. Set VITE_N8N_WEBHOOK_APPLICATION_URL / VITE_N8N_WEBHOOK_STATUS_URL (or VITE_N8N_WEBHOOK_URL) in .env and redeploy.",
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

  await postJson(url, body);
  return { ok: true };
}
