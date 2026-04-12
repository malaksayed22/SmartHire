import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";

const navItems = [
  {
    group: "Overview",
    items: [
      { path: "/hr/dashboard", label: "Dashboard", icon: "▦" },
      { path: "/hr/analytics", label: "Analytics", icon: "◎" },
    ],
  },
  {
    group: "Recruitment",
    items: [
      { path: "/hr/candidates", label: "Candidates", icon: "◈" },
      { path: "/hr/jobs", label: "Job Posts", icon: "◻" },
      { path: "/hr/automations", label: "Automations", icon: "⚡" },
    ],
  },
];

export default function HRSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hrUser, logoutHR } = useAuth();

  const handleLogout = () => {
    logoutHR();
    navigate("/hr/login");
  };

  return (
    <aside
      style={{
        width: 224,
        flexShrink: 0,
        background: "var(--s2)",
        borderRight: "1px solid var(--b1)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--b1)",
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
              fontSize: 16,
              letterSpacing: "-0.3px",
              background: "var(--grad-text)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SmartHire
          </span>
        </Link>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--m2)" }}>
          HR Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {navItems.map(({ group, items }) => (
          <div key={group} style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                color: "var(--m3)",
                padding: "10px 10px 5px",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
              }}
            >
              {group}
            </div>
            {items.map(({ path, label, icon }) => {
              const active =
                location.pathname === path ||
                location.pathname.startsWith(path + "/");
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    marginBottom: 2,
                    textDecoration: "none",
                    background: active ? "var(--blue-dim)" : "transparent",
                    color: active ? "#8AB8FF" : "var(--m1)",
                    fontSize: 13.5,
                    transition: "all 0.15s",
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--b1)";
                      e.currentTarget.style.color = "var(--text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--m1)";
                    }
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      width: 18,
                      textAlign: "center",
                      opacity: active ? 1 : 0.7,
                    }}
                  >
                    {icon}
                  </span>
                  {label}
                  {active && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        background: "var(--blue)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid var(--b1)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Avatar initials={hrUser?.avatar || "HR"} color="blue" size={32} />
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}
            >
              {hrUser?.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--m2)" }}>
              {hrUser?.role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "7px 12px",
            borderRadius: 7,
            background: "transparent",
            border: "1px solid var(--b1)",
            color: "var(--m2)",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "var(--red-dim)";
            e.target.style.color = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "var(--b1)";
            e.target.style.color = "var(--m2)";
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
