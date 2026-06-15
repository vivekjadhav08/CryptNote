import React, { useState, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Signup = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const timerRef = useRef(null);
  const inputsRef = useRef([]);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);

  const handleSendOtp = async () => {
    if (otpAttempts >= 2) { showAlert("Max OTP attempts reached.", "error"); return; }
    if (!validateEmail(credentials.email)) { showAlert("Enter a valid email.", "error"); return; }
    setLoadingOtp(true);
    try {
      const checkRes = await fetch(`${baseUrl}/auth/checkemail`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: credentials.email }) });
      const checkData = await checkRes.json();
      if (checkData.exists) { showAlert("Email already registered.", "error"); setLoadingOtp(false); return; }

      const res = await fetch(`${baseUrl}/auth/sendotp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: credentials.email }) });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true); setOtpAttempts(p => p + 1); setResendTimer(300);
        timerRef.current = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; }), 1000);
        showAlert("OTP sent to your email!", "success");
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      } else showAlert(data.error || "Failed to send OTP", "error");
    } catch { showAlert("Failed to send OTP", "error"); }
    setLoadingOtp(false);
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) { showAlert("Enter full 6-digit OTP.", "error"); return; }
    try {
      const res = await fetch(`${baseUrl}/auth/verifyotp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: credentials.email, otp }) });
      const data = await res.json();
      if (data.success) { setOtpVerified(true); clearInterval(timerRef.current); showAlert("Email verified!", "success"); }
      else showAlert("Invalid OTP", "error");
    } catch { showAlert("Error verifying OTP", "error"); }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const updated = [...otpDigits]; updated[index] = val; setOtpDigits(updated);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;
    if (!name || !email || !password || !cpassword) { showAlert("All fields are required.", "error"); return; }
    if (!validateEmail(email)) { showAlert("Invalid email address.", "error"); return; }
    if (password.length < 5) { showAlert("Password must be at least 5 characters.", "error"); return; }
    if (password !== cpassword) { showAlert("Passwords do not match.", "error"); return; }
    setLoadingSignup(true);
    try {
      const res = await fetch(`${baseUrl}/auth/createuser`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
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
            <input className="gk-input" type="text" name="name" value={credentials.name}
              onChange={e => setCredentials({ ...credentials, name: e.target.value })}
              placeholder="Your full name" autoFocus />
          </div>

          <div className="gk-input-group">
            <label>Email Address</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="gk-input" type="email" name="email" value={credentials.email}
                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="your@email.com" readOnly={otpSent} style={{ flex: 1 }} />
              <button type="button" className="gk-btn gk-btn-primary" style={{ padding: '8px 12px', fontSize: 13, whiteSpace: 'nowrap' }}
                onClick={handleSendOtp} disabled={loadingOtp || (resendTimer > 0 && otpAttempts > 0) || otpAttempts >= 2 || otpVerified}>
                {otpVerified ? "✓ Verified" : loadingOtp ? "…" : otpSent ? (resendTimer > 0 ? `${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, "0")}` : "Resend") : "Verify"}
              </button>
            </div>
          </div>

          {otpSent && !otpVerified && (
            <div className="gk-input-group">
              <label>Enter OTP</label>
              <div className="gk-otp-inputs">
                {otpDigits.map((digit, idx) => (
                  <input key={idx} type="text" maxLength="1" className="gk-otp-input"
                    value={digit} onChange={e => handleOtpChange(e, idx)} onKeyDown={e => handleOtpKeyDown(e, idx)}
                    ref={el => (inputsRef.current[idx] = el)} />
                ))}
              </div>
              <button type="button" className="gk-auth-btn" style={{ marginTop: 8 }} onClick={handleVerifyOtp}>Verify OTP</button>
            </div>
          )}

          {otpVerified && (
            <div style={{ color: '#137333', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>✅ Email verified</div>
          )}

          <div className="gk-input-group">
            <label>Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showPassword ? "text" : "password"} name="password"
                value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Min. 5 characters" />
              <button type="button" className="gk-eye-btn" onClick={() => setShowPassword(p => !p)}>{showPassword ? "🙈" : "👁️"}</button>
            </div>
          </div>

          <div className="gk-input-group">
            <label>Confirm Password</label>
            <div className="gk-input-wrapper">
              <input className="gk-input" type={showCPassword ? "text" : "password"} name="cpassword"
                value={credentials.cpassword} onChange={e => setCredentials({ ...credentials, cpassword: e.target.value })}
                placeholder="Repeat password" />
              <button type="button" className="gk-eye-btn" onClick={() => setShowCPassword(p => !p)}>{showCPassword ? "🙈" : "👁️"}</button>
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
