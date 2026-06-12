import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Signup = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({
    name: "", email: "", password: "", cpassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;
    if (!name || !email || !password || !cpassword) { showAlert("All fields are required.", "error"); return; }
    if (!validateEmail(email)) { showAlert("Invalid email address.", "error"); return; }
    if (password.length < 5) { showAlert("Password must be at least 5 characters.", "error"); return; }
    if (password !== cpassword) { showAlert("Passwords do not match.", "error"); return; }
    setLoadingSignup(true);
    try {
      const res = await fetch(`${baseUrl}/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (json.success) { showAlert("Account created! Please log in.", "success"); navigate("/login"); }
      else showAlert(json.error || "Signup failed.", "error");
    } catch { showAlert("Something went wrong.", "error"); }
    setLoadingSignup(false);
  };

  return (
    <div className="gk-auth-page">
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
        {isDarkMode ? "☀️" : "🌙"}
      </button>
      <div className="gk-auth-card" style={{ maxWidth: 440 }}>
        <div className="gk-auth-logo">📝 CryptNote</div>
        <div className="gk-auth-subtitle">Create your account</div>

        <form onSubmit={handleSubmit}>
          <div className="gk-input-group">
            <label>Full Name</label>
            <input className="gk-input" type="text" name="name"
              value={credentials.name}
              onChange={e => setCredentials({ ...credentials, name: e.target.value })}
              placeholder="Your full name" autoFocus />
          </div>

          <div className="gk-input-group">
            <label>Email Address</label>
            <input className="gk-input" type="email" name="email"
              value={credentials.email}
              onChange={e => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="your@email.com" />
          </div>

          <div className="gk-input-group">
            <label>Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showPassword ? "text" : "password"} name="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Min. 5 characters" />
              <button type="button" className="gk-eye-btn" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="gk-input-group">
            <label>Confirm Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showCPassword ? "text" : "password"} name="cpassword"
                value={credentials.cpassword}
                onChange={e => setCredentials({ ...credentials, cpassword: e.target.value })}
                placeholder="Repeat password" />
              <button type="button" className="gk-eye-btn" onClick={() => setShowCPassword(p => !p)}>
                {showCPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {credentials.cpassword && credentials.password !== credentials.cpassword && (
              <div className="gk-error">Passwords don't match</div>
            )}
          </div>

          <button type="submit" className="gk-auth-btn" disabled={loadingSignup}>
            {loadingSignup ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="gk-auth-links" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gk-border)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;