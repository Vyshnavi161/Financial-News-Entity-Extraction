import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Mail, Lock, User as UserIcon, HelpCircle, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../context/AuthContext";

export const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Registration completed successfully! Navigating to login portal...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.detail || "Registration failed. Please check your details.");
      }
    } catch (err) {
      setError("Network connection issue. Is the backend service active?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans relative">
      
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-radial from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-darkBorder shadow-2xl relative">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 items-center justify-center shadow-lg mb-4">
            <UserIcon className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">Create Analyst Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-sans">Initialize access to our NLP analytical toolsets.</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="flex items-center space-x-2.5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl mb-6">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification banner */}
        {success && (
          <div className="flex items-center space-x-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl mb-6">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <HelpCircle className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-purple-500/10 transition-all disabled:opacity-50 text-xs uppercase tracking-wide"
          >
            {loading ? "Registering Profile..." : "Create Account"}
          </button>
        </form>

        {/* Footer redirection */}
        <p className="text-center text-xs text-slate-500 mt-6 font-sans">
          Already registered?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login Here
          </Link>
        </p>

      </div>
    </div>
  );
};
