import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, TrendingUp, Wallet, LogOut, Bot } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Check active route
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-white/90 backdrop-blur-sm"}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/home" className="flex items-center">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text text-2xl font-extrabold">Finnacle</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/home"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/home")
                ? "bg-green-100 text-green-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/income"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/income")
                ? "bg-green-100 text-green-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Income
          </Link>
          <Link
            to="/expense"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/expense")
                ? "bg-green-100 text-green-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Expense
          </Link>
          <Link
            to="/portfolio"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/portfolio")
                ? "bg-green-100 text-green-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Portfolio
          </Link>
          <Link
            to="/insights"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/insights")
                ? "bg-green-100 text-green-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </Link>
          {/* Mr.Fin AI Assistant */}
          <Link
            to="/mrfin"
            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
              isActive("/mrfin")
                ? "bg-blue-100 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bot className="h-4 w-4 mr-2" />
            Mr.Fin
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg transition-all hover:shadow-md ml-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
          <div className="flex flex-col space-y-1 px-4 py-3">
            <Link
              to="/home"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/home")
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              to="/income"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/income")
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Income
            </Link>
            <Link
              to="/expense"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/expense")
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Wallet className="h-5 w-5 mr-3" />
              Expense
            </Link>
            <Link
              to="/portfolio"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/portfolio")
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Portfolio
            </Link>
            <Link
              to="/insights"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/insights")
                  ? "bg-green-100 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Insights
            </Link>
            {/* Mr.Fin AI Assistant for Mobile */}
            <Link
              to="/MrFin"
              className={`flex items-center p-3 rounded-lg transition-all ${
                isActive("/mrfin")
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Bot className="h-5 w-5 mr-3" />
              Mr.Fin
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg transition-all hover:shadow-md mt-2"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}