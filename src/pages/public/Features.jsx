import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav";

const PILLARS = [
  {
    num: "01",
    tag: "Core Intelligence",
    title: "AI Recruitment Agent",
    subtitle: "Reads every resume so you never have to.",
    body: "When a candidate submits their application, SmartHire's AI agent immediately parses their PDF or Word resume, extracts structured data — skills, years of experience, education, job titles — and cross-references it against the job description. The result is a 0–100 match score assigned to every candidate before a single human reviews anything.",
    details: [
      { label: "Supported formats", value: "PDF, DOCX, plain text" },
      { label: "Analysis time", value: "Under 2 seconds per resume" },
      { label: "Score range", value: "0 to 100 match score" },
      { label: "Ranking", value: "Automatic — best first" },
    ],
    bullets: [
      "Extracts skills, experience, education, and job titles automatically",
      "Compares candidate profile against job description semantics",
      "Ranks all applicants from highest to lowest match",
      "AI chatbot answers candidate questions 24/7 without HR involvement",
      "Handles Arabic and English resumes natively",
    ],
    color: "var(--blue)",
    dimColor: "var(--blue-dim)",
    accentBorder: "rgba(91,142,248,0.25)",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="16" cy="16" r="3" />
        <circle cx="16" cy="5" r="2" />
        <circle cx="27" cy="16" r="2" />
        <circle cx="16" cy="27" r="2" />
        <circle cx="5" cy="16" r="2" />
        <line x1="16" y1="8" x2="16" y2="13" />
        <line x1="24" y1="16" x2="19" y2="16" />
        <line x1="16" y1="19" x2="16" y2="24" />
        <line x1="8" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    num: "02",
    tag: "Zero-Touch Workflows",
    title: "n8n Workflow Automation",
    subtitle: "Every email sent. Zero manual effort.",
    body: "SmartHire integrates with n8n — a self-hosted automation platform — via webhooks. Every time a candidate status changes inside the HR dashboard, SmartHire fires an event that n8n catches and acts on immediately. This means confirmation emails, interview invitations, and status updates all happen automatically, the moment the trigger fires.",
    details: [
      { label: "Engine", value: "n8n (self-hosted)" },
      { label: "Integration", value: "Webhook-based, real-time" },
      { label: "Email provider", value: "Gmail via n8n node" },
      { label: "Workflows active", value: "3 end-to-end flows" },
    ],
    bullets: [
      "Application received → confirmation email sent instantly",
      "Candidate shortlisted → interview invitation + calendar link",
      "Status changed → custom email per status (rejected, hired, etc.)",
      "All flows are toggle-able and testable from the HR dashboard",
      "Full audit log of every email sent and when",
    ],
    color: "var(--violet)",
    dimColor: "var(--violet-dim)",
    accentBorder: "rgba(139,112,245,0.25)",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="var(--violet)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="9" x2="18" y2="9" />
        <line x1="18" y1="9" x2="18" y2="11" />
        <line x1="18" y1="11" x2="26" y2="11" />
        <line x1="6" y1="16" x2="14" y2="16" />
        <line x1="14" y1="16" x2="14" y2="18" />
        <line x1="14" y1="18" x2="26" y2="18" />
        <line x1="6" y1="23" x2="20" y2="23" />
        <line x1="20" y1="23" x2="20" y2="21" />
        <line x1="20" y1="21" x2="26" y2="21" />
      </svg>
    ),
  },
  {
    num: "03",
    tag: "Real-Time Intelligence",
    title: "Analytics Dashboard",
    subtitle: "Your entire pipeline. One screen.",
    body: "The HR analytics dashboard gives hiring managers a live view of their recruitment funnel — from raw application count to AI score distributions, weekly trends, and per-role breakdowns. Every number updates in real time as candidates apply and statuses change. Export to PDF or Excel in one click for stakeholder reports.",
    details: [
      { label: "Data refresh", value: "Real-time, on action" },
      { label: "Charts", value: "Bar, line, pie, distribution" },
      { label: "Export", value: "PDF and Excel, one click" },
      { label: "Scope", value: "Per-role and global view" },
    ],
    bullets: [
      "KPI cards: total applicants, shortlisted, avg AI score, emails sent",
      "Weekly application and shortlisting trend chart",
      "Pipeline status distribution (pie chart by stage)",
      "AI score distribution across all candidates",
      "Applicants-by-department horizontal bar chart",
      "Top performing candidates ranked table",
    ],
    color: "var(--teal)",
    dimColor: "var(--teal-dim)",
    accentBorder: "rgba(30,207,170,0.25)",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" y1="28" x2="28" y2="28" />
        <rect x="7" y="18" width="5" height="10" rx="1" />
        <rect x="14" y="10" width="5" height="18" rx="1" />
        <rect x="21" y="14" width="5" height="14" rx="1" />
      </svg>
    ),
  },
];

const SECONDARY = [
  {
    tag: "Candidate Experience",
    title: "Public Job Board",
    body: 'A filterable, searchable public-facing job board. Candidates browse open roles by department, type, and location. Each job card shows key info, required skills, and a direct "Apply Now" link. Designed to make a strong first impression.',
    color: "var(--blue)",
    dimColor: "var(--blue-dim)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    tag: "Hiring Intelligence",
    title: "HR Control Panel",
    body: "Post new jobs, manage all candidates across roles, update statuses, and watch automation handle the communication. A unified control center for your entire hiring operation.",
    color: "var(--amber)",
    dimColor: "var(--amber-dim)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--amber)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    tag: "Candidate Self-Service",
    title: "Application Portal",
    body: "Candidates log in to see their AI score, track their progress through the pipeline stages, and view every email sent to them. Full transparency with zero HR effort.",
    color: "var(--teal)",
    dimColor: "var(--teal-dim)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--teal)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="13" y2="14" />
      </svg>
    ),
  },
  {
    tag: "Natural Language",
    title: "AI Chatbot",
    body: "An embedded chatbot on every job listing answers candidate questions about requirements, the team, and the application process — automatically, in natural language, any time of day.",
    color: "var(--violet)",
    dimColor: "var(--violet-dim)",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--violet)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="15" height="10" rx="2" />
        <line x1="7" y1="9" x2="14" y2="9" />
        <line x1="7" y1="12" x2="11" y2="12" />
        <polyline points="6,15 6,19 10,15" />
      </svg>
    ),
  },
];

const TECH = [
  {
    name: "React.js",
    role: "Frontend UI",
    color: "#61DAFB",
    note: "Component-based SPA with React Router v6",
  },
  {
    name: "Node.js + Express",
    role: "Backend API",
    color: "#68A063",
    note: "REST API, file handling, webhook dispatcher",
  },
  {
    name: "Python + spaCy",
    role: "AI Agent",
    color: "#3776AB",
    note: "NLP resume parsing and scoring engine",
  },
  {
    name: "OpenAI API",
    role: "LLM Layer",
    color: "#10A37F",
    note: "Semantic matching and chatbot responses",
  },
  {
    name: "n8n",
    role: "Automation",
    color: "#FF6C37",
    note: "Self-hosted, connected via webhooks",
  },
  {
    name: "PostgreSQL",
    role: "Database",
    color: "#336791",
    note: "All candidates, jobs, and applications",
  },
  {
    name: "Docker",
    role: "Containers",
    color: "#2496ED",
    note: "Consistent environments across dev and prod",
  },
  {
    name: "Railway",
    role: "Deployment",
    color: "#B835FF",
    note: "Cloud hosting — free tier, CI/CD ready",
  },
];

export default function Features() {
  const [activePillar, setActivePillar] = useState(0);
  const pillar = PILLARS[activePillar];

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
            "radial-gradient(ellipse 700px 350px at 50% 0%, rgba(91,142,248,0.07) 0%, transparent 70%)",
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
            border: "1px solid rgba(91,142,248,0.2)",
            background: "rgba(91,142,248,0.06)",
            marginBottom: 28,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "#8AB8FF",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--blue)",
            }}
          />
          Platform Features
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
          Everything you need to
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
            hire without friction.
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
          Six integrated features — from AI resume scoring to zero-touch email
          automation — working as one unified system.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to="/jobs"
            className="btn btn-primary"
            style={{ padding: "12px 26px", fontSize: 14.5, borderRadius: 10 }}
          >
            Browse Open Roles →
          </Link>
          <Link
            to="/hr/login"
            className="btn btn-ghost"
            style={{ padding: "12px 26px", fontSize: 14.5, borderRadius: 10 }}
          >
            Access HR Dashboard
          </Link>
        </div>
      </section>

      {/* ─── THREE CORE PILLARS (interactive) ─── */}
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
              Core Pillars
            </span>
          </div>

          {/* Pillar selector tabs */}
          <div
            style={{
              display: "flex",
              gap: 2,
              marginBottom: 40,
              background: "var(--s1)",
              border: "1px solid var(--b1)",
              borderRadius: 12,
              padding: 4,
              alignSelf: "flex-start",
              width: "fit-content",
            }}
          >
            {PILLARS.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePillar(i)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 9,
                  background: activePillar === i ? "var(--s3)" : "transparent",
                  border:
                    activePillar === i
                      ? "1px solid var(--b2)"
                      : "1px solid transparent",
                  color: activePillar === i ? "var(--text)" : "var(--m2)",
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: activePillar === i ? 700 : 500,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ opacity: 0.5, marginRight: 8, fontSize: 11 }}>
                  {p.num}
                </span>
                {p.title.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>

          {/* Active pillar detail */}
          <div
            key={activePillar}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              animation: "fadeIn 0.3s ease both",
            }}
          >
            {/* Left — description */}
            <div
              style={{
                background: "var(--s1)",
                border: `1px solid ${pillar.accentBorder}`,
                borderRadius: 18,
                padding: "44px 40px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: pillar.dimColor,
                  marginBottom: 28,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: pillar.color,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                }}
              >
                {pillar.icon}
                {pillar.tag}
              </div>

              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--m3)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: 14,
                }}
              >
                Pillar {pillar.num}
              </div>

              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 400,
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                {pillar.title}
              </h2>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--m1)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  marginBottom: 20,
                }}
              >
                {pillar.subtitle}
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  color: "var(--m1)",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                {pillar.body}
              </p>
            </div>

            {/* Right — details + bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Spec grid */}
              <div
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--b1)",
                  borderRadius: 14,
                  padding: "24px 26px",
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
                    marginBottom: 16,
                  }}
                >
                  Specifications
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {pillar.details.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 14px",
                        background: "var(--s2)",
                        border: "1px solid var(--b1)",
                        borderRadius: 9,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.7px",
                          color: "var(--m3)",
                          fontFamily: "'Syne', sans-serif",
                          fontWeight: 600,
                          marginBottom: 5,
                        }}
                      >
                        {d.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "var(--text)",
                          fontWeight: 500,
                        }}
                      >
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullets */}
              <div
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--b1)",
                  borderRadius: 14,
                  padding: "24px 26px",
                  flex: 1,
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
                    marginBottom: 16,
                  }}
                >
                  What it does
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {pillar.bullets.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: pillar.dimColor,
                          border: `1px solid ${pillar.accentBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke={pillar.color}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: 13.5,
                          color: "var(--m1)",
                          lineHeight: 1.6,
                        }}
                      >
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar navigation dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 32,
            }}
          >
            {PILLARS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePillar(i)}
                style={{
                  width: i === activePillar ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  background: i === activePillar ? "var(--blue)" : "var(--b2)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
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

      {/* ─── SECONDARY FEATURES ─── */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "80px 52px 100px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 48,
            }}
          >
            <div>
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
                  Supporting Features
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(28px, 4vw, 46px)",
                  fontWeight: 400,
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                The rest of the
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
                  platform.
                </span>
              </h2>
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {SECONDARY.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--b1)",
                  borderRadius: 16,
                  padding: "30px 32px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--b2)";
                  e.currentTarget.style.background = "var(--s2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--b1)";
                  e.currentTarget.style.background = "var(--s1)";
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 10px",
                    borderRadius: 100,
                    background: f.dimColor,
                    marginBottom: 20,
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: f.color,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {f.icon}
                  {f.tag}
                </div>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 19,
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.3px",
                    marginBottom: 12,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--m1)",
                    lineHeight: 1.75,
                    fontWeight: 300,
                  }}
                >
                  {f.body}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: -24,
                    right: -24,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: f.color,
                    opacity: 0.05,
                  }}
                />
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

      {/* ─── TECH STACK ─── */}
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
              Technology
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
            Built with tools
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
              companies actually use.
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
            Every piece of the stack was chosen for real-world relevance — not
            academic convenience.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {TECH.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--b1)",
                  borderRadius: 12,
                  padding: "20px 20px",
                  transition: "border-color 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--b2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--b1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: t.color,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "var(--m2)",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {t.role}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--m2)",
                    lineHeight: 1.5,
                  }}
                >
                  {t.note}
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
                "radial-gradient(circle, rgba(91,142,248,0.07) 0%, transparent 70%)",
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
                "radial-gradient(circle, rgba(139,112,245,0.07) 0%, transparent 70%)",
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
            See it working in
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
              real time.
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
            Log into the HR dashboard and explore a live system with real mock
            data.
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
              to="/how-it-works"
              className="btn btn-ghost"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
            >
              See how it works
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
            ["/hr/login", "HR Portal"],
            ["/how-it-works", "How it Works"],
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
