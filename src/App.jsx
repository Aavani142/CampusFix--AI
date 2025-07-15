import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import AdminDashboard from "./components/AdminDashboard";
import Reports from "./components/Reports";
import CategorySelection from "./components/CategorySelection";
import About from "./components/About";
import Profile from "./components/Profile";
import ChatBot from "./components/ChatBot";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/category-selection" element={<CategorySelection />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chatbot" element={<ChatBot />} />
          
          

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
