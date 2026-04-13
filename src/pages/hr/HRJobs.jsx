import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "../../components/HRSidebar";
import { DeptTag, Toast } from "../../components/UI";
import { JOBS, CANDIDATES } from "../../data/mock";

export default function HRJobs() {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    department: "Engineering",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: "",
    skills: "",
  });
  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    requirements: "",
    skills: "",
  });
  const [jobs, setJobs] = useState(JOBS);

  // Fetch real jobs from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const { getHRJobs, normalizeJob } = await import("../../services/api");
        const data = await getHRJobs();
        if (Array.isArray(data) && data.length > 0)
          setJobs(data.map(normalizeJob));
      } catch {}
    })();
  }, []);

  // Close kebab menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-menu]")) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePost = async () => {
    if (!form.title || !form.location) return;
    try {
      const { addJobPost, getHRJobs, normalizeJob } =
        await import("../../services/api");
      // Parse salary range e.g. "$3,000 – $5,000/mo"
      const nums = (form.salary || "").match(/[\d,]+/g) || [];
      const salary_min = nums[0] ? parseInt(nums[0].replace(/,/g, ""), 10) : 0;
      const salary_max = nums[1]
        ? parseInt(nums[1].replace(/,/g, ""), 10)
        : salary_min;
      // Detect work_mode from location/type
      const locLower = form.location.toLowerCase();
      const work_mode = locLower.includes("remote")
        ? "remote"
        : locLower.includes("hybrid")
          ? "hybrid"
          : "on-site";
      await addJobPost({
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        skills: form.skills,
        salary_min,
        salary_max,
        salary_currency: "USD",
        salary_period: "monthly",
        employment_type: form.type.toLowerCase().replace(" ", "-"),
        work_mode,
      });
      // Refresh list from API
      const fresh = await getHRJobs();
      if (Array.isArray(fresh)) setJobs(fresh.map(normalizeJob));
    } catch {
      // Fallback: add locally if API fails
      const newJob = {
        ...form,
        id: Date.now().toString(),
        applicants: 0,
        status: "active",
        posted: new Date().toISOString().split("T")[0],
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
        requirements: form.requirements
          ? form.requirements.split(",").map((s) => s.trim())
          : [],
        responsibilities: [],
      };
      setJobs((prev) => [newJob, ...prev]);
    }
    setShowModal(false);
    setForm({
      title: "",
      department: "Engineering",
      location: "",
      type: "Full-time",
      salary: "",
      description: "",
      requirements: "",
      skills: "",
    });
    setToast({ message: "Job posted successfully!", type: "success" });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdate = async () => {
    if (!editForm.title || !editForm.location) return;
    try {
      const { updateJobPost, getHRJobs, normalizeJob } =
        await import("../../services/api");
      const nums = (editForm.salary || "").match(/[\d,]+/g) || [];
      const salary_min = nums[0] ? parseInt(nums[0].replace(/,/g, ""), 10) : 0;
      const salary_max = nums[1]
        ? parseInt(nums[1].replace(/,/g, ""), 10)
        : salary_min;
      const locLower = editForm.location.toLowerCase();
      const work_mode = locLower.includes("remote")
        ? "remote"
        : locLower.includes("hybrid")
          ? "hybrid"
          : "on-site";
      await updateJobPost({
        _id: editJob._id || editJob.id,
        title: editForm.title,
        description: editForm.description,
        requirements: editForm.requirements,
        skills: editForm.skills,
        salary_min,
        salary_max,
        salary_currency: "USD",
        salary_period: "monthly",
        employment_type: editForm.type.toLowerCase().replace(" ", "-"),
        work_mode,
      });
      const fresh = await getHRJobs();
      if (Array.isArray(fresh)) setJobs(fresh.map(normalizeJob));
    } catch {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === (editJob._id || editJob.id) ? { ...j, ...editForm } : j,
        ),
      );
    }
    setEditJob(null);
    setToast({ message: "Job updated successfully!", type: "success" });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async (jobId) => {
    try {
      const { deleteJobPost, getHRJobs, normalizeJob } =
        await import("../../services/api");
      await deleteJobPost(jobId);
      const fresh = await getHRJobs();
      if (Array.isArray(fresh)) setJobs(fresh.map(normalizeJob));
      else setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
    setToast({ message: "Job deleted.", type: "success" });
    setTimeout(() => setToast(null), 3000);
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
                gridTemplateColumns: "2fr 1fr 110px 90px 80px 210px",
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
                    gridTemplateColumns: "2fr 1fr 110px 90px 80px 210px",
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
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
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
                    <div style={{ position: "relative" }} data-menu>
                      <button
                        data-menu
                        className="btn btn-ghost btn-sm"
                        style={{
                          fontSize: 18,
                          padding: "1px 9px",
                          letterSpacing: 1,
                          lineHeight: 1,
                        }}
                        onClick={() =>
                          setOpenMenuId(openMenuId === job.id ? null : job.id)
                        }
                      >
                        ⋮
                      </button>
                      {openMenuId === job.id && (
                        <div
                          data-menu
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "calc(100% + 4px)",
                            background: "var(--s2)",
                            border: "1px solid var(--b1)",
                            borderRadius: 8,
                            padding: "4px 0",
                            zIndex: 200,
                            minWidth: 130,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                          }}
                        >
                          <button
                            data-menu
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 14px",
                              background: "none",
                              border: "none",
                              color: "var(--text)",
                              fontSize: 13,
                              cursor: "pointer",
                              borderRadius: "6px 6px 0 0",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "var(--s1)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                            onClick={() => {
                              setEditJob(job);
                              setEditForm({
                                title: job.title || "",
                                department: job.department || "Engineering",
                                location: job.location || "",
                                type: job.type || "Full-time",
                                salary: job.salary || "",
                                description: job.description || "",
                                requirements: Array.isArray(job.requirements)
                                  ? job.requirements.join(", ")
                                  : job.requirements || "",
                                skills: Array.isArray(job.skills)
                                  ? job.skills.join(", ")
                                  : job.skills || "",
                              });
                              setOpenMenuId(null);
                            }}
                          >
                            Update
                          </button>
                          <div
                            style={{
                              height: 1,
                              background: "var(--b1)",
                              margin: "2px 0",
                            }}
                          />
                          <button
                            data-menu
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 14px",
                              background: "none",
                              border: "none",
                              color: "var(--red)",
                              fontSize: 13,
                              cursor: "pointer",
                              borderRadius: "0 0 6px 6px",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "var(--s1)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                            onClick={() => {
                              handleDelete(job.id);
                              setOpenMenuId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
                  style={{ minHeight: 100 }}
                />
              </div>
              <div>
                <label className="label">Requirements</label>
                <input
                  className="input"
                  placeholder="e.g. 3+ years React, TypeScript, Node.js"
                  value={form.requirements}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, requirements: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Skills (comma-separated)</label>
                <input
                  className="input"
                  placeholder="e.g. React, TypeScript, CSS"
                  value={form.skills}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, skills: e.target.value }))
                  }
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

      {/* Edit Job Modal */}
      {editJob && (
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
            if (e.target === e.currentTarget) setEditJob(null);
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
                Edit Job
              </h2>
              <button
                onClick={() => setEditJob(null)}
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
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
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
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, department: e.target.value }))
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
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, type: e.target.value }))
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
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Salary Range</label>
                <input
                  className="input"
                  placeholder="e.g. $3,000 – $5,000/mo"
                  value={editForm.salary}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, salary: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  placeholder="Describe the role, team, and impact..."
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, description: e.target.value }))
                  }
                  style={{ minHeight: 100 }}
                />
              </div>
              <div>
                <label className="label">Requirements</label>
                <input
                  className="input"
                  placeholder="e.g. 3+ years React, TypeScript, Node.js"
                  value={editForm.requirements}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, requirements: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Skills (comma-separated)</label>
                <input
                  className="input"
                  placeholder="e.g. React, TypeScript, CSS"
                  value={editForm.skills}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, skills: e.target.value }))
                  }
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setEditJob(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: "center" }}
                  onClick={handleUpdate}
                  disabled={!editForm.title || !editForm.location}
                >
                  Update Job →
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
