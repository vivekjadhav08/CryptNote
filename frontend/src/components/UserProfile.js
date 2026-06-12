import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
import Swal from "sweetalert2";

const UserProfile = ({ showAlert }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [user, setUser] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/getuser`, { method: "POST", headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") } });
      const data = await res.json();
      setUser({ name: data.name, email: data.email });
      setLoading(false);
    } catch { showAlert("Failed to fetch user", "error"); navigate("/login"); }
  }, [baseUrl, navigate, showAlert]);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
    else fetchUser();
  }, [fetchUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) { showAlert("Passwords do not match", "error"); return; }
    try {
      const res = await fetch(`${baseUrl}/auth/updateuser`, { method: "PUT", headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") }, body: JSON.stringify({ name: user.name, password: password.trim() || undefined }) });
      const json = await res.json();
      if (json.success) { showAlert("Profile updated!", "success"); setPassword(""); setConfirmPassword(""); navigate("/"); }
      else showAlert("Failed to update profile", "error");
    } catch { showAlert("Server error", "error"); }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({ title: "Delete account?", text: "All your notes will be permanently deleted.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d93025", cancelButtonColor: "#5f6368", confirmButtonText: "Delete account", background: isDarkMode ? "#2d2e30" : "#fff", color: isDarkMode ? "#e8eaed" : "#202124" });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${baseUrl}/auth/deleteuser`, { method: "DELETE", headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") } });
        const json = await res.json();
        if (json.success) { localStorage.removeItem("token"); navigate("/signup"); }
        else showAlert("Failed to delete: " + json.error, "error");
      } catch { showAlert("Server error", "error"); }
    }
  };

  return (
    <div className="gk-main" style={{ maxWidth: 500 }}>
      <h2 style={{ fontSize: 22, fontWeight: 400, color: 'var(--gk-text)', marginBottom: 24 }}>Account settings</h2>
      {loading ? (
        <p style={{ color: 'var(--gk-text-secondary)' }}>Loading…</p>
      ) : (
        <div style={{ background: 'var(--gk-surface)', border: '1px solid var(--gk-border)', borderRadius: 8, padding: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="gk-input-group">
              <label>Email (read-only)</label>
              <input className="gk-input" type="email" value={user.email} disabled style={{ opacity: .6 }} />
            </div>
            <div className="gk-input-group">
              <label>Full Name</label>
              <input className="gk-input" type="text" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
            </div>
            <div className="gk-input-group">
              <label>New Password <span style={{ fontSize: 12, opacity: .7 }}>(leave blank to keep current)</span></label>
              <div className="gk-input-wrapper">
                <input className="gk-input" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 5 characters" />
                <button type="button" className="gk-eye-btn" onClick={() => setShowPw(p => !p)}>{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div className="gk-input-group">
              <label>Confirm New Password</label>
              <div className="gk-input-wrapper">
                <input className="gk-input" type={showCPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
                <button type="button" className="gk-eye-btn" onClick={() => setShowCPw(p => !p)}>{showCPw ? "🙈" : "👁️"}</button>
              </div>
              {confirmPassword && password !== confirmPassword && <div className="gk-error">Passwords don't match</div>}
            </div>
            <button type="submit" className="gk-auth-btn" disabled={password && password.length < 5}>
              Save changes
            </button>
          </form>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gk-border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: '#d93025', marginBottom: 8 }}>Danger zone</h3>
            <p style={{ fontSize: 13, color: 'var(--gk-text-secondary)', marginBottom: 12 }}>Deleting your account is permanent and cannot be undone.</p>
            <button className="gk-btn gk-btn-danger" onClick={handleDeleteAccount}>Delete account</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
