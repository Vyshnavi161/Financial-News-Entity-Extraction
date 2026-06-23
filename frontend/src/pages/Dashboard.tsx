import React, { useState, useEffect } from "react";
import { 
  Terminal, FileCode, CheckCircle, BarChart3, TrendingUp,
  Cpu, Zap, Calendar, History
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { API_BASE_URL, useAuth } from "../context/AuthContext";
import { CardSkeleton, ChartSkeleton } from "../components/Skeletons";

interface StatItem {
  name: string;
  count?: number;
  value?: number;
}

interface TrendItem {
  date: string;
  analyses: number;
  entities: number;
}

interface DashboardStats {
  total_analyses: number;
  total_documents: number;
  top_companies: StatItem[];
  top_events: StatItem[];
  top_tickers: StatItem[];
  entity_distribution: StatItem[];
  trend_data: TrendItem[];
  accuracy_metric: number;
  speed_metric: string;
}

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers });
        const historyRes = await fetch(`${API_BASE_URL}/api/dashboard/history`, { headers });
        
        if (statsRes.ok && historyRes.ok) {
          const statsData = await statsRes.json();
          const historyData = await historyRes.json();
          setStats(statsData);
          setHistory(historyData);
        } else {
          setError("Failed to retrieve dashboard records. Is backend running?");
        }
      } catch (e) {
        setError("Network error fetching workspace insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 font-sans">
        <h1 className="font-outfit text-2xl font-bold text-white">FinNews Intelligence Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-sm font-semibold max-w-lg mx-auto text-center space-y-2">
        <p>{error || "An unexpected error occurred."}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Retry Load</button>
      </div>
    );
  }

  // Color mappings for PieChart
  const COLORS = ["#00F0FF", "#A855F7", "#10B981", "#F97316", "#EF4444"];

  const topMetricCards = [
    { label: "Total Text Analyses", value: stats.total_analyses, icon: Terminal, color: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5" },
    { label: "Document Uploads", value: stats.total_documents, icon: FileCode, color: "text-purple-400 border-purple-500/10 bg-purple-500/5" },
    { label: "Classification F1", value: `${stats.accuracy_metric}%`, icon: Cpu, color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" },
    { label: "Extraction Speed", value: stats.speed_metric, icon: Zap, color: "text-orange-400 border-orange-500/10 bg-orange-500/5" }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">FinNews Intelligence Dashboard</h1>
          <p className="text-slate-400 text-xs">Real-time NLP Named Entity Recognition analytics.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>Live Tracking Active</span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetricCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{c.label}</p>
                <p className="font-outfit text-2xl font-extrabold text-white mt-1.5">{c.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${c.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-cyan-400" /> 7-Day Activity Trend
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                  itemStyle={{ color: "#00F0FF", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="analyses" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorAnalyses)" name="Analyses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Distribution Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-purple-400" /> Entity Distribution
          </h3>
          <div className="h-[180px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.entity_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.entity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Label */}
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Labels</span>
              <span className="text-xl font-extrabold text-white font-outfit">
                {stats.entity_distribution.reduce((acc, curr) => acc + (curr.value || 0), 0)}
              </span>
            </div>
          </div>
          
          {/* Custom Legends list */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.entity_distribution.map((ed, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-[10px] text-slate-400 font-medium truncate" title={ed.name}>{ed.name.split(" ")[0]} ({ed.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Block: Top Companies Bar Chart + Recent History log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Companies Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" /> Top Entities Extracted
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_companies} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={80} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px" }}
                  itemStyle={{ color: "#10B981", fontSize: "10px" }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} name="Frequency">
                  {stats.top_companies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#00F0FF" : "#10B981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
            <History className="w-4 h-4 mr-2 text-orange-400" /> Recent Extraction Log
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-darkBorder text-slate-500">
                  <th className="py-2.5 font-bold uppercase tracking-wider">Input Source</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-center">Type</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-center">Entities</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {history.length > 0 ? (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="py-3 font-medium truncate max-w-[200px]" title={h.text}>
                        {h.source_type === "document" ? h.filename : h.text}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                          h.source_type === "document" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>
                          {h.source_type}
                        </span>
                      </td>
                      <td className="py-3 text-center font-semibold font-mono text-cyan-400">
                        {h.entities ? h.entities.length : 0}
                      </td>
                      <td className="py-3 text-right font-semibold text-emerald-400">
                        {h.overall_confidence ? `${(h.overall_confidence * 100).toFixed(1)}%` : "98%"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No analyses recorded in history log.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
