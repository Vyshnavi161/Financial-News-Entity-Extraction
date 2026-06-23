import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, User as UserIcon, Sparkles, AlertCircle } from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError(null);
    setLoading(true);

    try {
      const details = new URLSearchParams();
      details.append("username", username);
      details.append("password", password);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: details,
      });

      const data = await res.json();

      if (res.ok) {
        login(data.access_token, data.user);
        navigate("/dashboard");
      } else {
        setError(data.detail || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      setError("Network error. Is the FastAPI server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: "admin" | "user") => {
    setError(null);
    setLoading(true);
    const demoUser = role === "admin" ? "admin_analyst" : "guest_investor";
    const demoPass = "SecurePass123!";

    try {
      // First, attempt to register the user silently just in case they don't exist yet
      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: demoUser,
          email: `${demoUser}@demo.local`,
          full_name: role === "admin" ? "Lead Admin Analyst" : "Guest Investor Profile",
          password: demoPass
        })
      });

      // Then log in
      const details = new URLSearchParams();
      details.append("username", demoUser);
      details.append("password", demoPass);

      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: details
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        login(loginData.access_token, loginData.user);
        navigate("/dashboard");
      } else {
        setError("Failed to sign in with demo credentials.");
      }
    } catch (e) {
      setError("Failed to boot demo session. Is the backend offline?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans relative">
      
      {/* Background glow overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-radial from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-darkBorder shadow-2xl relative">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 items-center justify-center shadow-lg mb-4">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">Access FinNews NER</h2>
          <p className="text-slate-400 text-xs mt-1.5">Sign in to initialize financial entity extraction.</p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="flex items-center space-x-2.5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Password
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
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold shadow-lg hover:shadow-cyan-500/10 transition-all disabled:opacity-50 text-xs uppercase tracking-wide"
          >
            {loading ? "Authenticating Session..." : "Sign In"}
          </button>
        </form>

        {/* Demo Fast Login helpers */}
        <div className="mt-6 pt-5 border-t border-darkBorder/60 text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Fast Demo Access</span>
          <div className="flex space-x-3 mt-3">
            <button
              onClick={() => handleDemoSignIn("user")}
              disabled={loading}
              className="flex-1 py-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold rounded-lg hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
            >
              Investor Demo
            </button>
            <button
              onClick={() => handleDemoSignIn("admin")}
              disabled={loading}
              className="flex-1 py-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold rounded-lg hover:border-purple-500/30 hover:text-purple-400 transition-colors"
            >
              Admin Analyst Demo
            </button>
          </div>
        </div>

        {/* Footer redirection */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register Here
          </Link>
        </p>

      </div>
    </div>
  );
};
