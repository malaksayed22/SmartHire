import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import HRSidebar from "../../components/HRSidebar";
import {
  Avatar,
  StatusPill,
  ScoreBadge,
  Toast,
  EmptyState,
} from "../../components/UI";
import { STATUS_LABELS } from "../../data/mock";
import {
  fetchHRJobsAndRankedApplicants,
  parseRankList,
  normalizeRankRow,
  normalizeStatus,
  canonicalPostId,
} from "../../services/hrApplicants";
import { rankCandidatesByPost } from "../../services/api";

export default function HRCandidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPostId = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return canonicalPostId(sp.get("post") || sp.get("post_id") || "");
  }, [location.search]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [ranking, setRanking] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [rankResults, setRankResults] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const { jobs, applicants: a } =
        await fetchHRJobsAndRankedApplicants(24);
      setJobPosts(jobs);
      setApplicants(a);
    } catch (e) {
      setToast({
        message: e.message || "Could not load candidates",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const statuses = [
    "all",
    "new",
    "reviewing",
    "shortlisted",
    "interview",
    "hired",
    "rejected",
  ];

  const handleAIRank = async () => {
    if (!selectedPostId) {
      setToast({
        message: "Please select a job post to rank candidates for.",
        type: "error",
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setRanking(true);
    try {
      const data = await rankCandidatesByPost(selectedPostId);
      const results = Array.isArray(data)
        ? data
        : data?.ranked ||
          data?.candidates ||
          data?.data ||
          data?.results ||
          [];
      const job = jobPosts.find(
        (p) =>
          canonicalPostId(p._id || p.id) === canonicalPostId(selectedPostId),
      );
      const title = job?.title || "";
      const rows = parseRankList(data).map((r) =>
        normalizeRankRow(r, title, selectedPostId),
      );
      setRankResults(results);

      setApplicants((prev) => {
        const rest = prev.filter(
          (c) =>
            canonicalPostId(c.postId) !== canonicalPostId(selectedPostId),
        );
        const ids = new Set(rest.map((c) => c.id));
        const next = [...rest];
        for (const r of rows) {
          if (!ids.has(r.id)) {
            ids.add(r.id);
            next.push(r);
          }
        }
        return next;
      });
      setToast({ message: "Ranking updated for this post.", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Ranking failed:", err);
      setToast({
        message:
          err.message ||
          "AI ranking failed. Check your connection and HR session.",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setRanking(false);
    }
  };

  const selectedJobTitle = selectedPostId
    ? jobPosts.find(
        (p) =>
          canonicalPostId(p._id || p.id) === canonicalPostId(selectedPostId),
      )?.title || ""
    : "";

  const baseList = selectedPostId
    ? applicants.filter(
        (c) =>
          canonicalPostId(c.postId) === canonicalPostId(selectedPostId),
      )
    : applicants;

  const safe = (v) => String(v ?? "").toLowerCase();

  const filtered = baseList
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        safe(c.name).includes(q) ||
        safe(c.appliedRole).includes(q) ||
        safe(c.email).includes(q) ||
        safe(c.location).includes(q);
      const canon = normalizeStatus(c.status);
      const matchStatus = filter === "all" || canon === filter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date") {
        const da = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
        const db = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
        return db - da;
      }
      return 0;
    });

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
              Candidates
            </h1>
            <div style={{ fontSize: 12.5, color: "var(--m2)", marginTop: 2 }}>
              {loading
                ? "Loading…"
                : `${applicants.length} from your API · ${filtered.length} shown`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled>
              Export CSV
            </button>
            {rankResults && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRankResults(null)}
                style={{
                  color: "var(--teal)",
                  borderColor: "rgba(30,207,170,0.3)",
                }}
              >
                Clear rank panel
              </button>
            )}
            <select
              className="input"
              value={selectedPostId}
              onChange={(e) => {
                const v = e.target.value;
                if (v) {
                  navigate(`/hr/candidates?post=${encodeURIComponent(v)}`, {
                    replace: true,
                  });
                } else {
                  navigate("/hr/candidates", { replace: true });
                }
              }}
              style={{
                height: 32,
                fontSize: 12.5,
                maxWidth: 190,
                padding: "0 8px",
              }}
            >
              <option value="">All jobs</option>
              {jobPosts.map((p) => (
                <option
                  key={canonicalPostId(p._id || p.id)}
                  value={canonicalPostId(p._id || p.id)}
                >
                  {p.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAIRank}
              disabled={ranking}
              style={{ opacity: ranking ? 0.6 : 1 }}
            >
              {ranking ? "⟳ Ranking..." : "🤖 Re-rank with AI"}
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 32px 0" }}>
          {rankResults && rankResults.length > 0 && (
            <div
              style={{
                background: "rgba(30,207,170,0.06)",
                border: "1px solid rgba(30,207,170,0.2)",
                borderRadius: 10,
                padding: "14px 20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    color: "var(--teal)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Raw ranking response · {selectedJobTitle || "post"}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setRankResults(null)}
                  style={{ fontSize: 11 }}
                >
                  Clear
                </button>
              </div>
              {rankResults.map((c, i) => (
                <div
                  key={c._id || c.id || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 0",
                    borderBottom:
                      i < rankResults.length - 1
                        ? "1px solid var(--b1)"
                        : "none",
                  }}
                >
                  <span
                    style={{ color: "var(--m2)", fontSize: 12, minWidth: 22 }}
                  >
                    #{i + 1}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>
                    {c.name || c.candidate_name || "Candidate"}
                  </span>
                  {(c.score || c.match_score) > 0 && (
                    <ScoreBadge score={c.score || c.match_score} />
                  )}
                  <span style={{ color: "var(--m2)", fontSize: 12 }}>
                    {c.email || ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <input
                className="input"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--m2)",
                  fontSize: 14,
                }}
              >
                ⌕
              </span>
            </div>
            <select
              className="select"
              style={{ width: 160, fontSize: 13 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="score">Sort: AI Score</option>
              <option value="name">Sort: Name</option>
              <option value="date">Sort: Date Applied</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              paddingBottom: 0,
              borderBottom: "1px solid var(--b1)",
            }}
          >
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "7px 7px 0 0",
                  background: filter === s ? "var(--s1)" : "transparent",
                  border:
                    filter === s
                      ? "1px solid var(--b2)"
                      : "1px solid transparent",
                  borderBottom:
                    filter === s
                      ? "1px solid var(--s1)"
                      : "1px solid transparent",
                  color: filter === s ? "var(--text)" : "var(--m2)",
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: -1,
                }}
              >
                {s === "all" ? "All Candidates" : STATUS_LABELS[s]}
                <span
                  style={{ marginLeft: 7, fontSize: 11, color: "var(--m3)" }}
                >
                  {s === "all"
                    ? baseList.length
                    : baseList.filter((c) => normalizeStatus(c.status) === s)
                        .length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: "0 32px 40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1.5fr 120px 130px 100px 80px",
              padding: "12px 16px",
              background: "var(--s1)",
              borderBottom: "1px solid var(--b1)",
              position: "sticky",
              top: 69,
              zIndex: 5,
            }}
          >
            {[
              "Candidate",
              "Applied Role",
              "AI Score",
              "Status",
              "Applied",
              "Actions",
            ].map((h) => (
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

          {!loading && applicants.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No applicants in the pipeline"
              desc="Post jobs, have candidates apply, then run Re-rank with AI — or check your HR login session."
            />
          ) : (
            filtered.map((c) => {
              const daysAgo = c.appliedDate
                ? Math.floor(
                    (Date.now() - new Date(c.appliedDate)) / 86400000,
                  )
                : null;
              return (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "2.5fr 1.5fr 120px 130px 100px 80px",
                    padding: "14px 16px",
                    borderBottom: "1px solid var(--b1)",
                    alignItems: "center",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--s1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Avatar
                      initials={c.avatar}
                      color={c.avatarColor}
                      size={38}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 500,
                          color: "var(--text)",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--m2)",
                          marginTop: 1,
                        }}
                      >
                        {c.location} · {c.experience}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, color: "var(--m1)" }}>
                      {c.appliedRole}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 5,
                      }}
                    >
                      {(c.skills || []).slice(0, 2).map((sk) => (
                        <span
                          key={sk}
                          style={{
                            padding: "1px 7px",
                            borderRadius: 4,
                            background: "var(--b1)",
                            fontSize: 10.5,
                            color: "var(--m2)",
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ScoreBadge score={c.score} showBar />
                  <StatusPill status={normalizeStatus(c.status)} />
                  <div style={{ fontSize: 12.5, color: "var(--m2)" }}>
                    {daysAgo == null
                      ? "—"
                      : daysAgo === 0
                        ? "Today"
                        : `${daysAgo}d ago`}
                  </div>
                  <Link
                    to={`/hr/candidates/${encodeURIComponent(c.id)}`}
                    state={{ applicant: c }}
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          `hr_applicant_${c.id}`,
                          JSON.stringify(c),
                        );
                      } catch (_) {}
                    }}
                    style={{
                      fontSize: 12.5,
                      color: "var(--blue)",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    View →
                  </Link>
                </div>
              );
            })
          )}

          {!loading && filtered.length === 0 && applicants.length > 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>👤</div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                No candidates in this filter
              </div>
              <div style={{ color: "var(--m1)", fontSize: 14 }}>
                Try &quot;All jobs&quot; or another status tab
              </div>
            </div>
          )}
        </div>
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
