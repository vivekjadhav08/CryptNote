import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
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
import EMITracker from "./components/EMITracker";

const authPaths = ["/login", "/signup", "/ForgotPassword", "/resetpassword/:token"];

const AppContent = ({ showAlert, alert }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const isAuth = authPaths.some(p => matchPath({ path: p, end: true }, location.pathname));

  return (
    <>
      {!isAuth && <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {!isAuth && <Sidebar />}
      <Alert alert={alert} />
      <Routes>
        <Route path="/" element={<Home showAlert={showAlert} searchQuery={searchQuery} />} />
        <Route path="/emi" element={<EMITracker showAlert={showAlert} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login showAlert={showAlert} />} />
        <Route path="/signup" element={<Signup showAlert={showAlert} />} />
        <Route path="/ForgotPassword" element={<ForgotPassword showAlert={showAlert} />} />
        <Route path="/resetpassword/:token" element={<ResetPassword showAlert={showAlert} />} />
        <Route path="/profile" element={<UserProfile showAlert={showAlert} />} />
      </Routes>
    </>
  );
};

function App() {
  const [alert, setAlert] = useState(null);
  const showAlert = (message, type) => {
    setAlert({ msg: message, type });
    setTimeout(() => setAlert(null), 2500);
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
