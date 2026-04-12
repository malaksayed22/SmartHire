import { useState } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "../../components/HRSidebar";
import { DeptTag, Toast } from "../../components/UI";
import { JOBS, CANDIDATES } from "../../data/mock";

export default function HRJobs() {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
  });
  const [jobs, setJobs] = useState(JOBS);

  const handlePost = () => {
    if (!form.title || !form.location) return;
    const newJob = {
      ...form,
      id: Date.now().toString(),
      applicants: 0,
      status: "active",
      posted: new Date().toISOString().split("T")[0],
      skills: [],
      requirements: [],
      responsibilities: [],
      description: form.description,
    };
    setJobs((prev) => [newJob, ...prev]);
    setShowModal(false);
    setForm({
      title: "",
      department: "Engineering",
      location: "",
      type: "Full-time",
      salary: "",
      description: "",
    });
    setToast({
      message: "Job posted successfully! Candidates can now apply.",
      type: "success",
    });
    setTimeout(() => setToast(null), 4000);
  };

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
              Job Posts
            </h1>
            <div style={{ fontSize: 12.5, color: "var(--m2)", marginTop: 2 }}>
              {jobs.filter((j) => j.status === "active").length} active ·{" "}
              {jobs.length} total
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Post New Job
          </button>
        </div>

        <div style={{ padding: "24px 32px 40px" }}>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginBottom: 28,
            }}
          >
            {[
              {
                label: "Active Roles",
                value: jobs.filter((j) => j.status === "active").length,
                color: "#5B8EF8",
              },
              {
                label: "Total Applicants",
                value: jobs.reduce((a, j) => a + j.applicants, 0),
                color: "#1ECFAA",
              },
              {
                label: "Avg. Per Role",
                value: Math.round(
                  jobs.reduce((a, j) => a + j.applicants, 0) / jobs.length,
                ),
                color: "#8B70F5",
              },
            ].map((s, i) => (
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
                    background: `linear-gradient(90deg, transparent, ${s.color}70, transparent)`,
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
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    fontFamily: "'Syne', sans-serif",
                    color: "var(--text)",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--b1)",
                fontFamily: "'Syne', sans-serif",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              All Positions
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 110px 90px 90px 170px",
                padding: "10px 20px",
                borderBottom: "1px solid var(--b1)",
                background: "var(--s1)",
              }}
            >
              {[
                "Position",
                "Department",
                "Status",
                "Applicants",
                "Posted",
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
            {jobs.map((job) => {
              const daysAgo = Math.floor(
                (Date.now() - new Date(job.posted)) / 86400000,
              );
              return (
                <div
                  key={job.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 110px 90px 90px 170px",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--b1)",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--s1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 500,
                        color: "var(--text)",
                        marginBottom: 3,
                      }}
                    >
                      {job.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--m2)" }}>
                      📍 {job.location} · {job.type}
                    </div>
                  </div>
                  <DeptTag dept={job.department} />
                  <span
                    className={`pill ${job.status === "active" ? "pill-teal" : "pill-red"}`}
                  >
                    {job.status === "active" ? "● Active" : "○ Closed"}
                  </span>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      color: "var(--text)",
                    }}
                  >
                    {job.applicants}
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--m3)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 400,
                        display: "block",
                      }}
                    >
                      applicants
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--m2)" }}>
                    {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      View
                    </Link>
                    <Link
                      to="/hr/candidates"
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      Candidates
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* New Job Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 560,
              padding: "32px",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "scaleIn 0.25s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                Post New Job
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--m2)",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="label">Job Title *</label>
                <input
                  className="input"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label className="label">Department</label>
                  <select
                    className="select"
                    value={form.department}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, department: e.target.value }))
                    }
                  >
                    <option>Engineering</option>
                    <option>AI Research</option>
                    <option>Design</option>
                    <option>HR</option>
                    <option>Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="label">Job Type</label>
                  <select
                    className="select"
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Location *</label>
                <input
                  className="input"
                  placeholder="e.g. Cairo, Egypt (Hybrid)"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Salary Range</label>
                <input
                  className="input"
                  placeholder="e.g. $3,000 – $5,000/mo"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salary: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  placeholder="Describe the role, team, and impact..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  style={{ minHeight: 120 }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  onClick={handlePost}
                  disabled={!form.title || !form.location}
                >
                  Post Job →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
