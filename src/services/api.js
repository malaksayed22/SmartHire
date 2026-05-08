// src/services/api.js — Main SmartHire backend (proxied via Vite → http://localhost:3000)

// Dev: Vite proxies /api/* → localhost:3000/* (see vite.config.js).
// Prod: use VITE_API_BASE_URL if set; otherwise call Railway directly (CORS + credentials
// are configured for smart-hire-build.vercel.app). This avoids relying on Vercel /api rewrites.
const trimmedEnv = (import.meta.env.VITE_API_BASE_URL || "").trim();
const BASE_URL =
  trimmedEnv ||
  (import.meta.env.DEV
    ? "/api"
    : "https://intelligent-cv-production.up.railway.app");

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

/** Best-effort applicant count from various backend field names */
function pickApplicantCount(j) {
  if (!j || typeof j !== "object") return 0;
  const tryKeys = [
    "applications_count",
    "application_count",
    "applicationsCount",
    "applicants_count",
    "num_applicants",
    "total_applications",
    "totalApplicants",
    "applicant_count",
    "resume_count",
    "submissions_count",
    "submitted_count",
    "applications",
    "applicants",
  ];
  for (const k of tryKeys) {
    const v = j[k];
    if (v == null || v === "") continue;
    const n = Number(v);
    if (!Number.isNaN(n) && n >= 0) return n;
  }
  const nested =
    j.stats ||
    j.metrics ||
    j.counters ||
    j.meta ||
    j.summary ||
    j.application_stats;
  if (nested && typeof nested === "object") {
    for (const k of tryKeys) {
      const v = nested[k];
      if (v == null || v === "") continue;
      const n = Number(v);
      if (!Number.isNaN(n) && n >= 0) return n;
    }
  }
  return 0;
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
    applicants: pickApplicantCount(j),
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
  const q = encodeURIComponent(String(postId ?? "").trim());
  const res = await apiFetch(
    `${BASE_URL}/hr/rank-candidates?post_id=${q}&job_id=${q}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

/**
 * Persist pipeline status for an application (HR). If the backend has no route,
 * callers should still use setApplicantPipelineMeta for local UX.
 */
export async function updateHRApplicationStatus({
  applicationId,
  postId,
  status,
}) {
  if (!applicationId || !status) {
    throw new Error("applicationId and status are required");
  }
  const form = new FormData();
  form.append("application_id", String(applicationId));
  form.append("_id", String(applicationId));
  if (postId != null && String(postId) !== "") {
    form.append("post_id", String(postId));
  }
  form.append("status", String(status));
  const res = await apiFetch(`${BASE_URL}/hr/update-application-status`, {
    method: "PUT",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

// ── Applications ──────────────────────────────────────────────────────────────

/**
 * @param {string} postId
 * @param {File} file
 * @param {object} [meta] - contact fields many Railway/FastAPI backends expect alongside the file
 */
export async function submitApplication(postId, file, meta = {}) {
  const form = new FormData();
  const pid = String(postId ?? "").trim();
  form.append("post_id", pid);
  form.append("job_id", pid);
  form.append("file", file);
  const m = meta && typeof meta === "object" ? meta : {};
  const name = String(m.name ?? "").trim();
  const email = String(m.email ?? "").trim();
  const phone = String(m.phone ?? "").trim();
  const linkedin = String(m.linkedin ?? "").trim();
  const cover = String(m.coverLetter ?? m.cover ?? "").trim();

  if (name) {
    form.append("name", name);
    form.append("full_name", name);
    form.append("candidate_name", name);
  }
  if (email) {
    form.append("email", email);
    form.append("candidate_email", email);
  }
  if (phone) {
    form.append("phone", phone);
    form.append("phone_number", phone);
  }
  if (linkedin) {
    form.append("linkedin", linkedin);
    form.append("linkedin_url", linkedin);
  }
  if (cover) {
    form.append("cover_letter", cover);
  }

  const res = await apiFetch(
    `${BASE_URL}/candidate/submit-application`,
    opts("POST", form),
  );
  if (!res.ok) throw new Error(await extractError(res));
  return res.json();
}

export async function getCandidateApplications() {
  const res = await apiFetch(`${BASE_URL}/candidate/my-applications`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await extractError(res));
  const data = await res.json();
  return Array.isArray(data)
    ? data
    : data.applications || data.data || data.results || data.items || [];
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
