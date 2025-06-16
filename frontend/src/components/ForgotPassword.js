import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const baseUrl = process.env.REACT_APP_API_BASE_URL;

const ForgotPassword = (props) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate(); // add this

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/auth/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(errorText || "Error sending password reset email.");
        props.showAlert(errorText || "Error sending email", "danger");
        return;
      }

      const json = await response.json();
      setMessage("Password reset link sent to your email.");
      props.showAlert("Password reset email sent", "success");

      // Redirect to login after success
      navigate("/login");
    } catch (error) {
      setMessage("Network error or server not responding.");
      props.showAlert("Network error", "danger");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-3">Forgot Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Registered Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Send Reset Link</button>
        </form>
        {message && <div className="mt-3 text-center text-muted">{message}</div>}
      </div>
    </div>
  );
};

export default ForgotPassword;
