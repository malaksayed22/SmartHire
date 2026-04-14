import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CandidateSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signupCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/candidate/portal";

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signupCandidate(name, email, phone, password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Registration failed. Try a different email.");
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
            Create your account
          </h1>
          <p
            style={{
              color: "var(--m1)",
              fontSize: 14,
              fontWeight: 300,
              marginBottom: 28,
            }}
          >
            Sign up to track your applications and AI match scores.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Sara Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                type="tel"
                placeholder="+20 100 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
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
              onClick={handleSignup}
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
                  Creating account...
                </>
              ) : (
                "Create Account →"
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
          Already have an account?{" "}
          <Link
            to="/candidate/login"
            style={{ color: "var(--blue)", textDecoration: "none" }}
          >
            Sign in →
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Link
            to="/jobs"
            style={{ fontSize: 13, color: "var(--m3)", textDecoration: "none" }}
          >
            Browse open roles →
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
