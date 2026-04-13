import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { JOBS } from "../data/mock";

const QUICK_REPLIES = [
  "What jobs are open?",
  "How do I apply?",
  "How does AI scoring work?",
  "How do I track my application?",
];

// ─── Rule-based bot responses ────────────────────────────────────────────────────

function getBotReply(text) {
  const t = text.toLowerCase();

  if (/hello|hi|hey|good (morning|afternoon|evening)|howdy/.test(t)) {
    return {
      text: "Hey! 👋 I'm the SmartHire assistant. I can help you explore open roles, understand how applications work, or answer anything about our hiring process. What would you like to know?",
      quick: ["What jobs are open?", "How does AI scoring work?"],
    };
  }

  // Check for specific role/department keywords first to filter results
  if (
    /job|position|role|opening|hiring|vacanc|department|frontend|backend|engineer|design|ml\b|ai\b|research|data\b/.test(
      t,
    )
  ) {
    const active = JOBS.filter((j) => j.status === "active");

    // Map input keywords → job title/department matchers
    const filters = [
      {
        pattern: /frontend|front.end|react|vue|angular|ui.engineer/,
        match: /frontend|front.end|react|ui/i,
      },
      {
        pattern: /backend|back.end|node|python|api.engineer|server/,
        match: /backend|back.end|server|node|python/i,
      },
      {
        pattern: /ml\b|machine.learn|ai.engineer|nlp|data.sci/,
        match: /ml|ai|nlp|machine|research|data.sci/i,
      },
      { pattern: /design|ux|product.design|figma/, match: /design|ux|figma/i },
      {
        pattern: /hr\b|human.resource|talent|recruiter/,
        match: /hr\b|human|talent|recruit/i,
      },
      {
        pattern: /product.manager|pm\b|product.lead/,
        match: /product.manager|pm\b/i,
      },
    ];

    let matches = active;
    for (const f of filters) {
      if (f.pattern.test(t)) {
        const subset = active.filter(
          (j) => f.match.test(j.title) || f.match.test(j.department),
        );
        if (subset.length > 0) {
          matches = subset;
          break;
        }
      }
    }

    const list = matches
      .map((j) => `• **${j.title}** — ${j.department} · ${j.location}`)
      .join("\n");
    const prefix =
      matches.length < active.length
        ? `Here ${matches.length === 1 ? "is" : "are"} the ${matches.length} matching position${matches.length !== 1 ? "s" : ""}`
        : `We currently have ${active.length} open position${active.length !== 1 ? "s" : ""}`;
    return {
      text: `${prefix}:\n\n${list}\n\nHead to the Jobs page to read full descriptions and apply!`,
      quick: ["How do I apply?", "How does AI scoring work?"],
    };
  }

  if (/how.*apply|apply|application|submit|resume|cv/.test(t)) {
    return {
      text: "Applying is simple:\n\n1. Browse open roles on the Jobs page\n2. Click a role you like\n3. Fill in your name, email, and cover letter\n4. Upload your resume (PDF or DOCX)\n5. Hit **Submit** — that's it!\n\nYou'll get a confirmation email within 10 seconds, and our AI will score your resume automatically.",
      quick: ["How does AI scoring work?", "How do I track my application?"],
    };
  }

  if (/ai|score|scoring|match|rank|algorithm|how.*work/.test(t)) {
    return {
      text: "Our AI reads your uploaded resume and extracts your skills, experience, job titles, and education. It then compares your profile against the job description using NLP and gives you a **0–100 match score**.\n\nThis happens in under 2 seconds — before any human reviews your application. Higher scores get prioritized in the HR dashboard.",
      quick: ["How do I apply?", "How do I track my application?"],
    };
  }

  if (/track|status|portal|progress|check|where.*application|update/.test(t)) {
    return {
      text: "After applying, you can track everything in real time on the **Candidate Portal**:\n\n• Your AI match score\n• Your current stage (Applied → Reviewing → Shortlisted → Interview → Hired)\n• Every email sent to you\n\nHead to **/candidate/login** and sign in with the email you applied with.",
      quick: ["How does AI scoring work?", "What jobs are open?"],
    };
  }

  if (/interview|shortlist|hired|offer|stage|pipeline|process|review/.test(t)) {
    return {
      text: "Here's how the hiring pipeline works:\n\n1. **Applied** — your application is received\n2. **Reviewing** — HR is reading your profile\n3. **Shortlisted** — you made the cut!\n4. **Interview** — we'll reach out to schedule\n5. **Hired** — congrats! 🎉\n\nYou'll get an automated email at every stage change.",
      quick: ["How do I track my application?", "How does AI scoring work?"],
    };
  }

  if (/salary|pay|compens|money|benefit|package/.test(t)) {
    const salaries = JOBS.filter((j) => j.status === "active")
      .map((j) => `• ${j.title}: ${j.salary}`)
      .join("\n");
    return {
      text: `Salary ranges vary by role:\n\n${salaries}\n\nAll roles include competitive benefits. Check individual job listings for full details.`,
      quick: ["What jobs are open?", "How do I apply?"],
    };
  }

  if (/remote|location|where|cairo|egypt|hybrid|on.?site/.test(t)) {
    const locs = JOBS.filter((j) => j.status === "active")
      .map((j) => `• ${j.title}: ${j.location}`)
      .join("\n");
    return {
      text: `Here's where each open role is based:\n\n${locs}\n\nWe offer a mix of remote, hybrid, and on-site arrangements depending on the role.`,
      quick: ["What jobs are open?", "How do I apply?"],
    };
  }

  if (/skill|tech|stack|language|tool|requirement/.test(t)) {
    return {
      text: "Each job listing includes required skills, nice-to-haves, and responsibilities. Open any role on the Jobs page to read the full requirements.\n\nOur AI also compares your resume skills against them automatically — so even if you're not 100% sure you match, apply and let the score speak!",
      quick: ["What jobs are open?", "How does AI scoring work?"],
    };
  }

  if (/email|confirm|notification|notify/.test(t)) {
    return {
      text: "Yes! Every step triggers an automated email to you:\n\n• ✉️ Application received\n• 📋 Status change (shortlisted, interview, hired...)\n• 📅 Interview invitation with calendar link\n\nAll emails go to the address you submitted in your application.",
      quick: ["How do I track my application?", "What jobs are open?"],
    };
  }

  if (/n8n|automat|webhook|workflow/.test(t)) {
    return {
      text: "SmartHire uses **n8n** for all job automation — it's a self-hosted workflow tool. Every status change fires a webhook to n8n, which then triggers the right email instantly. No delays, no manual follow-ups.",
      quick: ["How does AI scoring work?", "What jobs are open?"],
    };
  }

  if (/thank|thanks|great|awesome|helpful|nice/.test(t)) {
    return {
      text: "You're welcome! 😊 Let me know if you have any other questions — happy to help.",
      quick: QUICK_REPLIES,
    };
  }

  if (/bye|goodbye|see you|that'?s all/.test(t)) {
    return {
      text: "Good luck with your application! 🚀 Come back anytime if you have questions.",
      quick: null,
    };
  }

  return {
    text: "I'm not sure I caught that — let me suggest some things I can help with:",
    quick: QUICK_REPLIES,
  };
}

// ─── Message bubble ────────────────────────────────────────────────────────

function formatText(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : p,
    );
    return (
      <span key={i}>
        {formatted}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "12px 16px",
        background: "var(--s3)",
        borderRadius: "18px 18px 18px 4px",
        width: "fit-content",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--m2)",
            animation: "chatDot 1.2s infinite ease-in-out",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Chatbot component ────────────────────────────────────────────────

export default function Chatbot() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm SmartHire's AI assistant 🤖\n\nI can help you find open roles, understand our hiring process, or answer questions about applications. How can I help?",
      quick: QUICK_REPLIES,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef();
  const inputRef = useRef();

  // Don't show on HR dashboard pages
  const isHR =
    location.pathname.startsWith("/hr/dashboard") ||
    location.pathname.startsWith("/hr/candidates") ||
    location.pathname.startsWith("/hr/jobs") ||
    location.pathname.startsWith("/hr/analytics") ||
    location.pathname.startsWith("/hr/automations");
  if (isHR) return null;

  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    scrollToBottom();
    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      const reply = getBotReply(text.trim());
      setTyping(false);
      setMessages((prev) => [...prev, { from: "bot", ...reply }]);
      if (!open) setUnread((n) => n + 1);
      scrollToBottom();
    }, delay);
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 200);
    scrollToBottom();
  };

  return (
    <>
      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(91,142,248,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(91,142,248,0); }
        }
        .chat-msg-btn {
          background: transparent;
          border: 1px solid var(--b2);
          color: var(--m1);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 12.5px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .chat-msg-btn:hover {
          border-color: var(--blue);
          color: var(--blue);
          background: var(--blue-dim);
        }
        .chat-input-send {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: var(--grad);
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.15s;
        }
        .chat-input-send:hover { opacity: 0.85; transform: scale(1.05); }
        .chat-input-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
      `}</style>

      {/* Floating trigger button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "var(--grad)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          boxShadow: "0 4px 24px rgba(91,142,248,0.35)",
          animation: !open ? "chatPulse 2.5s infinite" : "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.animation = "none";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          if (!open)
            e.currentTarget.style.animation = "chatPulse 2.5s infinite";
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3 3l12 12M15 3L3 15"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {/* Unread badge */}
        {unread > 0 && !open && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--red)",
              border: "2px solid var(--bg)",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {unread}
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 94,
            right: 28,
            width: 360,
            height: 520,
            background: "var(--s1)",
            border: "1px solid var(--b2)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            overflow: "hidden",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,142,248,0.08)",
            animation: "chatSlideUp 0.25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid var(--b1)",
              background: "var(--s2)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--grad)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 12px rgba(91,142,248,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2a5 5 0 015 5v1a5 5 0 01-10 0V7a5 5 0 015-5z"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M3 20c0-4 4-7 9-7s9 3 9 7"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text)",
                }}
              >
                SmartHire AI
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 1,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    boxShadow: "0 0 6px var(--teal)",
                  }}
                />
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--teal)",
                    fontWeight: 500,
                  }}
                >
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--m2)",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                lineHeight: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--m2)")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.from === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      background:
                        msg.from === "user" ? "var(--grad)" : "var(--s3)",
                      border:
                        msg.from === "user" ? "none" : "1px solid var(--b1)",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: "var(--text)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {formatText(msg.text)}
                  </div>
                </div>
                {/* Quick replies */}
                {msg.from === "bot" &&
                  msg.quick &&
                  i === messages.length - 1 &&
                  !typing && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 8,
                        paddingLeft: 2,
                      }}
                    >
                      {msg.quick.map((q, qi) => (
                        <button
                          key={qi}
                          className="chat-msg-btn"
                          onClick={() => sendMessage(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <TypingDots />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid var(--b1)",
              background: "var(--s2)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                background: "var(--s3)",
                border: "1px solid var(--b2)",
                borderRadius: 10,
                padding: "9px 14px",
                fontSize: 13.5,
                color: "var(--text)",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(91,142,248,0.5)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--b2)")}
            />
            <button
              className="chat-input-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
