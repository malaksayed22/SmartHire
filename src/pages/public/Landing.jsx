import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import { CANDIDATES, WEEKLY_DATA } from "../../data/mock";

const FEATURES = [
  {
    num: "01",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="3" />
        <line x1="14.12" y1="9.88" x2="18.36" y2="5.64" />
        <circle cx="18.36" cy="5.64" r="1.5" />
        <line x1="9.88" y1="9.88" x2="5.64" y2="5.64" />
        <circle cx="5.64" cy="5.64" r="1.5" />
        <line x1="14.12" y1="14.12" x2="18.36" y2="18.36" />
        <circle cx="18.36" cy="18.36" r="1.5" />
        <line x1="9.88" y1="14.12" x2="5.64" y2="18.36" />
        <circle cx="5.64" cy="18.36" r="1.5" />
      </svg>
    ),
    title: "AI Recruitment Agent",
    body: "Parses PDF and Word resumes in under 2 seconds, extracts skills and experience, then produces a 0–100 match score. Every candidate ranked before HR reads a single line.",
    color: "var(--blue)",
  },
  {
    num: "02",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <line x1="2" y1="7" x2="18" y2="7" />
        <line x1="18" y1="7" x2="18" y2="10" />
        <line x1="2" y1="12" x2="14" y2="12" />
        <line x1="14" y1="12" x2="14" y2="15" />
        <line x1="2" y1="17" x2="20" y2="17" />
        <line x1="20" y1="17" x2="20" y2="20" />
      </svg>
    ),
    title: "n8n Workflow Automation",
    body: "Every status change triggers the right email automatically — confirmation, interview invite, offer, rejection. Zero manual effort. Zero delays. Runs 24/7.",
    color: "var(--violet)",
  },
  {
    num: "03",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <line x1="2" y1="22" x2="22" y2="22" />
        <rect x="4" y="10" width="4" height="12" />
        <rect x="10" y="4" width="4" height="18" />
        <rect x="16" y="14" width="4" height="8" />
      </svg>
    ),
    title: "Analytics Dashboard",
    body: "Real-time KPIs, weekly charts, AI score trends, and one-click PDF/Excel export. Your entire hiring pipeline made visible in one screen.",
    color: "var(--teal)",
  },
  {
    num: "04",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <rect x="2" y="4" width="20" height="13" rx="4" />
        <line x1="6" y1="9" x2="18" y2="9" />
        <line x1="6" y1="13" x2="13" y2="13" />
      </svg>
    ),
    title: "AI Candidate Chatbot",
    body: "Candidates ask questions about the role, requirements, and process. The AI answers instantly — 24/7 — without any HR involvement required.",
    color: "var(--amber)",
  },
  {
    num: "05",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="8" height="8" rx="1" />
      </svg>
    ),
    title: "Public Job Board",
    body: "A polished, filterable job board where candidates browse open roles and apply with a beautiful drag-and-drop form. First impressions matter.",
    color: "var(--blue)",
  },
  {
    num: "06",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--blue)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
    title: "HR Control Panel",
    body: "Post jobs, review AI-ranked candidates, update statuses, schedule interviews, and watch automation handle the rest from one unified dashboard.",
    color: "var(--teal)",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Candidate applies",
    desc: "Fills the form, uploads resume. Confirmation email fires within seconds via n8n.",
    tag: "Automated",
    tagColor: "blue",
    active: true,
  },
  {
    num: "02",
    title: "AI reads & scores",
    desc: "Python agent parses the resume, extracts skills, and produces a 0–100 match score instantly.",
    tag: "AI-powered",
    tagColor: "violet",
  },
  {
    num: "03",
    title: "HR reviews ranking",
    desc: "HR sees pre-ranked candidates. Shortlists with one click, triggering the next automation.",
    tag: "One click",
    tagColor: "teal",
  },
  {
    num: "04",
    title: "Automation fires",
    desc: "n8n sends interview invites, offers, or rejections the moment status changes.",
    tag: "Real-time",
    tagColor: "amber",
  },
];

const TECH = [
  { name: "React.js", role: "Frontend interface", color: "#61DAFB" },
  { name: "Node.js + Express", role: "API & business logic", color: "#68A063" },
  {
    name: "Python + spaCy / OpenAI",
    role: "Resume AI agent",
    color: "#3776AB",
  },
  { name: "n8n", role: "Workflow automation", color: "#FF6C37" },
  { name: "PostgreSQL", role: "Database", color: "#336791" },
  { name: "Docker + Railway", role: "Cloud deployment", color: "#2496ED" },
];

export default function Landing() {
  const topCandidates = CANDIDATES.slice(0, 4);
  const maxBar = Math.max(...WEEKLY_DATA.map((d) => d.applications));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <PublicNav />

      {/* Page glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 800px 400px at 50% -10%, rgba(91,142,248,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ─── HERO ─── */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: 140,
          paddingBottom: 0,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "140px 52px 0",
        }}
      >
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(52px, 9vw, 100px)",
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: "-2.5px",
            marginBottom: 28,
            maxWidth: 860,
            animation: "fadeUp 0.5s 0.1s ease both",
          }}
        >
          Recruitment that works
          <br />
          <span
            style={{
              fontStyle: "italic",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            while you sleep.
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--m1)",
            fontWeight: 300,
            maxWidth: 500,
            lineHeight: 1.75,
            marginBottom: 44,
            animation: "fadeUp 0.5s 0.2s ease both",
          }}
        >
          SmartHire uses AI to score resumes, automate outreach, and surface the
          best candidates — so HR can focus on people, not paperwork.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 60,
            animation: "fadeUp 0.5s 0.3s ease both",
          }}
        >
          <Link
            to="/jobs"
            className="btn btn-primary"
            style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
          >
            Browse Jobs →
          </Link>
          <Link
            to="/hr/login"
            className="btn btn-ghost"
            style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
          >
            HR Portal
          </Link>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 64,
            border: "1px solid var(--b1)",
            borderRadius: 14,
            overflow: "hidden",
            background: "var(--s1)",
            animation: "fadeUp 0.5s 0.4s ease both",
          }}
        >
          {[
            { num: "0–100", label: "AI Match Score" },
            { num: "<2s", label: "Resume analysis" },
            { num: "100%", label: "Emails automated" },
            { num: "Live", label: "Analytics dashboard" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "20px 44px",
                textAlign: "center",
                borderRight: i < 3 ? "1px solid var(--b1)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  background: "var(--grad-text)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div style={{ fontSize: 12, color: "var(--m2)", marginTop: 5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 980,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--b2), transparent)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <svg
              width="4"
              height="4"
              viewBox="0 0 4 4"
              style={{ transform: "rotate(45deg)", opacity: 0.6 }}
            >
              <rect width="4" height="4" fill="var(--blue)" />
            </svg>
            <span
              style={{
                fontSize: "11.5px",
                color: "var(--m2)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              AI-powered hiring, automated from application to offer
            </span>
            <svg
              width="4"
              height="4"
              viewBox="0 0 4 4"
              style={{ transform: "rotate(45deg)", opacity: 0.6 }}
            >
              <rect width="4" height="4" fill="var(--blue)" />
            </svg>
          </div>
          <div
            style={{
              flex: 1,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--b2), transparent)",
            }}
          />
        </div>

        {/* Dashboard Preview */}
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            borderRadius: "18px 18px 0 0",
            border: "1px solid var(--b2)",
            borderBottom: "none",
            background: "var(--s1)",
            overflow: "hidden",
            position: "relative",
            animation: "fadeUp 0.6s 0.5s ease both",
          }}
        >
          {/* Shine */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
            }}
          />

          {/* Browser bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderBottom: "1px solid var(--b1)",
              background: "rgba(18,21,30,0.9)",
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#FF5F57",
              }}
            />
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#FFBD2E",
              }}
            />
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#28C841",
              }}
            />
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  padding: "4px 20px",
                  borderRadius: 6,
                  background: "var(--b1)",
                  border: "1px solid var(--b1)",
                  fontSize: 11.5,
                  color: "var(--m2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="10" height="10" rx="2" />
                </svg>
                app.smarthire.ai/hr/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div style={{ display: "flex", height: 520 }}>
            {/* Mini Sidebar */}
            <div
              style={{
                width: 200,
                background: "var(--s2)",
                borderRight: "1px solid var(--b1)",
                padding: "16px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--m3)",
                  padding: "8px 10px 4px",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                }}
              >
                Overview
              </div>
              {[
                ["▦", "Dashboard", true],
                ["◎", "Analytics", false],
              ].map(([icon, label, active]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 10px",
                    borderRadius: 7,
                    background: active ? "var(--blue-dim)" : "transparent",
                    color: active ? "#8AB8FF" : "var(--m1)",
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  {label}
                </div>
              ))}
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--m3)",
                  padding: "10px 10px 4px",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                }}
              >
                Recruitment
              </div>
              {[
                ["◈", "Candidates"],
                ["◻", "Job Posts"],
                ["⚡", "Automations"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 10px",
                    borderRadius: 7,
                    color: "var(--m1)",
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>

            {/* Main */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "16px 22px",
                  overflowY: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* KPIs */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 10,
                  }}
                >
                  {[
                    {
                      label: "Total Applicants",
                      val: "247",
                      delta: "↑ 18 this week",
                      color: "#5B8EF8",
                    },
                    {
                      label: "Shortlisted",
                      val: "34",
                      delta: "↑ 5 today",
                      color: "#1ECFAA",
                    },
                    {
                      label: "Avg AI Score",
                      val: "71.4",
                      delta: "↔ stable",
                      color: "#F0A030",
                    },
                    {
                      label: "Emails Sent",
                      val: "189",
                      delta: "↑ all automated",
                      color: "#8B70F5",
                    },
                  ].map((k, i) => (
                    <div
                      key={i}
                      style={{
                        background: "var(--s2)",
                        border: "1px solid var(--b1)",
                        borderRadius: 9,
                        padding: "12px 14px",
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
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.6px",
                          color: "var(--m2)",
                          marginBottom: 6,
                          fontFamily: "'Syne', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {k.label}
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          fontFamily: "'Syne', sans-serif",
                          color: "var(--text)",
                          lineHeight: 1,
                        }}
                      >
                        {k.val}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: k.delta.startsWith("↑")
                            ? "var(--teal)"
                            : "var(--m2)",
                          marginTop: 4,
                        }}
                      >
                        {k.delta}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Table */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.7fr",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  {/* Bar chart */}
                  <div
                    style={{
                      background: "var(--s2)",
                      border: "1px solid var(--b1)",
                      borderRadius: 9,
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "var(--text)",
                        marginBottom: 12,
                      }}
                    >
                      Applications / week
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 5,
                        alignItems: "flex-end",
                        height: 100,
                      }}
                    >
                      {WEEKLY_DATA.map((d, i) => {
                        const h = (d.applications / maxBar) * 100;
                        const isHigh = h > 70;
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                              height: "100%",
                              justifyContent: "flex-end",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: `${h}%`,
                                borderRadius: "3px 3px 0 0",
                                background: isHigh
                                  ? "linear-gradient(180deg, #5B8EF8, #8B70F5)"
                                  : "rgba(91,142,248,0.2)",
                              }}
                            />
                            <span style={{ fontSize: 8, color: "var(--m3)" }}>
                              {d.week}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Candidates table */}
                  <div
                    style={{
                      background: "var(--s2)",
                      border: "1px solid var(--b1)",
                      borderRadius: 9,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1.2fr 80px 90px",
                        padding: "9px 14px",
                        borderBottom: "1px solid var(--b1)",
                      }}
                    >
                      {["Candidate", "Role", "Score", "Status"].map((h) => (
                        <div
                          key={h}
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            color: "var(--m2)",
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </div>
                      ))}
                    </div>
                    {topCandidates.map((c) => {
                      const scoreC =
                        c.score >= 80
                          ? "var(--teal)"
                          : c.score >= 60
                            ? "var(--amber)"
                            : "var(--red)";
                      const statusColors = {
                        new: "blue",
                        reviewing: "amber",
                        shortlisted: "teal",
                        interview: "violet",
                        hired: "green",
                        rejected: "red",
                      };
                      const avatarColors = {
                        blue: { bg: "rgba(91,142,248,0.15)", text: "#8AB8FF" },
                        violet: {
                          bg: "rgba(139,112,245,0.15)",
                          text: "#B09DF9",
                        },
                        teal: { bg: "rgba(30,207,170,0.12)", text: "#1ECFAA" },
                        amber: { bg: "rgba(240,160,48,0.12)", text: "#F0A030" },
                        red: { bg: "rgba(240,80,104,0.12)", text: "#F05068" },
                        green: { bg: "rgba(34,197,94,0.12)", text: "#22C55E" },
                      };
                      const ac =
                        avatarColors[c.avatarColor] || avatarColors.blue;
                      const sc = statusColors[c.status] || "blue";
                      return (
                        <div
                          key={c.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1.2fr 80px 90px",
                            padding: "9px 14px",
                            borderBottom: "1px solid var(--b1)",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: ac.bg,
                                color: ac.text,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {c.avatar}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "var(--text)",
                                }}
                              >
                                {c.name}
                              </div>
                              <div style={{ fontSize: 10, color: "var(--m2)" }}>
                                {c.location}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--m1)" }}>
                            {c.appliedRole.split(" ").slice(0, 2).join(" ")}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: scoreC,
                                fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              {c.score}
                            </span>
                            <div
                              style={{
                                width: 28,
                                height: 2.5,
                                background: "rgba(255,255,255,0.06)",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${c.score}%`,
                                  height: "100%",
                                  background: scoreC,
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                          </div>
                          <span
                            className={`pill pill-${sc}`}
                            style={{ fontSize: 10, padding: "2px 8px" }}
                          >
                            {c.status.charAt(0).toUpperCase() +
                              c.status.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section
        id="features"
        style={{ padding: "110px 52px", position: "relative", zIndex: 1 }}
      >
        <div className="section-eyebrow">
          <div className="eyebrow-dot" />
          Core Architecture
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(36px,5vw,60px)",
            fontWeight: 400,
            letterSpacing: "-1.5px",
            lineHeight: 1.08,
            marginBottom: 14,
          }}
        >
          Three pillars.
          <br />
          <span
            style={{
              fontStyle: "italic",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            One complete system.
          </span>
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "var(--m1)",
            maxWidth: 480,
            lineHeight: 1.75,
            marginBottom: 56,
            fontWeight: 300,
          }}
        >
          AI screening, workflow automation, and real-time analytics working in
          perfect harmony.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 1,
            background: "var(--b1)",
            border: "1px solid var(--b1)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="card"
              style={{
                background: "var(--s1)",
                borderRadius: 0,
                border: "none",
                padding: "36px 30px",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.25s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--s2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--s1)")
              }
            >
              <div
                style={{
                  fontSize: 10.5,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "var(--m3)",
                  textTransform: "uppercase",
                  marginBottom: 22,
                }}
              >
                Pillar {f.num}
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  border: "1px solid var(--b2)",
                  background: "var(--s3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  marginBottom: 18,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: "var(--text)",
                  letterSpacing: "-0.3px",
                }}
              >
                {f.title}
              </div>
              <div
                style={{ fontSize: 13.5, color: "var(--m1)", lineHeight: 1.7 }}
              >
                {f.body}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: f.color,
                  opacity: 0.06,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section
        id="how"
        style={{ padding: "0 52px 110px", position: "relative", zIndex: 1 }}
      >
        <div className="section-eyebrow">
          <div className="eyebrow-dot" />
          The Process
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(36px,5vw,60px)",
            fontWeight: 400,
            letterSpacing: "-1.5px",
            lineHeight: 1.08,
            marginBottom: 56,
          }}
        >
          Apply → Score → Review
          <br />
          <span
            style={{
              fontStyle: "italic",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            → Hired.
          </span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 42,
              left: "12%",
              right: "12%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, var(--b2), var(--b2), transparent)",
              zIndex: 0,
            }}
          />
          {STEPS.map((s) => (
            <div
              key={s.num}
              style={{ padding: "0 20px", position: "relative", zIndex: 1 }}
            >
              <div
                style={{
                  width: 86,
                  height: 86,
                  borderRadius: "50%",
                  border: `1px solid ${s.active ? "rgba(91,142,248,0.4)" : "var(--b2)"}`,
                  background: s.active ? "var(--blue-dim)" : "var(--s1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  position: "relative",
                }}
              >
                {s.active && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--blue)",
                      position: "absolute",
                      top: -4,
                      right: -4,
                      boxShadow: "0 0 10px var(--blue)",
                      animation: "pulse 2.5s infinite",
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    ...(s.active
                      ? {
                          background: "var(--grad-text)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }
                      : { color: "var(--m2)" }),
                  }}
                >
                  {s.num}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--m1)",
                  lineHeight: 1.65,
                  marginBottom: 14,
                }}
              >
                {s.desc}
              </div>
              <span className={`pill pill-${s.tagColor}`}>{s.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section
        style={{
          margin: "0 52px 80px",
          borderRadius: 20,
          background: "var(--s1)",
          border: "1px solid var(--b1)",
          padding: 56,
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,112,245,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="section-eyebrow">
          <div className="eyebrow-dot" />
          Technology
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px,4vw,48px)",
            fontWeight: 400,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            marginBottom: 40,
          }}
        >
          Built with tools companies
          <br />
          <span
            style={{
              fontStyle: "italic",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            actually use.
          </span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
        >
          {TECH.map((t) => (
            <div
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 20px",
                borderRadius: 10,
                border: "1px solid var(--b1)",
                background: "var(--s2)",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--b2)";
                e.currentTarget.style.background = "var(--s3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--b1)";
                e.currentTarget.style.background = "var(--s2)";
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
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--m2)", marginTop: 2 }}>
                  {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          margin: "0 52px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "var(--s1)",
            border: "1px solid var(--b1)",
            padding: "80px 80px",
            textAlign: "center",
            position: "relative",
            borderRadius: 20,
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
                "radial-gradient(circle, rgba(91,142,248,0.08) 0%, transparent 70%)",
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
                "radial-gradient(circle, rgba(139,112,245,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(36px,5vw,60px)",
              fontWeight: 400,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              marginBottom: 16,
              paddingLeft: 24,
              paddingRight: 24,
              whiteSpace: "normal",
              wordBreak: "keep-all",
            }}
          >
            Ready to experience
            <br />
            <span
              style={{
                fontStyle: "italic",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                paddingRight: "8px",
              }}
            >
              smarter hiring?
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
            A full-stack AI system doing what enterprise software does — from
            resume parsing to live analytics.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              to="/hr/login"
              className="btn btn-primary"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
            >
              Access HR Dashboard →
            </Link>
            <Link
              to="/candidate/login"
              className="btn btn-ghost"
              style={{ padding: "13px 28px", fontSize: 15, borderRadius: 10 }}
            >
              Candidate Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
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
          {["/jobs", "/hr/login", "/candidate/login"].map((href, i) => (
            <Link
              key={i}
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
              {["Browse Jobs", "HR Portal", "Candidate Login"][i]}
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
