import React, { useState, useContext } from "react";
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

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, cpassword } = credentials;

    if (!name || !email || !password || !cpassword) {
      showAlert("All fields are required.", "error");
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
        showAlert("Email already exists.", "error");
      }
    } catch (err) {
      showAlert("Something went wrong. Please try again later.", "error");
    }
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
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <h2 className="text-center text-primary fw-bold mb-1">🔐 CryptNote 📝</h2>
        <h4 className="text-center mb-4">Create Account</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              }`}
              id="name"
              name="name"
              value={credentials.name}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              }`}
              id="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
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
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                userSelect: "none",
                color: isDarkMode ? "#ccc" : "#555",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="cpassword" className="form-label">
              Confirm Password
            </label>
            <input
              type={showCPassword ? "text" : "password"}
              className={`form-control ${
                isDarkMode ? "bg-dark text-light border-0" : ""
              }`}
              id="cpassword"
              name="cpassword"
              value={credentials.cpassword}
              onChange={onChange}
            />
            <span
              onClick={() => setShowCPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                userSelect: "none",
                color: isDarkMode ? "#ccc" : "#555",
              }}
              aria-label={
                showCPassword ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showCPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Sign Up
          </button>

          <div className="text-center mt-3">
            <small>
              Already have an account?{" "}
              <Link
                to="/login"
                className={`text-decoration-none ${
                  isDarkMode ? "text-light" : "text-primary"
                }`}
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
