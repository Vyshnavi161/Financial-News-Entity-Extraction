import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Terminal, FileCode, Radio, Info, Mail, 
  Settings, ShieldAlert, Cpu, BookOpen, ChevronRight, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analyzer", label: "AI News Analyzer", icon: Terminal },
    { to: "/document-analyzer", label: "Document Analyzer", icon: FileCode },
    { to: "/monitoring", label: "Real-Time Monitoring", icon: Radio },
    { to: "/scenarios", label: "Scenario Showcase", icon: BookOpen },
    { to: "/architecture", label: "AI Architecture", icon: Cpu },
    { to: "/profile", label: "User Profile", icon: Settings },
    { to: "/about", label: "About Platform", icon: Info },
    { to: "/contact", label: "Contact Support", icon: Mail },
  ];

  // If user is admin, append Admin Panel link
  if (user.role === "admin") {
    links.splice(6, 0, { to: "/admin", label: "Admin Console", icon: ShieldAlert });
  }

  const activeStyle = "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 text-cyan-400 font-semibold";
  const inactiveStyle = "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20 hover:border-l-2 hover:border-slate-700/50";

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) => 
              `flex items-center justify-between px-3.5 py-3 rounded-xl border border-transparent text-sm transition-all duration-200 group ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            <div className="flex items-center space-x-3">
              <Icon className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
              <span>{link.label}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Sidebar overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-darkBorder bg-darkBg/95 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile Header block inside Sidebar */}
        <div className="flex h-16 items-center justify-between px-4 lg:hidden border-b border-darkBorder">
          <span className="font-outfit font-extrabold text-sm text-cyan-400 tracking-wider">NAV PORTAL</span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/40 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav links */}
        {renderNavLinks()}

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-darkBorder bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">System V1.0 - Online</span>
          </div>
        </div>

      </aside>
    </>
  );
};
