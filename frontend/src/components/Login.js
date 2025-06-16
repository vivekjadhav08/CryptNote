import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Login = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = credentials;

    if (!email || !password) {
      showAlert("Please fill in all fields.", "error");
      return;
    }

    if (!validateEmail(email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 5) {
      showAlert("Password must be at least 5 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (json.success) {
        localStorage.setItem("token", json.authToken);
        showAlert("Logged in successfully!", "success");
        navigate("/");
      } else {
        showAlert("Invalid credentials", "error");
      }
    } catch {
      showAlert("Server error. Please try again.", "error");
    }
    setLoading(false);
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

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
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center text-primary fw-bold mb-1">
          🔐 CryptNote 📝
        </h2>
        <h4 className="text-center mb-4">Login</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="text"
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              }`}
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              disabled={loading}
            />
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              }`}
              id="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              disabled={loading}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                color: isDarkMode ? "#ccc" : "#555",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-3 text-center">
          <div className="mt-3 text-center">
            <Link
              to="/ForgotPassword"
              className={`text-decoration-none d-block mb-2 ${
                isDarkMode ? "text-light" : ""
              }`}
            >
              Forgot Password?
            </Link>
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className={`d-inline-flex align-items-center gap-2 px-4 py-2 mt-3 rounded-3 fw-semibold transition-all ${
                isDarkMode
                  ? "bg-light text-dark border-0 shadow-sm hover-opacity"
                  : "bg-primary text-white border-0 shadow-sm"
              }`}
              style={{
                textDecoration: "none",
                transition: "0.3s ease",
              }}
            >
              <span>Sign Up</span>
              <span role="img" aria-label="arrow">
                ➡️
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
