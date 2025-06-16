import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const UserProfile = (props) => {
  const { isDarkMode } = useContext(DarkModeContext);

  const [user, setUser] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/getuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      setUser({ name: data.name, email: data.email });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      props.showAlert("Failed to fetch user", "danger");
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    } else {
      fetchUser();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/updateuser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: user.name,
          password: password.trim() !== "" ? password : undefined,
        }),
      });

      const json = await response.json();
      if (json.success) {
        props.showAlert("Profile updated successfully", "success");
        setPassword("");
        setConfirmPassword("");
        navigate("/");
      } else {
        props.showAlert("Failed to update profile", "danger");
      }
    } catch (err) {
      console.error("Update error:", err.message);
      props.showAlert("Server error", "danger");
    }
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div
      className={`container mt-4 ${isDarkMode ? "text-light" : "text-dark"}`}
    >
      <div
        className={`card shadow-sm p-4 ${
          isDarkMode ? "bg-dark text-light" : "bg-white"
        }`}
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <h2 className="text-center mb-4">User Profile</h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address (read-only)
              </label>
              <input
                type="email"
                className={`form-control ${
                  isDarkMode ? "bg-secondary text-light border-0" : ""
                }`}
                id="email"
                value={user.email}
                disabled
                readOnly
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className={`form-control ${
                  isDarkMode ? "bg-secondary text-light border-0" : ""
                }`}
                id="name"
                name="name"
                value={user.name}
                onChange={onChange}
                required
              />
            </div>

            {/* Password field with toggle */}
            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">
                New Password (leave blank to keep current)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${
                  isDarkMode ? "bg-secondary text-light border-0" : ""
                }`}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={5}
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

            {/* Confirm Password field with toggle */}
            <div className="mb-3 position-relative">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control ${
                  isDarkMode ? "bg-secondary text-light border-0" : ""
                }`}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={5}
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px",
                  cursor: "pointer",
                  userSelect: "none",
                  color: isDarkMode ? "#ccc" : "#555",
                }}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={password && password.length < 5}
            >
              Update Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
