import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Login = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) { showAlert("Please fill in all fields.", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const json = await res.json();
      if (json.success) { localStorage.setItem("token", json.authToken); showAlert("Welcome back!", "success"); navigate("/"); }
      else showAlert(json.error || "Invalid credentials", "error");
    } catch { showAlert("Server error. Please try again.", "error"); }
    setLoading(false);
  };

  return (
    <div className="gk-auth-page">
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} title="Toggle dark mode">
        {isDarkMode ? "☀️" : "🌙"}
      </button>
      <div className="gk-auth-card">
        <div className="gk-auth-logo">📝 CryptNote</div>
        <div className="gk-auth-subtitle">Sign in to your account</div>

        <form onSubmit={handleSubmit}>
          <div className="gk-input-group">
            <label>Email</label>
            <input className="gk-input" type="email" name="email" value={credentials.email}
              onChange={e => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="Enter your email" disabled={loading} autoFocus />
          </div>
          <div className="gk-input-group">
            <label>Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showPassword ? "text" : "password"} name="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password" disabled={loading} />
              <button type="button" className="gk-eye-btn" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 8 }}>
            <Link to="/ForgotPassword" style={{ fontSize: 13, color: 'var(--gk-primary)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="gk-auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="gk-auth-links" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gk-border)' }}>
          <span>Don't have an account? </span>
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
