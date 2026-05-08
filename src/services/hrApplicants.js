/**
 * HR pipeline: jobs + ranked applicants from getHRJobs + rankCandidatesByPost.
 */
import { getHRJobs, normalizeJob, rankCandidatesByPost } from "./api";

export function parseRankList(data) {
  if (Array.isArray(data)) return data;
  return data?.ranked || data?.candidates || data?.data || data?.results || [];
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
  const email = row.email || "";
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
  const resolvedPostId =
    row.post_id ??
    row.postId ??
    row.job_id ??
    row.jobId ??
    row.position_id ??
    postId;

  const uid =
    row._id ?? row.application_id ?? row.id ?? `${email || name}`;
  const postKey = canonicalPostId(resolvedPostId);
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
    postId: canonicalPostId(resolvedPostId),
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
 * @param {number} maxPosts - max concurrent rank-candidates calls
 * @returns {{ jobs: ReturnType<normalizeJob>[], applicants: ReturnType<normalizeRankRow>[] }}
 */
export async function fetchHRJobsAndRankedApplicants(maxPosts = 24) {
  const raw = await getHRJobs();
  const list = Array.isArray(raw)
    ? raw
    : raw?.posts || raw?.data || raw?.jobs || [];
  const jobs = list.map(normalizeJob);

  const toRank = jobs.slice(0, maxPosts);

  const rankedLists = await Promise.all(
    toRank.map(async (job) => {
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
export async function mergeApplicantCountsFromRanking(jobs, maxPosts = 24) {
  if (!jobs?.length) return jobs || [];
  const slice = jobs.slice(0, maxPosts);
  const pairs = await Promise.all(
    slice.map(async (job) => {
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
