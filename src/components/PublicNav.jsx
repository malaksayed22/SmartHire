import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function PublicNav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.onscroll = () => setScrolled(window.scrollY > 20);
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 52px",
        height: 68,
        background: scrolled ? "rgba(6,7,9,0.92)" : "rgba(6,7,9,0.7)",
        backdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: "1px solid var(--b1)",
        transition: "background 0.3s ease",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "-0.5px",
            background: "var(--grad-text)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          SmartHire
        </span>
      </Link>

      <ul style={{ display: "flex", gap: 4, listStyle: "none" }}>
        {[
          ["/", "Home"],
          ["/jobs", "Jobs"],
          ["/features", "Features"],
          ["/how-it-works", "How it works"],
        ].map(([href, label]) => {
          const isActive = location.pathname === href;
          return (
            <li key={label}>
              <Link
                to={href}
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 15.5,
                  color: isActive ? "var(--text)" : "var(--m1)",
                  letterSpacing: "-0.2px",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  display: "block",
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#7AACFF";
                  e.target.style.background = "rgba(91,142,248,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isActive ? "var(--text)" : "var(--m1)";
                  e.target.style.background = "transparent";
                }}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          to="/candidate/login"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
            fontSize: 15.5,
            color: "var(--m1)",
            letterSpacing: "-0.2px",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 8,
            display: "block",
            transition: "color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#7AACFF";
            e.target.style.background = "rgba(91,142,248,0.08)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "var(--m1)";
            e.target.style.background = "transparent";
          }}
        >
          Sign in →
        </Link>
      </div>
    </nav>
  );
}
