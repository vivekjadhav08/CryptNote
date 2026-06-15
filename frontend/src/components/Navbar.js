import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const baseUrl = process.env.REACT_APP_API_BASE_URL;

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setUser(null); setIsLoggedIn(false); return; }
      try {
        const res = await fetch(`${baseUrl}/auth/getuser`, { method: "POST", headers: { "Content-Type": "application/json", "auth-token": token } });
        if (res.ok) { const data = await res.json(); setUser(data); setIsLoggedIn(true); }
        else { setUser(null); setIsLoggedIn(false); }
      } catch { setUser(null); setIsLoggedIn(false); }
    };
    fetchUser();
  }, [location]);

  useEffect(() => { document.body.classList.toggle("dark-mode", isDarkMode); }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); setUser(null); setProfileOpen(false);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let timer;
    const reset = () => { clearTimeout(timer); if (isLoggedIn) timer = setTimeout(handleLogout, 5 * 60 * 1000); };
    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, reset)); reset();
    return () => { clearTimeout(timer); events.forEach(e => window.removeEventListener(e, reset)); };
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : "U";

  return (
    <nav className="gk-navbar">
      <NavLink className="gk-navbar-brand" to="/">
        <span style={{ fontSize: 26 }}>📝</span>
        <span style={{ fontSize: 19, fontWeight: 600 }}>CryptNote</span>
      </NavLink>

      {isLoggedIn && setSearchQuery && (
        <div className="gk-search-bar">
          <span style={{ color: 'var(--gk-text-secondary)', fontSize: 18 }}>🔍</span>
          <input type="text" placeholder="Search notes…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && <button className="gk-nav-icon" style={{ fontSize: 13, width: 28, height: 28 }} onClick={() => setSearchQuery("")}>✕</button>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <button className="gk-nav-icon" onClick={toggleDarkMode} title={isDarkMode ? "Light mode" : "Dark mode"} style={{ fontSize: 20 }}>
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        {isLoggedIn && user && (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div className="gk-avatar" onClick={() => setProfileOpen(p => !p)} title={user.name}>{initials}</div>
            {profileOpen && (
              <div className="gk-dropdown">
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gk-border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gk-text-secondary)', marginTop: 2 }}>{user.email}</div>
                </div>
                <NavLink className="gk-dropdown-item" to="/profile" onClick={() => setProfileOpen(false)}>👤 Manage Account</NavLink>
                <NavLink className="gk-dropdown-item" to="/emi" onClick={() => setProfileOpen(false)}>💳 EMI Tracker</NavLink>
                <div className="gk-dropdown-divider" />
                <button className="gk-dropdown-item" onClick={handleLogout} style={{ color: 'var(--gk-danger)' }}>🚪 Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
