import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Alert from "./components/Alert";
import Login from "./components/Login";
import Signup from "./components/Signup";
import NoteState from "./context/notes/NoteState";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import DarkModeProvider from "./context/mode/DarkModeProvider";
import UserProfile from "./components/UserProfile";
import { useState } from "react";

const AppContent = ({ showAlert, alert }) => {
  const location = useLocation();

  // List of route patterns where Navbar should be hidden
  const hideNavbarPatterns = ["/login", "/signup", "/ForgotPassword", "/resetpassword/:token"];

  const shouldShowNavbar = !hideNavbarPatterns.some((pattern) =>
    matchPath({ path: pattern, end: true }, location.pathname)
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Alert alert={alert} />
      <div style={{ marginTop: "70px" }}>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home showAlert={showAlert} />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/signup" element={<Signup showAlert={showAlert} />} />
          <Route path="/ForgotPassword" element={<ForgotPassword showAlert={showAlert} />} />
          <Route path="/resetpassword/:token" element={<ResetPassword showAlert={showAlert} />} />
          <Route path="/profile" element={<UserProfile showAlert={showAlert} />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
      </div>
    </>
  );
};

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };

 return (
  <NoteState>
    <DarkModeProvider>
      <Router>
        <AppContent showAlert={showAlert} alert={alert} />
      </Router>
    </DarkModeProvider>
  </NoteState>
);
}

export default App;
