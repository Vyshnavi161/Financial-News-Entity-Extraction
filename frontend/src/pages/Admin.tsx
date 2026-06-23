import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Users, FileCode, Terminal, Cpu, 
  Trash2, RefreshCw, AlertCircle, Clock
} from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";
import { TableSkeleton } from "../components/Skeletons";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface GlobalAnalysis {
  id: string;
  user_id: string;
  source_type: string;
  filename?: string;
  text: string;
  overall_confidence: number;
  created_at: string;
}

interface SystemMetric {
  model_state: string;
  model_framework: string;
  device: string;
  cpu_usage: string;
  memory_usage: string;
  api_latency: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

interface AdminOverview {
  total_users: number;
  total_files: number;
  total_analyses: number;
  system_status: SystemMetric;
  logs: LogEntry[];
}

export const Admin: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  
  const [tab, setTab] = useState<"system" | "users" | "analyses">("system");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [globalHistory, setGlobalHistory] = useState<GlobalAnalysis[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_BASE_URL}/api/admin/overview`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      } else {
        setError("Failed to load administration overview data.");
      }
    } catch (e) {
      setError("Network error fetching admin configurations.");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error("Users list query failed", e);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalHistory(data);
      }
    } catch (e) {
      console.error("Global analyses query failed", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchOverview(), fetchUsers(), fetchAnalyses()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (username === currentUser?.username) {
      alert("You cannot delete your own administration profile.");
      return;
    }
    if (!window.confirm(`Delete user '${username}'? This operation is permanent.`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
        fetchOverview(); // Update counts
      } else {
        alert("Delete user query failed.");
      }
    } catch (e) {
      alert("Error executing delete.");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm("Delete this analysis record from system database?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/history/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAnalyses();
        fetchOverview();
      } else {
        alert("Delete record failed.");
      }
    } catch (e) {
      alert("Error executing delete.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 font-sans">
        <h1 className="font-outfit text-2xl font-bold text-white">Administrative Portal</h1>
        <TableSkeleton />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm font-semibold max-w-lg mx-auto text-center space-y-2">
        <p>{error || "Fatal admin console load error."}</p>
        <button onClick={loadData} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Reload</button>
      </div>
    );
  }

  const overviewMetrics = [
    { label: "Global Users", value: overview.total_users, icon: Users, color: "text-cyan-400 bg-cyan-500/5" },
    { label: "Global Document Logs", value: overview.total_files, icon: FileCode, color: "text-purple-400 bg-purple-500/5" },
    { label: "Total NLP Executions", value: overview.total_analyses, icon: Terminal, color: "text-emerald-400 bg-emerald-500/5" }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">Administrative Portal</h1>
          <p className="text-slate-400 text-xs">Examine database instances, users access, and system resource metrics.</p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 border border-darkBorder hover:border-slate-800 text-[10px] text-slate-400 hover:text-white rounded-xl transition-all font-bold uppercase tracking-wider flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Console</span>
        </button>
      </div>

      {/* Overview Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {overviewMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{m.label}</span>
                <span className="text-2xl font-extrabold text-white font-outfit mt-1.5 block">{m.value}</span>
              </div>
              <div className={`p-3 rounded-xl border border-darkBorder/80 ${m.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-darkBorder pb-px">
        {[
          { id: "system", label: "System Monitor", icon: Cpu },
          { id: "users", label: "Manage Users", icon: Users },
          { id: "analyses", label: "Manage Analyses", icon: ShieldAlert }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                isActive 
                  ? "border-cyan-500 text-cyan-400" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
        
        {/* Tab 1: System Monitor */}
        {tab === "system" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Resource stats */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Metrics Status</h3>
              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>NER Model State</span>
                  <span className="text-emerald-400 font-semibold uppercase">{overview.system_status.model_state}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>Model Framework</span>
                  <span className="text-slate-200 font-medium">{overview.system_status.model_framework}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>Authorized Device</span>
                  <span className="text-slate-200 font-mono font-semibold">{overview.system_status.device}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>CPU Usage</span>
                  <span className="text-cyan-400 font-bold">{overview.system_status.cpu_usage}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>RAM Usage</span>
                  <span className="text-purple-400 font-bold">{overview.system_status.memory_usage}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span>API Latency</span>
                  <span className="text-emerald-400 font-semibold">{overview.system_status.api_latency}</span>
                </div>
              </div>
            </div>

            {/* Active Logs */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Internal Service Logs</h3>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {overview.logs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl text-[10px] leading-relaxed flex items-start space-x-3">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1 rounded text-[8px] font-bold uppercase ${
                          log.level === "WARNING" ? "bg-amber-500/10 text-amber-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>{log.level}</span>
                        <span className="text-slate-500 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 mt-1 font-mono">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Users Management */}
        {tab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-darkBorder text-slate-500">
                  <th className="py-2.5 font-bold uppercase tracking-wider">Full Name</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider">Username</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider">Email</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider">Authorized Role</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/20 text-slate-300">
                    <td className="py-3 font-semibold text-white">{u.full_name}</td>
                    <td className="py-3 font-mono text-cyan-400 select-all">{u.username}</td>
                    <td className="py-3 text-slate-400 select-all">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${
                        u.role === "admin" 
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                          : "bg-slate-800 text-slate-400 border-slate-700/50"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        disabled={u.username === currentUser?.username}
                        className="p-1.5 border border-red-500/10 hover:border-red-500/25 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Analyses Management */}
        {tab === "analyses" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-darkBorder text-slate-500">
                  <th className="py-2.5 font-bold uppercase tracking-wider">User ID</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider">Type</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider">Preview Content</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-center">F1 Confidence</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {globalHistory.length > 0 ? (
                  globalHistory.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="py-3 font-semibold text-slate-200 select-all">{g.user_id}</td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          g.source_type === "document" ? "bg-purple-500/10 text-purple-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>{g.source_type}</span>
                      </td>
                      <td className="py-3 max-w-[250px] truncate" title={g.text}>
                        {g.source_type === "document" ? g.filename : g.text}
                      </td>
                      <td className="py-3 text-center font-bold text-emerald-400">
                        {(g.overall_confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteRecord(g.id)}
                          className="p-1.5 border border-red-500/10 hover:border-red-500/25 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                          title="Delete History Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No analyses recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
