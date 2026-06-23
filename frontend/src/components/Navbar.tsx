import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Sun, Moon, LogOut, User, Menu, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-darkBorder bg-darkBg/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Left Side: Mobile Menu Button & Brand logo */}
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-2 hover:bg-slate-800/40 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <span className="hidden sm:inline-block font-outfit text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              FinNews <span className="text-cyan-400 font-extrabold text-xs tracking-wider uppercase ml-1 border border-cyan-400/30 px-1.5 py-0.5 rounded">NER</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Navigation Links & Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* Static Pages Nav (visible when logged out) */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-400 mr-2">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/scenarios" className="hover:text-white transition-colors">Scenarios</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </nav>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-darkBorder hover:bg-slate-800/40 text-slate-400 hover:text-white transition-all"
            title="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Conditional User controls */}
          {user ? (
            <div className="flex items-center space-x-3">
              {/* User Avatar Info */}
              <div 
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-outfit font-extrabold text-xs shadow-md border border-cyan-300/20">
                  {user.full_name ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "US"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white leading-none">{user.full_name}</p>
                  <p className="text-[9px] text-cyan-400 font-medium tracking-wider uppercase mt-0.5">{user.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-lg hover:shadow-cyan-500/10 hover:opacity-95 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
