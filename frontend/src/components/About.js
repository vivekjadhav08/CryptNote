import React, { useContext } from "react";
import DarkModeContext from "../context/mode/DarkModeContext";

const About = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  return (
    <div className="gk-page">
      <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--gk-surface)', border: '1px solid var(--gk-border)', borderRadius: 16, padding: '36px 40px', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 6, color: 'var(--gk-primary)' }}>About CryptNote</h1>
        <p style={{ color: 'var(--gk-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Hello! I'm <strong style={{ color: 'var(--gk-text)' }}>Vivek Jadhav</strong>, a full-stack developer building modern, scalable web applications using the MERN stack.
        </p>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Features</h2>
        {[
          ["📝", "Notes", "Create, edit, pin and color-code your notes"],
          ["💳", "EMI Tracker", "Track loans, mark payments, see progress"],
          ["🔐", "Secure Auth", "JWT authentication with forgot password flow"],
          ["🌙", "Dark Mode", "Full dark/light mode support"],
          ["📱", "Mobile Ready", "Responsive design for all screen sizes"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 16, padding: 14, background: 'var(--gk-bg)', borderRadius: 10 }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--gk-text-secondary)' }}>{desc}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--gk-border)', textAlign: 'center', color: 'var(--gk-text-secondary)', fontSize: 14 }}>
          Built with ❤️ by <strong style={{ color: 'var(--gk-text)' }}>Vivek Jadhav</strong> · 2025
        </div>
      </div>
    </div>
  );
};

export default About;
