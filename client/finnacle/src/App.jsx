import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import FinnacleAuth from './Pages/Auth/Auth';
import Home from './Pages/Dashboard/Home';
import Expense from './Pages/Dashboard/Expense';
import Income from './Pages/Dashboard/Income';
import UserProvider from './Context/userContext';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Portfolio from './Pages/Dashboard/Portfolio';
import Insights from './Pages/Dashboard/Insights';
import MrFin from './Pages/Dashboard/MrFin';

export function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          {/* Navbar */}
          <ConditionalNavbar />

          {/* Main Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/auth" element={<FinnacleAuth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/expense" element={<Expense />} />
              <Route path="/income" element={<Income />} />
              <Route path="/portfolio" element={<Portfolio/>} />
              <Route path="/insights" element={< Insights/>} />
              <Route path="/MrFin" element={< MrFin/>} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/home" />
  ) : (
    <Navigate to="/auth" />
  );
};

// Conditional Navbar Component
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/auth']; // Routes where Navbar should not appear

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null; // Do not render Navbar
  }

  return <Navbar />;
};
