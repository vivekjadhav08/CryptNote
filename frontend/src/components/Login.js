import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
const baseUrl = process.env.REACT_APP_API_BASE_URL;


const Login = (props) => {
  // console.log("Base URL from env:", process.env.REACT_APP_API_BASE_URL);

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json();
    if (json.success) {
      localStorage.setItem("token", json.authToken);
      props.showAlert("Logged In Successfully", "success");
      navigate("/");
    } else {
      props.showAlert("Invalid Credentials", "danger");
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
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
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
            <div
              id="emailHelp"
              className={`form-text ${isDarkMode ? "text-light" : ""}`}
            >
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
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

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
            className={`btn btn-sm ms-2 ${
              isDarkMode ? "btn-outline-light" : "btn-outline-secondary"
            }`}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
