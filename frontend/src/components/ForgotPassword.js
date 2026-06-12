import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
const baseUrl = process.env.REACT_APP_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setStatus({ message: "Email is required.", type: "error" }); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/forgotpassword`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const json = await res.json();
      if (res.ok) { setStatus({ message: "Reset link sent! Check your email.", type: "success" }); setTimeout(() => navigate("/login"), 3000); }
      else setStatus({ message: json.error || "User not found", type: "error" });
    } catch { setStatus({ message: "Network error", type: "error" }); }
    setLoading(false);
  };

  return (
    <div className="gk-auth-page">
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
        {isDarkMode ? "☀️" : "🌙"}
      </button>
      <div className="gk-auth-card">
        <div className="gk-auth-logo">📝 CryptNote</div>
        <div className="gk-auth-subtitle">Forgot your password?</div>
        <p style={{ fontSize: 14, color: 'var(--gk-text-secondary)', textAlign: 'center', marginBottom: 20 }}>
          Enter your email and we'll send you a reset link.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="gk-input-group">
            <label>Registered Email</label>
            <input className="gk-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" disabled={loading} autoFocus />
          </div>
          {status.message && (
            <div style={{ fontSize: 13, color: status.type === "success" ? "#137333" : "#d93025", marginBottom: 12, textAlign: 'center' }}>
              {status.message}
            </div>
          )}
          <button type="submit" className="gk-auth-btn" disabled={loading}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
        <div className="gk-auth-links">
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
