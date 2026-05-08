/**
 * HR pipeline: jobs + ranked applicants from getHRJobs + rankCandidatesByPost.
 */
import { getHRJobs, normalizeJob, rankCandidatesByPost } from "./api";

export function parseRankList(data) {
  if (Array.isArray(data)) return data;
  return data?.ranked || data?.candidates || data?.data || data?.results || [];
}

export function normalizeStatus(raw) {
  if (raw == null || raw === "") return "new";
  const s = String(raw).toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (s.includes("shortlist")) return "shortlisted";
  if (s.includes("interview")) return "interview";
  if (s.includes("hire")) return "hired";
  if (s.includes("reject")) return "rejected";
  if (s.includes("review")) return "reviewing";
  if (s.includes("new") || s.includes("apply")) return "new";
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
    row.status ?? row.application_status ?? row.stage ?? row.pipeline_status,
  );
  const uid =
    row._id ?? row.application_id ?? row.id ?? `${postId}:${email || name}`;
  const id = String(uid);
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
    postId: String(postId),
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

  const flat = rankedLists.flat();
  const seen = new Set();
  const applicants = [];
  for (const a of flat) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    applicants.push(a);
  }

  return { jobs, applicants };
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
