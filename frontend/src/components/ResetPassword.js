import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.trim().length < 5) {
      setMessage("Password must be at least 5 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${baseUrl}/auth/resetpassword/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const json = await response.json();

      if (response.ok) {
        setMessage("✅ Password reset successful. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(json.error || "❌ Failed to reset password.");
      }
    } catch (err) {
      setMessage("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="card p-4 shadow"
        style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}
      >
        <h2 className="text-center text-primary mb-3 fw-bold">
          🔐 CryptNote <span className="ms-2">📝</span>
        </h2>
        <h4 className="text-center mb-4">Reset Your Password</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className={`form-control ${password && password.length < 5 ? "is-invalid" : ""}`}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter new password"
            />
            {password.length > 0 && password.length < 5 && (
              <div className="form-text text-danger">
                Password must be at least 5 characters.
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <div className="mt-3 text-center text-danger small">{message}</div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
