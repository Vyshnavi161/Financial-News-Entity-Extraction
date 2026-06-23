import React, { useState } from "react";
import { User, Key, Settings, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";

export const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Settings states
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode ?? true);
  const [notifications, setNotifications] = useState(user?.settings?.notificationsEnabled ?? true);

  if (!user) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password updated successfully.");
        setOldPassword("");
        setNewPassword("");
      } else {
        setError(data.detail || "Failed to update password. Check your current password.");
      }
    } catch (err) {
      setError("Network issue. Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = () => {
    const updatedVal = !notifications;
    setNotifications(updatedVal);
    
    // Update local config
    const updatedUser = {
      ...user,
      settings: {
        darkMode,
        notificationsEnabled: updatedVal
      }
    };
    updateUser(updatedUser);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Header Profile Title */}
      <div className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-outfit font-extrabold text-2xl shadow-lg border border-cyan-300/25">
            {user.full_name ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "US"}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-white leading-tight">{user.full_name}</h1>
            <p className="text-xs text-slate-400 mt-1">Username: <span className="text-cyan-400 font-mono">{user.username}</span></p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-lg border border-purple-500/25 bg-purple-500/5 text-purple-400 text-xs font-extrabold tracking-wider uppercase">
          {user.role} workspace
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Metrics */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-panel p-5 rounded-2xl border border-darkBorder space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center">
              <User className="w-4 h-4 mr-2 text-cyan-400" /> Account Metadata
            </h3>
            
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Registered Email</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Authorized Role</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5 capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Member Since</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "June 23, 2026"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-darkBorder space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center">
              <Settings className="w-4 h-4 mr-2 text-purple-400" /> Workspace Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Theme Mode</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Toggle interface scheme</p>
                </div>
                <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] rounded text-slate-400">
                  Dark Active
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Notifications</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Trigger completion banners</p>
                </div>
                <button
                  onClick={handleToggleNotification}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${notifications ? "bg-cyan-500" : "bg-slate-800"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${notifications ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 rounded-2xl border border-darkBorder space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center">
              <Key className="w-4 h-4 mr-2 text-emerald-400" /> Security Settings
            </h3>
            
            {error && (
              <div className="flex items-center space-x-2.5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-emerald-500/10 transition-all"
              >
                {loading ? "Updating Security Credentials..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
