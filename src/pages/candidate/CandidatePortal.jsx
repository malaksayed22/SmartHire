import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CANDIDATES } from "../../data/mock";

const PIPELINE = ["new", "reviewing", "shortlisted", "interview", "hired"];
const PIPELINE_LABELS = {
  new: "Applied",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  hired: "Hired",
};
const STAGE_ICONS = {
  new: "📨",
  reviewing: "🔍",
  shortlisted: "⭐",
  interview: "📅",
  hired: "🎉",
};

const EMAIL_TYPE_META = {
  confirmation: { icon: "📨", label: "Confirmation", color: "blue" },
  shortlist: { icon: "⭐", label: "Shortlisted", color: "teal" },
  interview: { icon: "📅", label: "Interview", color: "violet" },
  rejection: { icon: "✉️", label: "Status update", color: "red" },
};

export default function CandidatePortal() {
  const { candidateUser, logoutCandidate } = useAuth();
  const navigate = useNavigate();

  // Show Sara Ahmed's applications as demo
  const myApplications = CANDIDATES.filter(
    (c) => c.email === "sara.ahmed@email.com" || c.id === "c1" || c.id === "c5",
  ).slice(0, 2);

  const handleLogout = () => {
    logoutCandidate();
    navigate("/candidate/login");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Top nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          height: 64,
          background: "rgba(6,7,9,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--b1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 17,
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SmartHire
          </span>
        </Link>

        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--m1)",
          }}
        >
          My Applications
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}
            >
              {candidateUser?.name}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--m2)" }}>Candidate</div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </div>
      </nav>

      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              borderRadius: 100,
              background: "var(--teal-dim)",
              border: "1px solid rgba(30,207,170,0.2)",
              fontSize: 12,
              color: "var(--teal)",
              fontWeight: 500,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--teal)",
                animation: "pulse 2s infinite",
              }}
            />
            Portal active
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(32px,5vw,48px)",
              fontWeight: 400,
              letterSpacing: "-1.2px",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            Hi {candidateUser?.name?.split(" ")[0]},<br />
            <span
              style={{
                fontStyle: "italic",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              here's your pipeline.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--m1)", fontWeight: 300 }}>
            Track your applications, AI scores, and upcoming steps — all in one
            place.
          </p>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {[
            {
              label: "Applications",
              value: myApplications.length,
              color: "#5B8EF8",
            },
            {
              label: "Avg AI Score",
              value: Math.round(
                myApplications.reduce((a, c) => a + c.score, 0) /
                  myApplications.length,
              ),
              color: "#1ECFAA",
            },
            {
              label: "Emails Received",
              value: myApplications.reduce((a, c) => a + c.emails.length, 0),
              color: "#8B70F5",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: "16px 20px",
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
                  background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`,
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
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 28,
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

        {/* Application Cards */}
        <div
          style={{
            marginBottom: 20,
            fontFamily: "'Syne', sans-serif",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Your Applications
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {myApplications.map((app) => {
            const scoreColor =
              app.score >= 80
                ? "var(--teal)"
                : app.score >= 60
                  ? "var(--amber)"
                  : "var(--red)";
            const currentStageIdx = PIPELINE.indexOf(
              app.status === "rejected" ? "new" : app.status,
            );
            const isRejected = app.status === "rejected";

            return (
              <div key={app.id} className="card" style={{ overflow: "hidden" }}>
                {/* Card header */}
                <div
                  style={{
                    padding: "22px 26px",
                    borderBottom: "1px solid var(--b1)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 20,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 6,
                      }}
                    >
                      {app.appliedRole}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        fontSize: 13,
                        color: "var(--m1)",
                      }}
                    >
                      <span>📍 {app.location}</span>
                      <span>
                        📅 Applied{" "}
                        {new Date(app.appliedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--m2)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      AI Score
                    </div>
                    <div
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        fontFamily: "'Syne', sans-serif",
                        color: scoreColor,
                        lineHeight: 1,
                      }}
                    >
                      {app.score}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--m2)" }}>
                      / 100
                    </div>
                  </div>
                </div>

                {/* Pipeline timeline */}
                <div
                  style={{
                    padding: "22px 26px",
                    borderBottom: "1px solid var(--b1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "var(--m2)",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      marginBottom: 18,
                    }}
                  >
                    {isRejected ? "Application Status" : "Your Progress"}
                  </div>

                  {isRejected ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        background: "var(--red-dim)",
                        border: "1px solid rgba(240,80,104,0.2)",
                        borderRadius: 10,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>✉️</span>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--text)",
                            marginBottom: 3,
                          }}
                        >
                          Application not progressing
                        </div>
                        <div style={{ fontSize: 13, color: "var(--m1)" }}>
                          Thank you for applying. We'll keep your profile on
                          file for future opportunities.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                    >
                      {PIPELINE.map((stage, i) => {
                        const done = i <= currentStageIdx;
                        const active = i === currentStageIdx;
                        const lineIsFilled = i <= currentStageIdx;
                        return (
                          <React.Fragment key={stage}>
                            {i > 0 && (
                              <div
                                style={{
                                  flex: 1,
                                  height: 2,
                                  marginTop: 17,
                                  background: lineIsFilled
                                    ? "var(--grad)"
                                    : "var(--b1)",
                                  transition: "background 0.3s",
                                }}
                              />
                            )}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: done
                                    ? active
                                      ? "var(--blue)"
                                      : "var(--blue-dim)"
                                    : "var(--s2)",
                                  border: `2px solid ${done ? "var(--blue)" : "var(--b2)"}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: done ? 14 : 12,
                                  transition: "all 0.3s",
                                  boxShadow: active
                                    ? "0 0 16px rgba(91,142,248,0.4)"
                                    : "none",
                                }}
                              >
                                {done ? (
                                  active ? (
                                    STAGE_ICONS[stage]
                                  ) : (
                                    "✓"
                                  )
                                ) : (
                                  <span
                                    style={{ color: "var(--m3)", fontSize: 11 }}
                                  >
                                    {i + 1}
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: active ? 600 : 400,
                                  color: done
                                    ? active
                                      ? "var(--text)"
                                      : "var(--m1)"
                                    : "var(--m3)",
                                  textAlign: "center",
                                }}
                              >
                                {PIPELINE_LABELS[stage]}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Email History */}
                <div style={{ padding: "20px 26px" }}>
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "var(--m2)",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      marginBottom: 14,
                    }}
                  >
                    Emails received ({app.emails.length})
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {app.emails.map((email, i) => {
                      const meta =
                        EMAIL_TYPE_META[email.type] ||
                        EMAIL_TYPE_META.confirmation;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 14px",
                            background: "var(--s2)",
                            border: "1px solid var(--b1)",
                            borderRadius: 8,
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{meta.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 500,
                                color: "var(--text)",
                              }}
                            >
                              {email.subject}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--m2)",
                                marginTop: 2,
                              }}
                            >
                              Sent {email.sent} · Via n8n automation
                            </div>
                          </div>
                          <span
                            className={`pill pill-${meta.color}`}
                            style={{ fontSize: 10.5 }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Browse more jobs CTA */}
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            padding: "40px 32px",
            background: "var(--s1)",
            border: "1px solid var(--b1)",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 12 }}>🚀</div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Looking for more opportunities?
          </div>
          <p style={{ color: "var(--m1)", fontSize: 14, marginBottom: 20 }}>
            Browse all open positions and let AI match you to the best fit
            roles.
          </p>
          <Link
            to="/jobs"
            className="btn btn-primary"
            style={{ display: "inline-flex" }}
          >
            Browse Open Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}
