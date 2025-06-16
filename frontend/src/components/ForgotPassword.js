import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    // Validate email input
    if (!email.trim()) {
      setValidationError("Email is required.");
      return;
    } else if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    } else {
      setValidationError("");
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${baseUrl}/auth/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setStatus({ message: json.error || "User not found", type: "error" });
      } else {
        setStatus({ message: "Password reset email sent", type: "success" });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      setIsLoading(false);
      setStatus({ message: "Network error", type: "error" });
    }
  };

  return (
    <div
      className={`d-flex justify-content-center align-items-center ${
        isDarkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
      style={{ height: "100vh" }}
    >
      <div
        className={`card shadow-sm p-4 ${
          isDarkMode ? "bg-secondary text-light" : "bg-white"
        }`}
        style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}
      >
        <h2 className="text-center text-primary mb-3 fw-bold">
          🔐 CryptNote <span className="ms-2">📝</span>
        </h2>

        <h4 className="text-center mb-4">Forgot Password</h4>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Registered Email
            </label>
            <input
              type="email"
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              } ${validationError ? "is-invalid" : ""}`}
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              readOnly={isLoading}
            />
            {validationError && (
              <div className="invalid-feedback">{validationError}</div>
            )}
          </div>

          {status.message && (
            <span
              className={`d-block mb-3 text-center fw-semibold ${
                status.type === "success" ? "text-success" : "text-danger"
              }`}
            >
              {status.message}
            </span>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <button
            type="button"
            className={`btn btn-outline-secondary w-100 mt-3`}
            onClick={() => navigate("/login")}
            disabled={isLoading}
          >
            🔙 Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
