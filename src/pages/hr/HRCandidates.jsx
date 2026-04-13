import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "../../components/HRSidebar";
import { Avatar, StatusPill, ScoreBadge, Toast } from "../../components/UI";
import { CANDIDATES, STATUS_LABELS, JOBS as MOCK_JOBS } from "../../data/mock";

export default function HRCandidates() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [aiRanked, setAiRanked] = useState(null);
  const [ranking, setRanking] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [rankResults, setRankResults] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { getHRJobs, normalizeJob } = await import("../../services/api");
        const raw = await getHRJobs();
        const posts = Array.isArray(raw)
          ? raw.map(normalizeJob)
          : (raw.posts || []).map(normalizeJob);
        if (posts.length > 0) {
          setJobPosts(posts);
          // Leave selectedPostId as "" (All Jobs) — user picks explicitly
        } else {
          // Fall back to mock jobs so the UI is always usable
          setJobPosts(MOCK_JOBS);
          // Leave selectedPostId as "" (All Jobs)
        }
      } catch {
        // Backend unreachable — use mock jobs so UI stays functional
        setJobPosts(MOCK_JOBS);
        // Leave selectedPostId as "" (All Jobs)
      }
    })();
  }, []);

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
      const { rankCandidatesByPost } = await import("../../services/api");
      const data = await rankCandidatesByPost(selectedPostId);
      const results = Array.isArray(data)
        ? data
        : data.ranked || data.candidates || [];
      setRankResults(results);
      setAiRanked(null);
    } catch (err) {
      console.error("Ranking failed:", err);
      setToast({
        message:
          "AI ranking unavailable. Make sure the backend server is running.",
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setRanking(false);
    }
  };

  const baseList = aiRanked
    ? aiRanked.map((r) => CANDIDATES.find((c) => c.id === r.id)).filter(Boolean)
    : CANDIDATES;

  // Find the title of the currently selected job (for candidate filtering)
  const selectedJobTitle = selectedPostId
    ? jobPosts.find((p) => (p._id || p.id) === selectedPostId)?.title || ""
    : "";

  const filtered = baseList
    .filter((c) => {
      const s = search.toLowerCase();
      const matchSearch =
        !s ||
        c.name.toLowerCase().includes(s) ||
        c.appliedRole.toLowerCase().includes(s) ||
        c.location.toLowerCase().includes(s);
      const matchStatus = filter === "all" || c.status === filter;
      const matchJob =
        !selectedJobTitle ||
        c.appliedRole.toLowerCase() === selectedJobTitle.toLowerCase();
      return matchSearch && matchStatus && matchJob;
    })
    .sort((a, b) => {
      if (aiRanked) return 0; // already sorted by AI
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date")
        return new Date(b.appliedDate) - new Date(a.appliedDate);
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
        {/* Header */}
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
              {CANDIDATES.length} total · AI-ranked by score
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
            {(aiRanked || rankResults) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setAiRanked(null);
                  setRankResults(null);
                }}
                style={{
                  color: "var(--teal)",
                  borderColor: "rgba(30,207,170,0.3)",
                }}
              >
                ✓ AI Ranked · Clear
              </button>
            )}
            <select
              className="input"
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              style={{
                height: 32,
                fontSize: 12.5,
                maxWidth: 170,
                padding: "0 8px",
              }}
            >
              <option value="">All Jobs</option>
              {jobPosts.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button
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
          {/* AI Ranking Results Panel */}
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
                  🤖 AI-Ranked Candidates
                </span>
                <button
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

          {/* Controls */}
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

          {/* Status tabs */}
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
                    ? baseList.filter(
                        (c) =>
                          !selectedJobTitle ||
                          c.appliedRole.toLowerCase() ===
                            selectedJobTitle.toLowerCase(),
                      ).length
                    : baseList.filter(
                        (c) =>
                          c.status === s &&
                          (!selectedJobTitle ||
                            c.appliedRole.toLowerCase() ===
                              selectedJobTitle.toLowerCase()),
                      ).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, padding: "0 32px 40px" }}>
          {/* Column headers */}
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

          {filtered.map((c) => {
            const daysAgo = Math.floor(
              (Date.now() - new Date(c.appliedDate)) / 86400000,
            );
            return (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.5fr 120px 130px 100px 80px",
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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {aiRanked && (
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--grad)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                        marginRight: 6,
                      }}
                    >
                      {aiRanked.find((r) => r.id === c.id)?.rank || "—"}
                    </span>
                  )}
                  <Avatar initials={c.avatar} color={c.avatarColor} size={38} />
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
                      style={{ fontSize: 12, color: "var(--m2)", marginTop: 1 }}
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
                    {c.skills.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: "1px 7px",
                          borderRadius: 4,
                          background: "var(--b1)",
                          fontSize: 10.5,
                          color: "var(--m2)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <ScoreBadge score={c.score} showBar />
                <StatusPill status={c.status} />
                <div style={{ fontSize: 12.5, color: "var(--m2)" }}>
                  {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                </div>
                <Link
                  to={`/hr/candidates/${c.id}`}
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
          })}

          {filtered.length === 0 && (
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
                No candidates found
              </div>
              <div style={{ color: "var(--m1)", fontSize: 14 }}>
                Try adjusting your filters
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
