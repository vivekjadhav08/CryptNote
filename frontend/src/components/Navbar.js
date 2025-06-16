import React, { useEffect, useState, useRef, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Switch from "react-switch";
import DarkModeContext from "../context/mode/DarkModeContext";
import "../App.css";
import { useCallback } from "react";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const collapseRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoggedIn(false);
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/auth/getuser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        setIsLoggedIn(false);
      }
      setLoadingUser(false);
    };

    fetchUser();
  }, [location]);

  useEffect(() => {
    let inactivityTimer = null;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isLoggedIn) {
        inactivityTimer = setTimeout(() => {
          console.log("User inactive. Logging out.");
          handleLogout();
        }, 5 * 60 * 1000);
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const handleClickOutsideNavbar = (event) => {
      const toggleBtn = document.querySelector(".navbar-toggler");
      const isNavbarOpen = collapseRef.current?.classList.contains("show");

      if (
        isNavbarOpen &&
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        toggleBtn.click();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideNavbar);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideNavbar);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        isDarkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"
      }`}
    >
      <div className="container-fluid px-3">
        <NavLink className="navbar-brand" to="/">
          CryptNote
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
          ref={collapseRef}
        >
          <ul
            className="navbar-nav d-flex align-items-lg-center"
            style={{ gap: "1rem" }}
          >
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Note Organizer
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                About
              </NavLink>
            </li>

            {loadingUser ? (
              <li className="nav-item">
                <span className={isDarkMode ? "text-light" : "text-dark"}>
                  Loading...
                </span>
              </li>
            ) : (
              user && (
                <li
                  className="nav-item dropdown"
                  ref={profileRef}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className={`nav-link dropdown-toggle ${
                      isDarkMode ? "text-light" : "text-dark"
                    }`}
                    onClick={() => setProfileOpen((prev) => !prev)}
                    id="profileDropdown"
                    role="button"
                    aria-expanded={profileOpen}
                  >
                    Hi, {user.email}
                  </span>
                  <ul
                    className={`dropdown-menu dropdown-menu-end${
                      profileOpen ? " show" : ""
                    } ${isDarkMode ? "dropdown-menu-dark" : ""}`}
                    aria-labelledby="profileDropdown"
                  >
                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                      >
                        Profile
                      </NavLink>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              )
            )}

            {/* Dark Mode Switch at the end */}
            <li className="nav-item d-flex align-items-center">
              <Switch
                onChange={toggleDarkMode}
                checked={isDarkMode}
                offColor="#ccc"
                onColor="#0d6efd"
                uncheckedIcon={false}
                checkedIcon={false}
                height={20}
                width={40}
              />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
