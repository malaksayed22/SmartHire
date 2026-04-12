import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav";

const STAGES = [
  {
    num: "01",
    phase: "Discovery",
    title: "Candidate finds the role",
    tagline: "The first impression is everything.",
    color: "var(--blue)",
    dimColor: "var(--blue-dim)",
    border: "rgba(91,142,248,0.2)",
    actor: "Candidate",
    actorColor: "blue",
    description:
      "A candidate discovers SmartHire through the public job board. They browse open roles filtered by department, type, and location. Each listing shows a detailed job description, required skills, salary range, and an application form — all designed to make a strong first impression and reduce drop-off.",
    actions: [
      {
        who: "Candidate",
        what: "Browses the public job board at smarthire.ai/jobs",
      },
      {
        who: "Candidate",
        what: "Filters by department, location, and job type",
      },
      {
        who: "Candidate",
        what: "Opens a job listing and reads the full description",
      },
      {
        who: "Candidate",
        what: "Asks the AI chatbot questions about the role if needed",
      },
    ],
    system: null,
  },
  {
    num: "02",
    phase: "Application",
    title: "Candidate applies",
    tagline: "One form. Two seconds to confirm.",
    color: "var(--violet)",
    dimColor: "var(--violet-dim)",
    border: "rgba(139,112,245,0.2)",
    actor: "Candidate",
    actorColor: "violet",
    description:
      "The candidate fills out the application form — name, email, phone, cover letter — and uploads their resume as PDF or DOCX. The moment they hit submit, two things happen simultaneously: the data is saved to the PostgreSQL database, and SmartHire fires a webhook to n8n to trigger the confirmation email workflow.",
    actions: [
      {
        who: "Candidate",
        what: "Fills the application form (name, email, phone, cover letter)",
      },
      {
        who: "Candidate",
        what: "Uploads resume via drag-and-drop (PDF or DOCX)",
      },
      { who: "System", what: "Stores application in PostgreSQL database" },
      {
        who: "System",
        what: "Fires webhook to n8n → confirmation email sent in under 10 seconds",
      },
    ],
    system:
      "n8n Workflow 1 fires: Application Received → Gmail sends confirmation to candidate",
  },
  {
    num: "03",
    phase: "AI Scoring",
    title: "AI reads and scores the resume",
    tagline: "Every resume ranked before HR opens a tab.",
    color: "var(--teal)",
    dimColor: "var(--teal-dim)",
    border: "rgba(30,207,170,0.2)",
    actor: "System",
    actorColor: "teal",
    description:
      "Immediately after the application is stored, the AI agent is triggered. It extracts text from the uploaded file, identifies skills, job titles, years of experience, and education. It then semantically compares the extracted profile against the job description using NLP, producing a 0–100 match score. This entire process takes under 2 seconds.",
    actions: [
      { who: "AI Agent", what: "Extracts text from PDF or DOCX resume file" },
      {
        who: "AI Agent",
        what: "Identifies skills, experience, job titles, and education",
      },
      {
        who: "AI Agent",
        what: "Compares candidate profile against job description semantics",
      },
      { who: "AI Agent", what: "Writes 0–100 match score to database" },
      {
        who: "System",
        what: "Candidate appears in HR dashboard ranked by score",
      },
    ],
    system:
      "Python (spaCy + OpenAI) processes resume → score stored → HR dashboard updates live",
  },
  {
    num: "04",
    phase: "HR Review",
    title: "HR reviews ranked candidates",
    tagline: "Best candidates already at the top.",
    color: "var(--amber)",
    dimColor: "var(--amber-dim)",
    border: "rgba(240,160,48,0.2)",
    actor: "HR Manager",
    actorColor: "amber",
    description:
      "The HR manager opens the dashboard and sees all candidates sorted by AI score — highest match first. For each candidate, they can view the full resume, score breakdown by category (skills, experience, education), HR notes, and the full email history. With one click they update the status: Shortlisted, Rejected, or moved to Interview.",
    actions: [
      { who: "HR", what: "Opens HR dashboard and views ranked candidate list" },
      {
        who: "HR",
        what: "Clicks a candidate to view resume, score breakdown, and notes",
      },
      {
        who: "HR",
        what: "Updates candidate status (Shortlist / Reject / Interview)",
      },
      { who: "System", what: "Status change fires a new webhook to n8n" },
    ],
    system: null,
  },
  {
    num: "05",
    phase: "Automation",
    title: "n8n fires the right workflow",
    tagline: "Zero emails sent manually. Ever.",
    color: "var(--blue)",
    dimColor: "var(--blue-dim)",
    border: "rgba(91,142,248,0.2)",
    actor: "System",
    actorColor: "blue",
    description:
      "Every status change in the HR dashboard triggers a webhook to n8n. n8n reads the status and routes to the correct workflow: shortlisted candidates receive an interview invitation with a calendar link; rejected candidates receive a polite closure email; hired candidates receive an offer confirmation. All emails are pre-templated and sent automatically via Gmail.",
    actions: [
      {
        who: "n8n",
        what: "Receives webhook from SmartHire with candidate + status data",
      },
      { who: "n8n", what: "Routes to correct workflow based on status value" },
      { who: "n8n", what: "Sends email via Gmail node using correct template" },
      {
        who: "System",
        what: "Email logged in candidate email history in dashboard",
      },
    ],
    system:
      "n8n Workflow 2 or 3 fires depending on status → Gmail sends the correct email",
  },
  {
    num: "06",
    phase: "Candidate Tracking",
    title: "Candidate tracks their progress",
    tagline: "Full transparency. No chasing HR.",
    color: "var(--teal)",
    dimColor: "var(--teal-dim)",
    border: "rgba(30,207,170,0.2)",
    actor: "Candidate",
    actorColor: "teal",
    description:
      "Candidates log into the candidate portal to see their AI match score, their current stage in the pipeline (Applied → Reviewing → Shortlisted → Interview → Hired), and every email sent to them. No more wondering. No more chasing HR for updates. The entire pipeline is transparent and up-to-date in real time.",
    actions: [
      { who: "Candidate", what: "Logs into the candidate portal" },
      {
        who: "Candidate",
        what: "Views their AI match score for each applied role",
      },
      {
        who: "Candidate",
        what: "Tracks progress through the pipeline stages visually",
      },
      {
        who: "Candidate",
        what: "Reads every automated email in their email history",
      },
    ],
    system: null,
  },
];

const ACTOR_COLORS = {
  Candidate: {
    bg: "var(--blue-dim)",
    text: "#8AB8FF",
    border: "rgba(91,142,248,0.2)",
  },
  "HR Manager": {
    bg: "var(--amber-dim)",
    text: "var(--amber)",
    border: "rgba(240,160,48,0.2)",
  },
  System: {
    bg: "var(--teal-dim)",
    text: "var(--teal)",
    border: "rgba(30,207,170,0.2)",
  },
  "AI Agent": {
    bg: "var(--violet-dim)",
    text: "#B09DF9",
    border: "rgba(139,112,245,0.2)",
  },
  n8n: {
    bg: "rgba(255,108,55,0.1)",
    text: "#FF6C37",
    border: "rgba(255,108,55,0.2)",
  },
  HR: {
    bg: "var(--amber-dim)",
    text: "var(--amber)",
    border: "rgba(240,160,48,0.2)",
  },
};

const AUTOMATIONS = [
  {
    trigger: "Application submitted",
    action: "Confirmation email",
    desc: "Sent to candidate immediately on submit",
    color: "var(--blue)",
  },
  {
    trigger: "Status → Shortlisted",
    action: "Interview invitation",
    desc: "Includes calendar link and interview details",
    color: "var(--teal)",
  },
  {
    trigger: "Status → Rejected",
    action: "Closure email",
    desc: "Polite, professional rejection notification",
    color: "var(--red)",
  },
  {
    trigger: "Status → Hired",
    action: "Offer confirmation",
    desc: "Congratulations email with next steps",
    color: "var(--green)",
  },
];

export default function HowItWorks() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = STAGES[activeStage];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <PublicNav />

      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 700px 350px at 50% 0%, rgba(30,207,170,0.05) 0%, transparent 70%)",
        }}
      />

      {/* ─── HERO ─── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "130px 52px 80px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            borderRadius: 100,
            border: "1px solid rgba(30,207,170,0.2)",
            background: "rgba(30,207,170,0.06)",
            marginBottom: 28,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--teal)",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--teal)",
              animation: "pulse 2s infinite",
            }}
          />
          How It Works
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(48px, 8vw, 88px)",
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: "-2.5px",
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          From application
          <br />
          <span
            style={{
              fontStyle: "italic",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              paddingRight: 8,
            }}
          >
            to hired — automated.
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: "var(--m1)",
            fontWeight: 300,
            maxWidth: 520,
            lineHeight: 1.75,
            marginBottom: 44,
          }}
        >
          Six stages. Three actors. Zero manual emails. Here is exactly what
          happens inside SmartHire from the moment a candidate applies.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to="/jobs"
            className="btn btn-primary"
            style={{ padding: "12px 26px", fontSize: 14.5, borderRadius: 10 }}
          >
            Apply for a Role →
          </Link>
          <Link
            to="/features"
            className="btn btn-ghost"
            style={{ padding: "12px 26px", fontSize: 14.5, borderRadius: 10 }}
          >
            Explore Features
          </Link>
        </div>
      </section>

      {/* ─── ACTORS LEGEND ─── */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "0 52px 72px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--blue)",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--blue)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              Three actors
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {[
              {
                label: "Candidate",
                desc: "Applies, tracks, receives updates.",
                color: "var(--blue)",
                dimColor: "var(--blue-dim)",
                border: "rgba(91,142,248,0.2)",
                icon: "◈",
              },
              {
                label: "HR Manager",
                desc: "Reviews ranked list, updates statuses.",
                color: "var(--amber)",
                dimColor: "var(--amber-dim)",
                border: "rgba(240,160,48,0.2)",
                icon: "◎",
              },
              {
                label: "System / AI",
                desc: "Scores resumes, fires automations, sends emails.",
                color: "var(--teal)",
                dimColor: "var(--teal-dim)",
                border: "rgba(30,207,170,0.2)",
                icon: "▦",
              },
            ].map((a, i) => (
              <div
                key={i}
                style={{
                  background: "var(--s1)",
                  border: `1px solid ${a.border}`,
                  borderRadius: 14,
                  padding: "22px 24px",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: a.dimColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: a.color,
                    flexShrink: 0,
                  }}
                >
                  {a.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 5,
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--m1)",
                      lineHeight: 1.55,
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE STAGE WALKTHROUGH ─── */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "0 52px 100px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--violet)",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--violet)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              Step by step
            </span>
          </div>

          {/* Stage progress bar */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 40,
              background: "var(--s1)",
              border: "1px solid var(--b1)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {STAGES.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                style={{
                  flex: 1,
                  padding: "12px 4px",
                  border: "none",
                  cursor: "pointer",
                  background: activeStage === i ? "var(--s3)" : "transparent",
                  borderRight:
                    i < STAGES.length - 1 ? "1px solid var(--b1)" : "none",
                  transition: "background 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  position: "relative",
                }}
              >
                {activeStage === i && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: s.color,
                      transition: "background 0.3s",
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: activeStage === i ? "var(--text)" : "var(--m3)",
                  }}
                >
                  {s.num}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: activeStage === i ? "var(--m1)" : "var(--m3)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    padding: "0 4px",
                  }}
                >
                  {s.phase}
                </span>
              </button>
            ))}
          </div>

          {/* Active stage detail */}
          <div
            key={activeStage}
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: 20,
              animation: "fadeIn 0.3s ease both",
            }}
          >
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "var(--s1)",
                  border: `1px solid ${stage.border}`,
                  borderRadius: 18,
                  padding: "40px 38px",
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
                    height: 3,
                    background: `linear-gradient(90deg, ${stage.color}, transparent)`,
                  }}
                />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "4px 12px",
                    borderRadius: 100,
                    background: stage.dimColor,
                    marginBottom: 24,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: stage.color,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Phase {stage.num} · {stage.phase}
                </div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "clamp(26px, 3vw, 38px)",
                    fontWeight: 400,
                    letterSpacing: "-0.8px",
                    lineHeight: 1.15,
                    marginBottom: 8,
                  }}
                >
                  {stage.title}
                </h2>
                <div
                  style={{
                    fontSize: 14.5,
                    color: "var(--m1)",
                    fontStyle: "italic",
                    marginBottom: 20,
                    fontWeight: 300,
                  }}
                >
                  {stage.tagline}
                </div>
                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--m1)",
                    lineHeight: 1.8,
                    fontWeight: 300,
                  }}
                >
                  {stage.description}
                </p>

                {stage.system && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: "12px 16px",
                      background: "var(--s2)",
                      border: "1px solid var(--b2)",
                      borderRadius: 9,
                      borderLeft: `3px solid ${stage.color}`,
                      fontSize: 12.5,
                      color: "var(--m1)",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                    }}
                  >
                    ⚡ {stage.system}
                  </div>
                )}
              </div>

              {/* Nav buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                  disabled={activeStage === 0}
                  className="btn btn-ghost"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    opacity: activeStage === 0 ? 0.3 : 1,
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setActiveStage(Math.min(STAGES.length - 1, activeStage + 1))
                  }
                  disabled={activeStage === STAGES.length - 1}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    opacity: activeStage === STAGES.length - 1 ? 0.3 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Right — actions */}
            <div
              style={{
                background: "var(--s1)",
                border: "1px solid var(--b1)",
                borderRadius: 18,
                padding: "32px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--m3)",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  marginBottom: 24,
                }}
              >
                What happens in this step
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {stage.actions.map((a, i) => {
                  const ac = ACTOR_COLORS[a.who] || ACTOR_COLORS.System;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 16,
                        paddingBottom: i < stage.actions.length - 1 ? 20 : 0,
                        marginBottom: i < stage.actions.length - 1 ? 20 : 0,
                        borderBottom:
                          i < stage.actions.length - 1
                            ? "1px solid var(--b1)"
                            : "none",
                        position: "relative",
                      }}
                    >
                      {i < stage.actions.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            left: 15,
                            top: 30,
                            bottom: -20,
                            width: 1,
                            background: "var(--b1)",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: ac.bg,
                          border: `1px solid ${ac.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: ac.text,
                            fontFamily: "'Syne', sans-serif",
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                      <div style={{ paddingTop: 4 }}>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: ac.bg,
                            border: `1px solid ${ac.border}`,
                            fontSize: 10,
                            fontWeight: 700,
                            color: ac.text,
                            fontFamily: "'Syne', sans-serif",
                            textTransform: "uppercase",
                            letterSpacing: "0.7px",
                            marginBottom: 6,
                          }}
                        >
                          {a.who}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "var(--m1)",
                            lineHeight: 1.6,
                          }}
                        >
                          {a.what}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stage indicator dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: "auto",
                  paddingTop: 28,
                }}
              >
                {STAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStage(i)}
                    style={{
                      width: i === activeStage ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      border: "none",
                      background: i === activeStage ? stage.color : "var(--b2)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div
        style={{
          margin: "0 52px",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--b2), transparent)",
        }}
      />

      {/* ─── FULL LINEAR FLOW (visual summary) ─── */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "80px 52px 100px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--amber)",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--amber)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              Complete flow
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 400,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: 52,
            }}
          >
            The full pipeline at a<br />
            <span
              style={{
                fontStyle: "italic",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                paddingRight: 6,
              }}
            >
              glance.
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {STAGES.map((s, i) => (
              <div
                key={i}
                onClick={() => setActiveStage(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "18px 24px",
                  borderRadius: 12,
                  border: "1px solid var(--b1)",
                  background: "var(--s1)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.border;
                  e.currentTarget.style.background = "var(--s2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--b1)";
                  e.currentTarget.style.background = "var(--s1)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: s.dimColor,
                    border: `1px solid ${s.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: s.color,
                    flexShrink: 0,
                  }}
                >
                  {s.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 3,
                    }}
                  >
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--m2)" }}>
                    {s.tagline}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 100,
                      background: s.dimColor,
                      fontSize: 11,
                      fontWeight: 600,
                      color: s.color,
                      fontFamily: "'Syne', sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    {s.phase}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div
        style={{
          margin: "0 52px",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--b2), transparent)",
        }}
      />

      {/* ─── AUTOMATION FLOWS ─── */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "80px 52px 100px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                height: 1,
                width: 32,
                background: "var(--teal)",
                opacity: 0.6,
              }}
            />
            <span
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "var(--teal)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              n8n Automations
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 400,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            Every trigger.
            <br />
            <span
              style={{
                fontStyle: "italic",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                paddingRight: 6,
              }}
            >
              Every email. Automatic.
            </span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--m1)",
              fontWeight: 300,
              maxWidth: 480,
              lineHeight: 1.7,
              marginBottom: 48,
            }}
          >
            Four automated workflows run 24/7 via n8n. The moment SmartHire
            fires the webhook, the email is on its way.
          </p>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {AUTOMATIONS.map((a, i) => (
              <div
                key={i}
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--b1)",
                  borderRadius: 14,
                  padding: "24px 26px",
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: a.color,
                    borderRadius: "14px 0 0 14px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "var(--m3)",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Trigger
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "var(--m1)",
                      marginBottom: 16,
                      padding: "7px 12px",
                      background: "var(--s2)",
                      borderRadius: 7,
                      border: "1px solid var(--b1)",
                    }}
                  >
                    {a.trigger}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "var(--m3)",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Action
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 5,
                    }}
                  >
                    {a.action}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--m2)" }}>
                    {a.desc}
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${a.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  ⚡
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{ margin: "0 52px 80px", position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            background: "var(--s1)",
            border: "1px solid var(--b1)",
            borderRadius: 20,
            padding: "70px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -80,
              top: "50%",
              transform: "translateY(-50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(30,207,170,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -80,
              top: "50%",
              transform: "translateY(-50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(91,142,248,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 400,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              marginBottom: 16,
              padding: "0 24px",
            }}
          >
            Ready to see it
            <br />
            <span
              style={{
                fontStyle: "italic",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                paddingRight: 8,
              }}
            >
              in action?
            </span>
          </h2>
          <p
            style={{
              color: "var(--m1)",
              fontSize: 16,
              fontWeight: 300,
              marginBottom: 36,
            }}
          >
            The HR dashboard is live with mock data. Walk through the full flow
            yourself.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              to="/hr/login"
              className="btn btn-primary"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
            >
              Open HR Dashboard →
            </Link>
            <Link
              to="/jobs"
              className="btn btn-ghost"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "28px 52px",
          borderTop: "1px solid var(--b1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
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
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            ["/jobs", "Browse Jobs"],
            ["/features", "Features"],
            ["/hr/login", "HR Portal"],
          ].map(([href, label]) => (
            <Link
              key={href}
              to={href}
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--m2)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: 8,
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#7AACFF";
                e.target.style.background = "rgba(91,142,248,0.08)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--m2)";
                e.target.style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--m3)" }}>
          AI Recruitment System · 2026
        </div>
      </footer>
    </div>
  );
}
