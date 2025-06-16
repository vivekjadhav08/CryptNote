import React, { useState } from "react";
import { useParams } from "react-router-dom";
const baseUrl = process.env.REACT_APP_API_BASE_URL;
const ResetPassword = ({ showAlert }) => {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${baseUrl}/auth/resetpassword/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const json = await response.json();
    if (response.ok) {
      showAlert("Password reset successful", "success");
    } else {
      showAlert(json.error || "Failed to reset password", "danger");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Reset Your Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={5}
              placeholder="Enter new password"
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
