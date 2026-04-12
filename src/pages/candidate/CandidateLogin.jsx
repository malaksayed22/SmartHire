import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginCandidate } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    loginCandidate(email, password);
    navigate("/candidate/portal");
  };

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(30,207,170,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SmartHire
            </span>
          </Link>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: "var(--teal-dim)",
                border: "1px solid rgba(30,207,170,0.2)",
                fontSize: 11.5,
                color: "var(--teal)",
                fontWeight: 500,
              }}
            >
              Candidate Portal
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: "36px 36px 32px" }}>
          <h1
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: "-0.8px",
              marginBottom: 6,
            }}
          >
            Track your applications
          </h1>
          <p
            style={{
              color: "var(--m1)",
              fontSize: 14,
              fontWeight: 300,
              marginBottom: 28,
            }}
          >
            Sign in to see your AI match scores and application status.
          </p>

          <div
            style={{
              background: "var(--teal-dim)",
              border: "1px solid rgba(30,207,170,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 24,
              fontSize: 12.5,
              color: "var(--teal)",
            }}
          >
            Demo: use any email + password to sign in
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 7,
                }}
              >
                <label className="label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--blue)",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </span>
              </div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "13px",
                fontSize: 15,
                borderRadius: 10,
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16 }} />{" "}
                  Signing in...
                </>
              ) : (
                "View My Applications →"
              )}
            </button>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13.5,
            color: "var(--m2)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/candidate/signup"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Create one →
          </Link>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Want to apply for a job?{" "}
          <Link
            to="/jobs"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Browse open roles →
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link
            to="/hr/login"
            style={{ fontSize: 13, color: "var(--m3)", textDecoration: "none" }}
          >
            HR login instead
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Link
            to="/"
            style={{ fontSize: 13, color: "var(--m3)", textDecoration: "none" }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
