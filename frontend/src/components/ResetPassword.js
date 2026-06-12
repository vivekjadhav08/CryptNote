import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
const baseUrl = process.env.REACT_APP_API_BASE_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 5) { setMessage("Password must be at least 5 characters."); return; }
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/auth/resetpassword/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const json = await res.json();
      if (res.ok) { setMessage("✅ Password reset! Redirecting…"); setTimeout(() => navigate("/login"), 2000); }
      else setMessage(json.error || "Failed to reset password.");
    } catch { setMessage("Server error."); }
    setLoading(false);
  };

  return (
    <div className="gk-auth-page">
      <div className="gk-auth-card">
        <div className="gk-auth-logo">📝 CryptNote</div>
        <div className="gk-auth-subtitle">Set a new password</div>
        <form onSubmit={handleSubmit}>
          <div className="gk-input-group">
            <label>New Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 5 characters" disabled={loading} autoFocus />
              <button type="button" className="gk-eye-btn" onClick={() => setShowPw(p => !p)}>{showPw ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <div className="gk-input-group">
            <label>Confirm Password</label>
            <input className="gk-input" type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" disabled={loading} />
          </div>
          {message && <div style={{ fontSize: 13, color: message.startsWith("✅") ? "#137333" : "#d93025", marginBottom: 12, textAlign: 'center' }}>{message}</div>}
          <button type="submit" className="gk-auth-btn" disabled={loading}>{loading ? "Resetting…" : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
