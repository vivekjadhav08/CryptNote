import React, { useContext } from "react";
import DarkModeContext from "../context/mode/DarkModeContext";

const About = () => {
  const { isDarkMode } = useContext(DarkModeContext);

  const themedStyles = {
    ...styles,
    container: {
      ...styles.container,
      background: isDarkMode
        ? "linear-gradient(135deg, #121212 0%, #1f1f1f 100%)"
        : styles.container.background,
    },
    card: {
      ...styles.card,
      background: isDarkMode ? "#1e1e1e" : styles.card.background,
      color: isDarkMode ? "#e0e0e0" : styles.card.color,
      boxShadow: isDarkMode
        ? "0 4px 15px rgba(255, 255, 255, 0.1)"
        : styles.card.boxShadow,
    },
    list: {
      ...styles.list,
      color: isDarkMode ? "#ccc" : styles.list.color,
    },
    footer: {
      ...styles.footer,
      color: isDarkMode ? "#aaa" : styles.footer.color,
    },
    title: {
      ...styles.title,
      color: isDarkMode ? "#bb86fc" : styles.title.color,
    },
    subtitle: {
      ...styles.subtitle,
      color: isDarkMode ? "#ce93d8" : styles.subtitle.color,
    },
  };

  return (
    <div style={themedStyles.container}>
      <div style={themedStyles.card}>
        <h1 style={themedStyles.title}>About Me</h1>
        <p style={themedStyles.description}>
          Hello! I'm <strong>Vivek Jadhav</strong>, a software
          developer. I build modern, scalable,
          and maintainable web applications using MongoDB, Express, React, and Node.js.
        </p>

        <h2 style={themedStyles.subtitle}>My Mission</h2>
        <p style={themedStyles.description}>
          To deliver cutting-edge web solutions in 2025 that solve real-world problems, 
          provide seamless user experiences, and leverage the power of modern technologies.
        </p>

        <h2 style={themedStyles.subtitle}>Technologies I Use</h2>
        <ul style={themedStyles.list}>
          <li>MongoDB</li>
          <li>Express.js</li>
          <li>React & Redux</li>
          <li>Node.js</li>
          <li>JavaScript (ES6+)</li>
          <li>REST & GraphQL APIs</li>
        </ul>

        <div style={themedStyles.footer}>
          <p style={{ margin: 0 }}>
            Developed with ❤️ by <strong>ViVeK JaDHaV</strong> in 2025
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
   background: "linear-gradient(135deg, rgba(100, 100, 100, 0.05), rgba(0, 0, 0, 0.05))"
,
    padding: "2rem",
  },
  card: {
  background: "white",
  borderRadius: "15px",
  maxWidth: "800px", // increased from 600px
  padding: "2.5rem",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  color: "#333",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  textAlign: "center",
  animation: "fadeIn 1s ease forwards",
},
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    color: "#4a148c",
  },
  subtitle: {
    fontSize: "1.5rem",
    marginTop: "1.5rem",
    color: "#6a1b9a",
  },
  description: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    marginTop: "0.5rem",
  },
  list: {
    listStyleType: "circle",
    paddingLeft: "1.5rem",
    textAlign: "left",
    maxWidth: "350px",
    margin: "0.5rem auto 0 auto",
    color: "#444",
  },
  footer: {
    marginTop: "2rem",
    fontSize: "0.9rem",
    color: "#888",
  },
};

export default About;
