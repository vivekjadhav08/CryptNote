import React, { useState, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Signup = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const timerRef = useRef(null);
  const inputsRef = useRef([]);
  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (otpAttempts >= 2) {
      showAlert("You can only request OTP twice.", "error");
      return;
    }

    if (!validateEmail(credentials.email)) {
      showAlert("Enter a valid email before requesting OTP.", "error");
      return;
    }

    try {
      const checkRes = await fetch(`${baseUrl}/auth/checkemail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        showAlert("Email already registered.", "error");
        return;
      }
    } catch {
      showAlert("Error checking email.", "error");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/auth/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpAttempts((prev) => prev + 1);
        setResendTimer(300);
        timerRef.current = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        showAlert("OTP sent to your email!", "success");
        inputsRef.current[0]?.focus();
      } else {
        showAlert(data.error || "Failed to send OTP", "error");
      }
    } catch {
      showAlert("Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      showAlert("Enter full 6-digit OTP.", "error");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/auth/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credentials.email, otp }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        clearInterval(timerRef.current);
        showAlert("OTP verified successfully!", "success");
      } else {
        showAlert("Invalid OTP", "error");
      }
    } catch {
      showAlert("Error verifying OTP", "error");
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;

    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;

    if (!otpVerified) {
      showAlert("Please verify your email before signing up.", "error");
      return;
    }

    if (!name || !email || !password || !cpassword) {
      showAlert("All fields are required.", "error");
      return;
    }

    if (!validateEmail(email)) {
      showAlert("Invalid email address.", "error");
      return;
    }

    if (password.length < 5) {
      showAlert("Password must be at least 5 characters.", "error");
      return;
    }

    if (password !== cpassword) {
      showAlert("Passwords do not match.", "error");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await response.json();
      if (json.success) {
        showAlert("Account created successfully. Please login.", "success");
        navigate("/login");
      } else {
        showAlert(json.error || "Signup failed.", "error");
      }
    } catch {
      showAlert("Something went wrong. Try again.", "error");
    }
  };

  const onChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  return (
    <div
      className={`d-flex justify-content-center align-items-center ${
        isDarkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
      style={{ minHeight: "100vh" }}
    >
      <div
        className={`card p-4 shadow rounded-4 ${
          isDarkMode ? "bg-secondary text-light" : "bg-white"
        }`}
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <h2 className="text-center text-primary fw-bold mb-1">
          🔐 CryptNote 📝
        </h2>
        <h4 className="text-center mb-4">Create Account</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={credentials.name}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <div className="d-flex gap-2">
              <input
                type="email"
                className="form-control"
                name="email"
                value={credentials.email}
                onChange={onChange}
                readOnly={otpSent}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleSendOtp}
                disabled={resendTimer > 0 || otpAttempts >= 2}
              >
                {otpAttempts >= 2
                  ? "Try again later"
                  : otpSent
                  ? resendTimer > 0
                    ? `Resend in ${Math.floor(resendTimer / 60)}:${String(
                        resendTimer % 60
                      ).padStart(2, "0")}`
                    : "Resend OTP"
                  : "Send OTP"}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="mb-3">
              {!otpVerified ? (
                <>
                  <label className="form-label">Enter OTP</label>
                  <div className="d-flex justify-content-between mb-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength="1"
                        className="form-control text-center"
                        style={{ width: "40px" }}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        ref={(el) => (inputsRef.current[idx] = el)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                </>
              ) : (
                <div className="alert alert-success text-center py-2">
                  ✅ Email verified!
                </div>
              )}
            </div>
          )}

          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={credentials.password}
              onChange={onChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="position-absolute"
              style={{ right: 10, top: 38, cursor: "pointer" }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Confirm Password</label>
            <input
              type={showCPassword ? "text" : "password"}
              className="form-control"
              name="cpassword"
              value={credentials.cpassword}
              onChange={onChange}
            />
            <span
              onClick={() => setShowCPassword(!showCPassword)}
              className="position-absolute"
              style={{ right: 10, top: 38, cursor: "pointer" }}
            >
              {showCPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 shadow-sm"
            style={{ transition: "0.3s", fontWeight: "bold" }}
            disabled={!otpVerified}
          >
            Sign Up
          </button>

          <div className="text-center mt-3">
            <small>
              Already have an account?{" "}
              <Link
                to="/login"
                className={isDarkMode ? "text-light" : "text-primary"}
              >
                Login here
              </Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
