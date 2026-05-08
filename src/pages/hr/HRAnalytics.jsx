import { useState, useEffect, useMemo } from "react";
import HRSidebar from "../../components/HRSidebar";
import { STATUS_LABELS } from "../../data/mock";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STATUS_PIE_COLORS = {
  new: "#5B8EF8",
  reviewing: "#F0A030",
  shortlisted: "#1ECFAA",
  interview: "#8B70F5",
  hired: "#22C55E",
  rejected: "#F05068",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--s3)",
          border: "1px solid var(--b2)",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
        }}
      >
        <div style={{ color: "var(--m1)", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function parseRankList(data) {
  if (Array.isArray(data)) return data;
  return (
    data?.ranked || data?.candidates || data?.data || data?.results || []
  );
}

function normalizeStatus(raw) {
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

function rowToCandidate(row, jobTitle) {
  const name =
    row.name || row.candidate_name || row.full_name || "Candidate";
  const score = Number(row.match_score ?? row.score ?? row.ai_score ?? 0);
  const email = row.email || "";
  const status = normalizeStatus(
    row.status ?? row.application_status ?? row.stage ?? row.pipeline_status,
  );
  const id = String(
    row._id ?? row.id ?? row.application_id ?? `${email}:${jobTitle}`,
  );
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
  return {
    id,
    name,
    email,
    score,
    status,
    location,
    appliedRole,
    appliedDate,
    avatar: initials,
  };
}

function dedupeByEmail(cands) {
  const m = new Map();
  for (const c of cands) {
    const key = (c.email || c.id).toLowerCase();
    const prev = m.get(key);
    if (!prev || c.score > prev.score) m.set(key, c);
  }
  return [...m.values()];
}

function buildWeeklySeries(candidates) {
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

export default function HRAnalytics() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { getHRJobs, normalizeJob, rankCandidatesByPost } = await import(
          "../../services/api"
        );
        const raw = await getHRJobs();
        const list = Array.isArray(raw)
          ? raw
          : raw.posts || raw.data || raw.jobs || [];
        const normalized = list.map(normalizeJob);
        if (cancelled) return;
        setJobs(normalized);

        const toRank = normalized
          .filter((j) => (j.applicants || 0) > 0 || normalized.length <= 12)
          .slice(0, 24);
        const rankedLists = await Promise.all(
          toRank.map(async (job) => {
            const id = job._id || job.id;
            if (!id) return [];
            try {
              const data = await rankCandidatesByPost(id);
              const rows = parseRankList(data);
              return rows.map((r) => rowToCandidate(r, job.title));
            } catch {
              return [];
            }
          }),
        );
        if (cancelled) return;
        const flat = dedupeByEmail(rankedLists.flat());
        setCandidates(flat);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalFromJobs = useMemo(
    () => jobs.reduce((a, j) => a + (j.applicants || 0), 0),
    [jobs],
  );

  const totalApplicants = candidates.length > 0 ? candidates.length : totalFromJobs;
  const scored = candidates.filter((c) => c.score > 0);
  const avgScore =
    scored.length > 0
      ? Math.round(
          (scored.reduce((a, c) => a + c.score, 0) / scored.length) * 10,
        ) / 10
      : null;
  const inFunnel = candidates.filter((c) =>
    ["shortlisted", "interview", "hired"].includes(c.status),
  ).length;
  const shortlistRate =
    candidates.length > 0
      ? Math.round((inFunnel / candidates.length) * 100)
      : 0;

  const activeRoles = jobs.filter((j) => j.status === "active").length;

  const weeklyData = useMemo(() => {
    const fromDates = buildWeeklySeries(candidates);
    if (fromDates) return fromDates;
    return [
      {
        week: "Pipeline",
        applications: totalApplicants,
        shortlisted: inFunnel,
      },
    ];
  }, [candidates, totalApplicants, inFunnel]);

  const statusDist = useMemo(() => {
    const keys = [
      "new",
      "reviewing",
      "shortlisted",
      "interview",
      "hired",
      "rejected",
    ];
    return keys
      .map((k) => ({
        name: STATUS_LABELS[k] || k,
        value: candidates.filter((c) => c.status === k).length,
        color: STATUS_PIE_COLORS[k],
        key: k,
      }))
      .filter((d) => d.value > 0);
  }, [candidates]);

  const scoreDist = useMemo(() => {
    if (candidates.length === 0)
      return [
        { range: "90–100", count: 0 },
        { range: "80–89", count: 0 },
        { range: "70–79", count: 0 },
        { range: "60–69", count: 0 },
        { range: "<60", count: 0 },
      ];
    return [
      { range: "90–100", count: candidates.filter((c) => c.score >= 90).length },
      {
        range: "80–89",
        count: candidates.filter((c) => c.score >= 80 && c.score < 90).length,
      },
      {
        range: "70–79",
        count: candidates.filter((c) => c.score >= 70 && c.score < 80).length,
      },
      {
        range: "60–69",
        count: candidates.filter((c) => c.score >= 60 && c.score < 70).length,
      },
      { range: "<60", count: candidates.filter((c) => c.score < 60).length },
    ];
  }, [candidates]);

  const deptDist = useMemo(
    () =>
      jobs.map((j) => ({
        dept: (j.department || "General").replace(" Research", ""),
        applicants: j.applicants || 0,
      })),
    [jobs],
  );

  const topFive = useMemo(
    () => [...candidates].sort((a, b) => b.score - a.score).slice(0, 5),
    [candidates],
  );

  const periodLabel = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const kpis = [
    {
      label: "Total applicants",
      value: loading ? "…" : totalApplicants,
      delta: candidates.length ? "From ranking & job totals" : "Per job posts",
      color: "#5B8EF8",
    },
    {
      label: "Avg AI score",
      value:
        loading ? "…" : avgScore != null ? avgScore : "—",
      delta: scored.length ? `Across ${scored.length} scored` : "No scores yet",
      color: "#F0A030",
    },
    {
      label: "Shortlist rate",
      value: loading ? "…" : `${shortlistRate}%`,
      delta: "Shortlisted + interview + hired",
      color: "#1ECFAA",
    },
    {
      label: "Active job posts",
      value: loading ? "…" : activeRoles,
      delta: `${jobs.length} total roles`,
      color: "#8B70F5",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <HRSidebar />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 32px",
            borderBottom: "1px solid var(--b1)",
            position: "sticky",
            top: 0,
            background: "rgba(6,7,9,0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Analytics
            </h1>
            <div style={{ fontSize: 12.5, color: "var(--m2)", marginTop: 2 }}>
              Live data · {periodLabel}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled>
              Export PDF
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled>
              Export Excel
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "28px 32px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {error && (
            <div
              className="card"
              style={{
                padding: "14px 18px",
                borderColor: "var(--red-dim)",
                color: "var(--red)",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* KPI strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
            {kpis.map((k, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "18px 20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${k.color}70, transparent)`,
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--m2)",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    fontFamily: "'Syne', sans-serif",
                    color: "var(--text)",
                    lineHeight: 1,
                  }}
                >
                  {k.value}
                </div>
                <div
                  style={{ fontSize: 11.5, color: "var(--teal)", marginTop: 6 }}
                >
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          {/* Applications + Shortlisted over time */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Applications & shortlisting
                </div>
                <div
                  style={{ fontSize: 12.5, color: "var(--m2)", marginTop: 3 }}
                >
                  Weekly buckets when application dates exist; otherwise
                  pipeline totals
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: "#5B8EF8",
                    }}
                  />
                  <span style={{ color: "var(--m1)" }}>Applications</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: "#1ECFAA",
                    }}
                  />
                  <span style={{ color: "var(--m1)" }}>Shortlisted</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#545D80", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#545D80", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="url(#blueGrad2)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="shortlisted"
                  name="Shortlisted"
                  fill="rgba(30,207,170,0.65)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B8EF8" />
                    <stop offset="100%" stopColor="#8B70F5" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row: Pie + Score dist */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card" style={{ padding: "22px 24px" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Pipeline status
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--m2)", marginBottom: 20 }}
              >
                From application status fields (defaults to New when missing)
              </div>
              {statusDist.length === 0 ? (
                <div style={{ color: "var(--m2)", fontSize: 14, padding: 24 }}>
                  No ranked applications yet. Post jobs and run ranking from
                  Candidates.
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={statusDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDist.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [v, n]}
                        contentStyle={{
                          background: "var(--s3)",
                          border: "1px solid var(--b2)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {statusDist.map((d, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: d.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12.5,
                            color: "var(--m1)",
                            flex: 1,
                          }}
                        >
                          {d.name}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text)",
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ padding: "22px 24px" }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                AI score distribution
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--m2)", marginBottom: 20 }}
              >
                Ranked candidates only
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {scoreDist.map((s, i) => {
                  const max = Math.max(...scoreDist.map((d) => d.count), 1);
                  const barColor =
                    i === 0
                      ? "var(--teal)"
                      : i === 1
                        ? "var(--teal)"
                        : i === 2
                          ? "var(--amber)"
                          : i === 3
                            ? "var(--amber)"
                            : "var(--red)";
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: "var(--m1)" }}>{s.range}</span>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>
                          {s.count} candidates
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--b1)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${(s.count / max) * 100}%`,
                            height: "100%",
                            background: barColor,
                            borderRadius: 3,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Applicants by department */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Applicants by department
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--m2)", marginBottom: 20 }}
            >
              Counts from your job posts (HR API)
            </div>
            {deptDist.length === 0 ? (
              <div style={{ color: "var(--m2)", fontSize: 14 }}>
                No job posts yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deptDist} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid
                    horizontal={false}
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#545D80", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="dept"
                    tick={{ fill: "#9198B5", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar
                    dataKey="applicants"
                    name="Applicants"
                    fill="url(#blueGrad3)"
                    radius={[0, 4, 4, 0]}
                  />
                  <defs>
                    <linearGradient id="blueGrad3" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5B8EF8" />
                      <stop offset="100%" stopColor="#8B70F5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top candidates */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid var(--b1)",
                fontFamily: "'Syne', sans-serif",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Top performing candidates
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 1.5fr 100px 120px",
                padding: "10px 22px",
                borderBottom: "1px solid var(--b1)",
                background: "var(--s1)",
              }}
            >
              {["Candidate", "Role", "AI score", "Status"].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--m2)",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {topFive.length === 0 ? (
              <div
                style={{ padding: "40px 22px", color: "var(--m2)", fontSize: 14 }}
              >
                No ranked candidates yet. Open{" "}
                <strong style={{ color: "var(--m1)" }}>Candidates</strong> and
                run &quot;Re-rank with AI&quot; per job, or wait for applications.
              </div>
            ) : (
              topFive.map((c) => {
                const sc =
                  c.score >= 80
                    ? "var(--teal)"
                    : c.score >= 60
                      ? "var(--amber)"
                      : "var(--red)";
                const pill =
                  c.status === "shortlisted" || c.status === "interview"
                    ? "teal"
                    : c.status === "new"
                      ? "blue"
                      : c.status === "reviewing"
                        ? "amber"
                        : c.status === "hired"
                          ? "green"
                          : "red";
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2.5fr 1.5fr 100px 120px",
                      padding: "12px 22px",
                      borderBottom: "1px solid var(--b1)",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(91,142,248,0.12)",
                          color: "#8AB8FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {c.avatar}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--text)",
                          }}
                        >
                          {c.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--m2)" }}>
                          {c.location}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--m1)" }}>
                      {c.appliedRole}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: sc,
                          fontFamily: "'Syne', sans-serif",
                        }}
                      >
                        {c.score || "—"}
                      </span>
                      <div
                        style={{
                          width: 30,
                          height: 3,
                          background: "var(--b1)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(c.score || 0, 100)}%`,
                            height: "100%",
                            background: sc,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                    <span className={`pill pill-${pill}`}>
                      {STATUS_LABELS[c.status] ||
                        (c.status
                          ? c.status.charAt(0).toUpperCase() + c.status.slice(1)
                          : "—")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
