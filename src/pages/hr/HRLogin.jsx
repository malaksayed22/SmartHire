import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HRLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginHR } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginHR(email, password);
      navigate("/hr/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
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
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(91,142,248,0.07) 0%, transparent 70%)",
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
        {/* Logo */}
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
                background: "var(--blue-dim)",
                border: "1px solid rgba(91,142,248,0.2)",
                fontSize: 11.5,
                color: "#8AB8FF",
                fontWeight: 500,
              }}
            >
              HR Manager Access
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
            Welcome back,
          </h1>
          <p
            style={{
              color: "var(--m1)",
              fontSize: 14,
              fontWeight: 300,
              marginBottom: 28,
            }}
          >
            Sign in to your HR dashboard to manage candidates.
          </p>

          {/* Demo credentials notice */}
          <div
            style={{
              background: "var(--blue-dim)",
              border: "1px solid rgba(91,142,248,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 24,
              fontSize: 12.5,
              color: "#8AB8FF",
            }}
          >
            Sign in with your registered HR account
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

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--red)",
                  background: "var(--red-dim)",
                  padding: "10px 14px",
                  borderRadius: 8,
                }}
              >
                {error}
              </div>
            )}

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
                "Sign in to Dashboard →"
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
            to="/hr/signup"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Create one →
          </Link>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 13.5,
            color: "var(--m2)",
          }}
        >
          Looking for a job?{" "}
          <Link
            to="/candidate/login"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Candidate login →
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
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
