/**
 * HR pipeline: jobs + ranked applicants from getHRJobs + rankCandidatesByPost.
 */
import { getHRJobs, normalizeJob, rankCandidatesByPost } from "./api";

const RANK_FETCH_CONCURRENCY = 8;

export function parseRankList(data) {
  if (Array.isArray(data)) return data;
  return (
    data?.ranked ||
    data?.candidates ||
    data?.ranked_candidates ||
    data?.candidates_ranked ||
    data?.applications ||
    data?.applicants ||
    data?.data ||
    data?.results ||
    data?.items ||
    data?.list ||
    []
  );
}

/** Normalize post/job id for comparisons (strings, trimming, Mongo extended JSON) */
export function canonicalPostId(v) {
  if (v == null || v === "") return "";
  if (typeof v === "object" && v !== null && "$oid" in v) {
    return String(v.$oid).trim();
  }
  return String(v).trim();
}

export function normalizeStatus(raw) {
  if (raw == null || raw === "") return "new";
  const s = String(raw).toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (s.includes("shortlist")) return "shortlisted";
  if (
    s.includes("hired") ||
    s.includes("onboard") ||
    (s.includes("offer") && s.includes("accept"))
  )
    return "hired";
  if (
    s.includes("reject") ||
    s.includes("declin") ||
    s.includes("not_selected") ||
    s.includes("unsuccessful") ||
    s.includes("withdraw")
  )
    return "rejected";
  if (
    s.includes("interview") ||
    s.includes("recruiter_call") ||
    (s.includes("phone") && s.includes("interview")) ||
    s.includes("onsite")
  )
    return "interview";
  if (
    s.includes("review") ||
    s.includes("screening") ||
    s.includes("screened") ||
    s.includes("in_progress") ||
    s.includes("consideration") ||
    s.includes("asses") ||
    s.includes("evaluat")
  )
    return "reviewing";
  if (
    s.includes("new") ||
    s.includes("apply") ||
    s.includes("applied") ||
    s.includes("submit") ||
    s.includes("received") ||
    s.includes("pending") ||
    s.includes("upload") ||
    s === "open"
  )
    return "new";
  return "new";
}

/** localStorage: HR-edited pipeline status & notes keyed by list row id (see normalizeRankRow `id`). */
export const HR_APPLICANT_PIPELINE_META_KEY = "hr_applicant_pipeline_meta_v1";

export function getApplicantPipelineMetaMap() {
  try {
    const raw = localStorage.getItem(HR_APPLICANT_PIPELINE_META_KEY);
    const o = raw ? JSON.parse(raw) : {};
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function setApplicantPipelineMeta(applicantListId, patch) {
  if (!applicantListId) return;
  const m = getApplicantPipelineMetaMap();
  const prev = m[applicantListId] || {};
  m[applicantListId] = { ...prev, ...patch, updatedAt: Date.now() };
  try {
    localStorage.setItem(HR_APPLICANT_PIPELINE_META_KEY, JSON.stringify(m));
  } catch (_) {}
}

export function applyApplicantPipelineMeta(applicants) {
  if (!Array.isArray(applicants) || applicants.length === 0) return applicants;
  const m = getApplicantPipelineMetaMap();
  if (!Object.keys(m).length) return applicants;
  return applicants.map((a) => {
    const meta = m[a.id];
    if (!meta) return a;
    const next = { ...a };
    if (meta.status != null && meta.status !== "")
      next.status = normalizeStatus(meta.status);
    if (meta.notes != null) next.notes = String(meta.notes);
    return next;
  });
}

/** Id to send to HR update-status API (Mongo application id when available). */
export function pickApplicationRecordId(source) {
  if (!source) return null;
  const raw = source.raw;
  if (raw?.application_id != null && raw.application_id !== "")
    return String(raw.application_id);
  if (raw?._id != null && raw._id !== "") return String(raw._id);
  const sid = source.id != null ? String(source.id) : "";
  if (sid.includes("--")) return sid.split("--").pop() || null;
  if (sid) return sid;
  return null;
}

function avatarColorFromName(name) {
  const colors = ["blue", "violet", "teal", "amber"];
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h += name.charCodeAt(i);
  return colors[h % colors.length];
}

export function toSkillsArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v.trim())
    return v.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

/**
 * One row from rank-candidates API → UI candidate record.
 */
export function normalizeRankRow(row, jobTitle, postId) {
  const name = row.name || row.candidate_name || row.full_name || "Candidate";
  const cand = row.candidate && typeof row.candidate === "object" ? row.candidate : null;
  const email =
    row.email ||
    row.candidate_email ||
    row.candidateEmail ||
    row.user_email ||
    row.contact_email ||
    row.applicant_email ||
    row.applicantEmail ||
    (cand && (cand.email || cand.user_email)) ||
    "";
  const score = Number(row.match_score ?? row.score ?? row.ai_score ?? 0);
  const status = normalizeStatus(
    row.status ??
      row.application_status ??
      row.application?.status ??
      row.stage ??
      row.pipeline_status ??
      row.hiring_stage ??
      row.state,
  );
  const postKey =
    canonicalPostId(postId) ||
    canonicalPostId(
      row.post_id ??
        row.postId ??
        row.job_id ??
        row.jobId ??
        row.position_id ??
        "",
    );

  const uid =
    row._id ?? row.application_id ?? row.id ?? `${email || name}`;
  const id = `${postKey}--${String(uid)}`;
  const location = row.location || row.city || "—";
  const appliedRole =
    jobTitle || row.job_title || row.post_title || row.title || "—";
  const appliedDate =
    row.created_at ||
    row.applied_at ||
    row.application_date ||
    row.submitted_at ||
    null;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";
  const experience =
    row.experience ||
    row.years_experience ||
    (row.years != null ? `${row.years} yrs` : "—");

  return {
    id,
    name,
    email,
    phone: row.phone || row.phone_number || "",
    score,
    status,
    location,
    appliedRole,
    appliedDate,
    appliedAt: appliedDate,
    avatar: initials,
    avatarColor: avatarColorFromName(name),
    experience,
    skills: toSkillsArray(row.skills),
    postId: postKey,
    jobTitle: appliedRole,
    summary:
      row.summary || row.bio || row.profile_summary || row.about || "",
    education: row.education || row.degree || "",
    linkedin: row.linkedin || row.linkedin_url || "",
    notes: row.hr_notes || row.notes || "",
    emails: Array.isArray(row.emails) ? row.emails : [],
    scoreBreakdown:
      row.score_breakdown && typeof row.score_breakdown === "object"
        ? row.score_breakdown
        : null,
    raw: row,
  };
}

/**
 * @param {number} maxPosts - max concurrent rank-candidates calls (all jobs by default; cap if needed)
 * @returns {{ jobs: ReturnType<normalizeJob>[], applicants: ReturnType<normalizeRankRow>[] }}
 */
export async function fetchHRJobsAndRankedApplicants(maxPosts = 500) {
  const raw = await getHRJobs();
  const list = Array.isArray(raw)
    ? raw
    : raw?.posts || raw?.data || raw?.jobs || [];
  const jobs = list.map(normalizeJob);

  const toRank = jobs.slice(0, maxPosts);

  const rankedLists = [];
  for (let i = 0; i < toRank.length; i += RANK_FETCH_CONCURRENCY) {
    const batch = toRank.slice(i, i + RANK_FETCH_CONCURRENCY);
    const batchRows = await Promise.all(
      batch.map(async (job) => {
        const pid = job._id || job.id;
        if (!pid) return [];
        try {
          const data = await rankCandidatesByPost(pid);
          return parseRankList(data).map((r) =>
            normalizeRankRow(r, job.title, pid),
          );
        } catch {
          return [];
        }
      }),
    );
    rankedLists.push(...batchRows);
  }

  const countByPost = new Map();
  toRank.forEach((job, i) => {
    const pid = job._id || job.id;
    if (!pid) return;
    countByPost.set(canonicalPostId(pid), rankedLists[i].length);
  });
  const jobsWithCounts = jobs.map((job) => {
    const pid = canonicalPostId(job._id || job.id);
    const fromRank = countByPost.get(pid);
    const apiN = Number(job.applicants) || 0;
    if (fromRank != null && fromRank > 0) {
      return { ...job, applicants: Math.max(apiN, fromRank) };
    }
    return job;
  });

  const flat = rankedLists.flat();
  const seen = new Set();
  const applicants = [];
  for (const a of flat) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    applicants.push(a);
  }

  return { jobs: jobsWithCounts, applicants };
}

/**
 * When job posts omit applicant counts, fill them from rank-candidates list lengths
 * (same source as the Candidates page). Caps concurrent posts via maxPosts.
 */
export async function mergeApplicantCountsFromRanking(jobs, maxPosts = 500) {
  if (!jobs?.length) return jobs || [];
  const slice = jobs.slice(0, maxPosts);
  const pairs = [];
  for (let i = 0; i < slice.length; i += RANK_FETCH_CONCURRENCY) {
    const batch = slice.slice(i, i + RANK_FETCH_CONCURRENCY);
    const batchPairs = await Promise.all(
      batch.map(async (job) => {
        const pid = job._id || job.id;
        if (!pid) return [null, null];
        try {
          const data = await rankCandidatesByPost(pid);
          const n = parseRankList(data).length;
          return [canonicalPostId(pid), n];
        } catch {
          return [canonicalPostId(pid), null];
        }
      }),
    );
    pairs.push(...batchPairs);
  }
  const byPost = new Map(pairs.filter(([id]) => id).map(([id, n]) => [id, n]));

  return jobs.map((job) => {
    const pid = canonicalPostId(job._id || job.id);
    const rankedN = byPost.get(pid);
    const apiN = Number(job.applicants) || 0;
    if (rankedN != null && rankedN > 0) {
      return { ...job, applicants: Math.max(apiN, rankedN) };
    }
    return job;
  });
}

/** 8-week buckets when appliedDate is present */
export function buildWeeklySeries(candidates) {
  const MSW = 7 * 86400000;
  const now = Date.now();
  const weeks = Array.from({ length: 8 }, (_, i) => ({
    week: i === 7 ? "This week" : `${8 - i}w ago`,
    applications: 0,
    shortlisted: 0,
  }));
  let any = false;
  for (const c of candidates) {
    if (!c.appliedDate) continue;
    const t = new Date(c.appliedDate).getTime();
    if (Number.isNaN(t)) continue;
    const ageWeeks = Math.floor((now - t) / MSW);
    if (ageWeeks < 0 || ageWeeks > 7) continue;
    any = true;
    const bin = 7 - ageWeeks;
    weeks[bin].applications += 1;
    if (["shortlisted", "interview", "hired"].includes(c.status))
      weeks[bin].shortlisted += 1;
  }
  if (!any) return null;
  return weeks;
}

/** Normalize API pipeline row for detail page fields */
export function toDetailCandidate(src) {
  if (!src) return null;
  if (src.raw !== undefined) {
    const s = Number(src.score || 0);
    let breakdown =
      src.scoreBreakdown && typeof src.scoreBreakdown === "object"
        ? { ...src.scoreBreakdown }
        : null;
    if (!breakdown) {
      breakdown = {
        skills: Math.min(100, s),
        experience: Math.min(100, Math.round(s * 0.92)),
        education: Math.min(100, Math.round(s * 0.88)),
      };
    }
    let skills = src.skills?.length ? [...src.skills] : [];
    if (!skills.length && src.raw?.skills) skills = toSkillsArray(src.raw.skills);
    if (!skills.length) skills = ["—"];
    return {
      id: src.id,
      name: src.name,
      email: src.email || "—",
      phone: src.phone || "—",
      linkedin: src.linkedin || "—",
      location: src.location || "—",
      avatar: src.avatar,
      avatarColor: src.avatarColor,
      appliedRole: src.appliedRole,
      score: s,
      status: src.status,
      experience: src.experience || "—",
      education: src.education || "—",
      summary:
        src.summary ||
        "No summary available from the API for this application yet.",
      skills,
      appliedDate: src.appliedDate || new Date().toISOString(),
      notes: src.notes || "",
      emails: Array.isArray(src.emails) ? src.emails : [],
      scoreBreakdown: breakdown,
    };
  }
  return src;
}
