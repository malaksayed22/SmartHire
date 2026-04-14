import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import { DeptTag } from "../../components/UI";
import { JOBS } from "../../data/mock";
import { useAuth } from "../../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { candidateUser } = useAuth();
  const [apiJob, setApiJob] = useState(null);
  const mockJob = JOBS.find((j) => j.id === id);
  const job = apiJob || mockJob;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    cover: "",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Try to load real job from backend (uses _id for API calls)
  useEffect(() => {
    (async () => {
      try {
        const { getActiveJobs, normalizeJob } =
          await import("../../services/api");
        const jobs = await getActiveJobs();
        const found = jobs.find((j) => j._id === id || j.id === id);
        if (found) setApiJob(normalizeJob(found));
      } catch {}
    })();
  }, [id]);

  if (!job)
    return (
      <div style={{ padding: 100, textAlign: "center", color: "var(--m1)" }}>
        Job not found.{" "}
        <Link to="/jobs" style={{ color: "var(--blue)" }}>
          Back to jobs →
        </Link>
      </div>
    );

  const handleFile = (f) => {
    if (f && (f.type === "application/pdf" || f.name.endsWith(".docx")))
      setFile(f);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !file) return;
    setSubmitting(true);
    setAiError(null);
    try {
      if (job._id) {
        // Real DB job — score & submit via main backend
        const { scoreResumeByJob, submitApplication } =
          await import("../../services/api");
        const scored = await scoreResumeByJob(job._id, file);
        // Normalize result shape — backend may return flat or nested under .result
        const raw = scored.result ?? scored;
        setAiResult({
          score: raw.score ?? raw.match_score ?? raw.percentage ?? 0,
          summary: raw.summary ?? raw.feedback ?? raw.analysis ?? "",
          strengths: raw.strengths ?? raw.pros ?? [],
          weaknesses: raw.weaknesses ?? raw.cons ?? raw.improvements ?? [],
        });
        if (!candidateUser) {
          console.warn(
            "User is not logged in — application will not appear in their portal.",
          );
        }
        try {
          await submitApplication(job._id, file);
        } catch (submitErr) {
          console.warn(
            "submitApplication failed (user may not be logged in):",
            submitErr,
          );
        }
      } else {
        // Demo/mock job — generate a simulated score for the preview
        const seed = file.name
          .split("")
          .reduce((a, c) => a + c.charCodeAt(0), 0);
        const demoScore = 62 + (seed % 28); // deterministic 62–89
        setAiResult({
          score: demoScore,
          summary:
            "Your resume was analysed against the job requirements. This is a simulated preview score — connect to the live backend for a real AI evaluation.",
          strengths: [
            "Strong keyword alignment with job description",
            "Relevant experience detected",
            "Clear formatting and structure",
          ],
          weaknesses: [
            "Some required skills could be highlighted more prominently",
            "Consider quantifying achievements with metrics",
          ],
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("AI scoring failed:", err);
      setAiError(
        "Could not connect to the AI service. Please check your connection and try again.",
      );
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const daysAgo = Math.floor((Date.now() - new Date(job.posted)) / 86400000);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <PublicNav />
      <div style={{ paddingTop: 100 }}>
        {/* Breadcrumb */}
        <div
          style={{
            padding: "20px 52px",
            borderBottom: "1px solid var(--b1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--m2)",
          }}
        >
          <Link
            to="/jobs"
            style={{ color: "var(--m2)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--m2)")}
          >
            Jobs
          </Link>
          <span>›</span>
          <span>{job.department}</span>
          <span>›</span>
          <span style={{ color: "var(--text)" }}>{job.title}</span>
        </div>

        <div style={{ display: "flex", gap: 0, maxWidth: "100%" }}>
          {/* Left - Job Content */}
          <div
            style={{
              flex: 1,
              padding: "48px 52px 80px",
              borderRight: "1px solid var(--b1)",
              maxWidth: "62%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <DeptTag dept={job.department} />
              <span
                className="pill"
                style={{
                  background: "var(--b1)",
                  color: "var(--m1)",
                  fontSize: 11,
                }}
              >
                {job.type}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 400,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                marginBottom: 20,
              }}
            >
              {job.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 20,
                fontSize: 13.5,
                color: "var(--m1)",
                marginBottom: 32,
                flexWrap: "wrap",
              }}
            >
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
              <span>👥 {job.applicants} applicants</span>
              <span>
                🕐 Posted {daysAgo === 0 ? "today" : `${daysAgo} days ago`}
              </span>
            </div>

            <div className="divider" />

            <Section title="About the role">
              <p
                style={{
                  fontSize: 15,
                  color: "var(--m1)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                {job.description}
              </p>
            </Section>

            <Section title="Responsibilities">
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {job.responsibilities.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 14.5,
                      color: "var(--m1)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: "var(--blue-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        color: "var(--blue)",
                        marginTop: 2,
                      }}
                    >
                      ✓
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Requirements">
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {job.requirements.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 14.5,
                      color: "var(--m1)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: "var(--violet-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        color: "var(--violet)",
                        marginTop: 2,
                      }}
                    >
                      →
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </Section>

            {job.nice && (
              <Section title="Nice to have">
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {job.nice.map((r, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        color: "var(--m2)",
                        paddingLeft: 16,
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          color: "var(--teal)",
                        }}
                      >
                        ◦
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Skills */}
            <Section title="Skills">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {job.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: "var(--s2)",
                      border: "1px solid var(--b2)",
                      fontSize: 13,
                      color: "var(--text)",
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            <JobAIChat job={job} />
          </div>

          {/* Right - Application Form */}
          <div
            style={{
              width: 420,
              flexShrink: 0,
              position: "sticky",
              top: 100,
              height: "calc(100vh - 100px)",
              overflowY: "auto",
              padding: "40px 40px 60px",
            }}
          >
            {submitted ? (
              <SuccessState
                job={job}
                navigate={navigate}
                aiResult={aiResult}
                aiError={aiError}
                candidateUser={candidateUser}
              />
            ) : !candidateUser ? (
              <AuthGate jobId={id} navigate={navigate} />
            ) : (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <h2
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Apply for this role
                  </h2>
                  <p style={{ fontSize: 13.5, color: "var(--m1)" }}>
                    AI will score your resume instantly. You'll hear back fast.
                  </p>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      className="input"
                      placeholder="Sara Ahmed"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="sara@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      className="input"
                      placeholder="+20 100 000 0000"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">LinkedIn</label>
                    <input
                      className="input"
                      placeholder="linkedin.com/in/your-profile"
                      value={form.linkedin}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, linkedin: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Cover Letter</label>
                    <textarea
                      className="input"
                      placeholder="Tell us why you're a great fit..."
                      value={form.cover}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cover: e.target.value }))
                      }
                      style={{ minHeight: 100 }}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="label">Resume * (PDF or DOCX)</label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                      }}
                      style={{
                        border: `2px dashed ${dragging ? "var(--blue)" : file ? "var(--teal)" : "var(--b3)"}`,
                        borderRadius: 10,
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        background: dragging
                          ? "var(--blue-dim)"
                          : file
                            ? "var(--teal-dim)"
                            : "var(--s2)",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.docx"
                        style={{ display: "none" }}
                        onChange={(e) => handleFile(e.target.files[0])}
                      />
                      {file ? (
                        <div>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>
                            📄
                          </div>
                          <div
                            style={{
                              fontSize: 13.5,
                              color: "var(--teal)",
                              fontWeight: 500,
                            }}
                          >
                            {file.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--m2)",
                              marginTop: 4,
                            }}
                          >
                            {(file.size / 1024).toFixed(0)} KB · Click to
                            replace
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 22, marginBottom: 8 }}>⬆</div>
                          <div style={{ fontSize: 13.5, color: "var(--m1)" }}>
                            Drop your resume here or{" "}
                            <span style={{ color: "var(--blue)" }}>browse</span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--m2)",
                              marginTop: 4,
                            }}
                          >
                            PDF or DOCX · Max 10MB
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!form.name || !form.email || !file || submitting}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "13px",
                      fontSize: 15,
                      borderRadius: 10,
                      opacity: !form.name || !form.email || !file ? 0.5 : 1,
                      cursor:
                        !form.name || !form.email || !file
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {submitting ? (
                      <>
                        <div
                          className="spinner"
                          style={{ width: 16, height: 16 }}
                        />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Application →"
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--m2)",
                      textAlign: "center",
                    }}
                  >
                    By applying you confirm AI will analyze your resume to score
                    your match for this role.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobAIChat({ job }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `Hi! I can answer specific questions about the **${job.title}** role. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const jobDesc = `${job.title}\n\nDepartment: ${job.department}\nLocation: ${job.location}\nSalary: ${job.salary}\n\n${job.description}\n\nRequirements:\n${job.requirements.join("\n")}\n\nNice to have:\n${(job.nice || []).join("\n")}`;

  const send = async (text) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { from: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    try {
      if (!job._id) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "AI chat is available for live job listings. Browse the Jobs page to find active postings.",
          },
        ]);
        return;
      }
      const { chatByJob } = await import("../../services/api");
      const data = await chatByJob(job._id, text.trim());
      const answer =
        data.result?.answer ||
        data.answer ||
        "I couldn't generate a response right now.";
      setMessages((prev) => [...prev, { from: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Sorry, I can't connect to the AI right now. Please check the job description above for details.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  };

  return (
    <div
      style={{
        marginTop: 32,
        border: "1px solid var(--b1)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--s1)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--b1)",
          background: "var(--s2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--grad)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          🤖
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            Ask about this role
          </div>
          <div style={{ fontSize: 11, color: "var(--teal)" }}>
            ● AI-powered · Knows this job description
          </div>
        </div>
      </div>
      <div
        style={{
          height: 240,
          overflowY: "auto",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "9px 13px",
                borderRadius:
                  m.from === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                background: m.from === "user" ? "var(--grad)" : "var(--s3)",
                border: m.from === "bot" ? "1px solid var(--b1)" : "none",
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--text)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--m2)",
                  animation: `chatDot 1.2s infinite ${i * 0.2}s ease-in-out`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--b1)",
          background: "var(--s2)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), send(input))
          }
          placeholder="e.g. What stack does this role use?"
          style={{
            flex: 1,
            background: "var(--s3)",
            border: "1px solid var(--b2)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            color: "var(--text)",
            outline: "none",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "var(--grad)",
            border: "none",
            color: "#fff",
            fontSize: 13,
            cursor: "pointer",
            opacity: !input.trim() || loading ? 0.4 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function AuthGate({ jobId, navigate }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 8px" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--blue-dim)",
          border: "1px solid rgba(91,142,248,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 26,
        }}
      >
        🔒
      </div>
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Sign in to Apply
      </h2>
      <p style={{ fontSize: 14, color: "var(--m1)", lineHeight: 1.7, marginBottom: 28 }}>
        Create a free account or log in to submit your application and track its status in your candidate portal.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/candidate/signup?redirect=/jobs/${jobId}`)}
          style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, borderRadius: 10 }}
        >
          Create Account →
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate(`/candidate/login?redirect=/jobs/${jobId}`)}
          style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14, borderRadius: 10 }}
        >
          Already have an account? Log in
        </button>
      </div>
      <p style={{ marginTop: 20, fontSize: 12, color: "var(--m2)" }}>
        You'll return to this job after signing in.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h3
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 16,
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function SuccessState({ job, navigate, aiResult, aiError, candidateUser }) {
  return (
    <div style={{ textAlign: "center", animation: "scaleIn 0.4s ease" }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--teal-dim)",
          border: "2px solid rgba(30,207,170,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 28,
        }}
      >
        ✓
      </div>
      <h2
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Application Submitted!
      </h2>
      {aiResult && (
        <div
          style={{
            marginTop: 24,
            padding: "20px 24px",
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            borderRadius: 12,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "var(--m2)",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Your AI Match Score
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                color:
                  aiResult.score >= 80
                    ? "var(--teal)"
                    : aiResult.score >= 60
                      ? "var(--amber)"
                      : "var(--red)",
              }}
            >
              {aiResult.score}
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--m2)" }}>out of 100</div>
              <div
                style={{
                  height: 6,
                  width: 120,
                  background: "var(--b1)",
                  borderRadius: 3,
                  marginTop: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${aiResult.score}%`,
                    height: "100%",
                    background:
                      aiResult.score >= 80
                        ? "var(--teal)"
                        : aiResult.score >= 60
                          ? "var(--amber)"
                          : "var(--red)",
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: "var(--m1)",
              fontStyle: "italic",
              marginBottom: 14,
            }}
          >
            {aiResult.summary}
          </div>
          {aiResult.strengths?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--teal)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                ✓ Strengths
              </div>
              {aiResult.strengths.map((s, i) => (
                <div
                  key={i}
                  style={{ fontSize: 13, color: "var(--m1)", marginBottom: 3 }}
                >
                  • {s}
                </div>
              ))}
            </div>
          )}
          {aiResult.weaknesses?.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--amber)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                △ Areas to improve
              </div>
              {aiResult.weaknesses.map((w, i) => (
                <div
                  key={i}
                  style={{ fontSize: 13, color: "var(--m1)", marginBottom: 3 }}
                >
                  • {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {aiError && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--red-dim)",
            border: "1px solid rgba(240,80,104,0.2)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--m1)",
          }}
        >
          ⚠️ {aiError}
        </div>
      )}
      <p
        style={{
          color: "var(--m1)",
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 8,
        }}
      >
        Your application for{" "}
        <strong style={{ color: "var(--text)" }}>{job.title}</strong> has been
        received.
      </p>
      <p
        style={{
          color: "var(--m1)",
          fontSize: 13.5,
          lineHeight: 1.7,
          marginBottom: 28,
        }}
      >
        {aiResult
          ? "Your AI match score is ready. We'll be in touch about next steps."
          : "Our AI is scoring your resume right now. You'll receive a confirmation email within minutes, and we'll be in touch about next steps."}
      </p>
      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          borderRadius: 10,
          padding: 16,
          marginBottom: 28,
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            color: "var(--m2)",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          What happens next
        </div>
        {[
          "AI scores your resume (instant)",
          "HR reviews your profile (1–3 days)",
          "You'll receive an email update",
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "6px 0",
              borderTop: i > 0 ? "1px solid var(--b1)" : "none",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--blue-dim)",
                color: "#8AB8FF",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 13, color: "var(--m1)" }}>{s}</span>
          </div>
        ))}
      </div>
      {!candidateUser && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            background: "var(--blue-dim)",
            border: "1px solid rgba(91,142,248,0.25)",
            borderRadius: 10,
            fontSize: 13.5,
            color: "var(--m1)",
            textAlign: "left",
            marginBottom: 16,
          }}
        >
          💡{" "}
          <strong style={{ color: "var(--text)" }}>
            Want to track this application?
          </strong>{" "}
          <Link to="/candidate/login" style={{ color: "var(--blue)" }}>
            Log in or create an account
          </Link>{" "}
          with the same email you used to apply.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          to="/candidate/login"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Track My Application →
        </Link>
        <Link
          to="/jobs"
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Browse More Jobs
        </Link>
      </div>
    </div>
  );
}
