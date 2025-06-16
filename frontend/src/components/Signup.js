import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
const baseUrl = process.env.REACT_APP_API_BASE_URL; 
const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });

  // State to toggle password visibility for both fields
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;

    if (password !== cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    const response = await fetch(`${baseUrl}/auth/createuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await response.json();

    if (json.success) {
      props.showAlert("Account created Successfully. Please login.", "success");
      navigate("/login");
    } else {
      props.showAlert("Email Already Exist", "danger");
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
      style={{ height: "100vh" }}
    >
      <div
        className={`card shadow-sm p-4 ${
          isDarkMode ? "bg-secondary text-light" : "bg-white"
        }`}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Create Your Account</h3>
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
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
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
              required
            />
            <div className={`form-text ${isDarkMode ? "text-light" : ""}`}>
              We'll never share your email with anyone else.
            </div>
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
              minLength={5}
              required
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
            <div className={`form-text ${isDarkMode ? "text-light" : ""}`}>
              Minimum 5 characters.
            </div>
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
              minLength={5}
              required
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
              aria-label={showCPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showCPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="termsCheck"
              required
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the Terms & Conditions
            </label>
          </div>

          <button type="submit" className="btn btn-success w-100 mb-2">
            Sign Up
          </button>

          <div className="text-center">
            <small>
              Already have an account?{" "}
              <a
                className={isDarkMode ? "text-light" : ""}
                href="/login"
              >
                Login here
              </a>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
