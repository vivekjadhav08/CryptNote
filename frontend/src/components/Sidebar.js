import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";

const Sidebar = () => {
  const location = useLocation();
  const items = [
    { to: "/", icon: "💡", label: "Notes", exact: true },
    { to: "/emi", icon: "💳", label: "EMI Tracker" },
    { to: "/about", icon: "ℹ️", label: "About" },
  ];
  return (
    <aside className="gk-sidebar">
      {items.map(item => (
        <NavLink key={item.to} to={item.to} end={item.exact}
          className={({ isActive }) => `gk-sidebar-item ${isActive ? 'active' : ''}`}>
          <span className="sidebar-icon">{item.icon}</span>
          <span className="sidebar-label">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;
