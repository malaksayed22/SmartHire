// src/services/api.js — Main SmartHire backend (proxied via Vite → http://localhost:3000)

// Use /api prefix — Vite dev server proxies /api/* → localhost:3000/*
// In production build, set VITE_API_BASE_URL to the real backend URL
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim() || "/api";

// All requests include cookies for session auth
const opts = (method, body) => ({ method, credentials: "include", body });

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Wraps fetch and converts network errors into readable messages */
async function apiFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (err) {
    // TypeError: Failed to fetch = server is down / unreachable
    if (err instanceof TypeError) {
      throw new Error(
        "Cannot reach the server. Please check your connection and try again.",
      );
    }
    throw err;
  }
}

async function extractError(res) {
  try {
    const data = await res.json();
    return (
      data.message ||
      data.detail ||
      data.error ||
      `Request failed (${res.status})`
    );
  } catch {
    return `Request failed (${res.status})`;
  }
}

/** Normalize API job shape → UI-compatible shape */
export function normalizeJob(j) {
  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const salaryStr =
    j.salary_min != null && j.salary_max != null
      ? `${j.salary_currency || "$"}${Number(j.salary_min).toLocaleString()} – ${j.salary_currency || "$"}${Number(j.salary_max).toLocaleString()}/${j.salary_period || "mo"}`
      : j.salary || "Competitive";

  const toArray = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

  return {
    id: j._id || j.id,
    _id: j._id || j.id,
    title: j.title,
    department: j.department || capitalize(j.work_mode) || "General",
    location: capitalize(j.work_mode) || "On-site",
    type: j.employment_type
      ? j.employment_type.split("-").map(capitalize).join("-")
      : j.type || "Full-time",
    salary: salaryStr,
    posted: j.created_at
      ? j.created_at.split("T")[0]
      : j.posted || new Date().toISOString().split("T")[0],
    applicants: j.applications_count || j.applicants || 0,
    status:
      j.is_active != null
        ? j.is_active
          ? "active"
          : "closed"
        : j.status || "active",
    description: j.description || "",
    responsibilities: toArray(j.responsibilities),
    requirements: toArray(j.requirements),
    nice: toArray(j.nice),
    skills: toArray(j.skills),
    color: j.color || "blue",
  };
}

// ── HR Auth ───────────────────────────────────────────────────────────────────

export async function hrRegister(name, email, phone, password) {
  const form = new FormData();
  form.append("name", name);
  form.append("email", email);
  form.append("phone", phone);
  form.append("password", password);
  form.append("is_confirmed", "true");
  const res = await apiFetch(`${BASE_URL}/hr/registration`, opts("POST", form));
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function hrLogin(email, password) {
  const res = await apiFetch(`${BASE_URL}/hr/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function hrLogout() {
  await apiFetch(`${BASE_URL}/hr/logout`, opts("POST"));
}

// ── Candidate Auth ────────────────────────────────────────────────────────────

export async function candidateRegister(name, email, phone, password) {
  const form = new FormData();
  form.append("name", name);
  form.append("email", email);
  form.append("phone", phone);
  form.append("password", password);
  form.append("is_confirmed", "true");
  const res = await apiFetch(
    `${BASE_URL}/candidate/registration`,
    opts("POST", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function candidateLogin(email, password) {
  const res = await apiFetch(`${BASE_URL}/candidate/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function candidateLogout() {
  await apiFetch(`${BASE_URL}/candidate/logout`, opts("POST"));
}

// ── Jobs (public/candidate) ───────────────────────────────────────────────────

export async function getActiveJobs() {
  const res = await apiFetch(`${BASE_URL}/candidate/get-posts`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  const data = await res.json();
  return Array.isArray(data)
    ? data
    : data.posts || data.data || data.jobs || [];
}

// ── Jobs (HR) ─────────────────────────────────────────────────────────────────

export async function getHRJobs() {
  const res = await apiFetch(`${BASE_URL}/hr/get-posts`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch HR jobs");
  const data = await res.json();
  return Array.isArray(data)
    ? data
    : data.posts || data.data || data.jobs || [];
}

export async function addJobPost(data) {
  const form = new FormData();
  form.append("title", data.title);
  form.append("description", data.description || "");
  form.append("requirements", data.requirements || "");
  form.append("skills", data.skills || "");
  form.append("salary_min", String(data.salary_min || 0));
  form.append("salary_max", String(data.salary_max || 0));
  form.append("salary_currency", data.salary_currency || "USD");
  form.append("salary_period", data.salary_period || "monthly");
  form.append("employment_type", data.employment_type || "full-time");
  form.append("work_mode", data.work_mode || "on-site");
  form.append("expire_at", data.expire_at || "31-12-2026");
  form.append("is_active", "true");
  const res = await apiFetch(`${BASE_URL}/hr/add-post`, opts("POST", form));
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function updateJobPost(data) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, String(v)));
  const res = await apiFetch(`${BASE_URL}/hr/update-post`, opts("PUT", form));
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function deleteJobPost(id) {
  const form = new FormData();
  form.append("_id", id);
  const res = await apiFetch(
    `${BASE_URL}/hr/delete-post`,
    opts("DELETE", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function rankCandidatesByPost(postId) {
  const res = await apiFetch(
    `${BASE_URL}/hr/rank-candidates?post_id=${encodeURIComponent(postId)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// ── Applications ──────────────────────────────────────────────────────────────

export async function submitApplication(postId, file) {
  const form = new FormData();
  form.append("post_id", postId);
  form.append("file", file);
  const res = await apiFetch(
    `${BASE_URL}/candidate/submit-application`,
    opts("POST", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function scoreResumeByJob(jobId, file) {
  const form = new FormData();
  form.append("job_id", jobId);
  form.append("file", file);
  const res = await apiFetch(
    `${BASE_URL}/candidate/score-resume`,
    opts("POST", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function chatByJob(jobId, question) {
  const form = new FormData();
  form.append("job_id", jobId);
  form.append("question", question);
  const res = await apiFetch(`${BASE_URL}/candidate/chat`, opts("POST", form));
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// ── Email confirmation ────────────────────────────────────────────────────────

export async function sendConfirmationCode() {
  const res = await apiFetch(
    `${BASE_URL}/user/send-confirmation-code`,
    opts("POST"),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function confirmEmail(code) {
  const form = new FormData();
  form.append("code", code);
  const res = await apiFetch(
    `${BASE_URL}/user/email-confirmation`,
    opts("PUT", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}
