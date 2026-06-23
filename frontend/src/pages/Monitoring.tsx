import React, { useState, useEffect } from "react";
import { 
  Radio, Play, Pause, RefreshCw, Cpu, 
  Calendar, Building2, TrendingUp, AlertCircle
} from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";
import { EntityHighlighter } from "../components/EntityHighlighter";

interface Entity {
  text: string;
  type: string;
  confidence: number;
}

interface Token {
  text: string;
  label: string;
  confidence: number;
}

interface NewsItem {
  id: string;
  headline: string;
  content: string;
  source: string;
  category: string;
  timestamp: string;
  entities: Entity[];
  tokens: Token[];
  overall_confidence: number;
}

export const Monitoring: React.FC = () => {
  const { token } = useAuth();
  const [feed, setFeed] = useState<NewsItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial batch
  const fetchInitialFeed = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/monitoring/news`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeed(data);
        setError(null);
      } else {
        setError("Failed to fetch monitoring feed.");
      }
    } catch (e) {
      setError("Failed to connect to real-time feed server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialFeed();
  }, [token]);

  // Set up polling simulation for "pulse"
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/monitoring/pulse`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data: NewsItem = await res.json();
          // Avoid duplicate ID if it randomly draws same template
          setFeed((prev) => {
            const exists = prev.some((item) => item.headline === data.headline);
            if (exists) {
              // Modify timestamp slightly and allow it to append anyway
              const modifiedData = { ...data, id: `rand_${Date.now()}` };
              return [modifiedData, ...prev.slice(0, 14)];
            }
            return [data, ...prev.slice(0, 14)];
          });
        }
      } catch (e) {
        console.error("Pulse fetch failed", e);
      }
    }, 7000); // Pulse every 7 seconds

    return () => clearInterval(interval);
  }, [token, isPlaying]);

  const getEntityBadgeStyle = (type: string) => {
    const maps: Record<string, string> = {
      ORG: "bg-blue-500/15 text-blue-400 border-blue-500/35",
      TICKER: "bg-red-500/15 text-red-400 border-red-500/35",
      MONEY: "bg-emerald-500/15 text-emerald-400 border-emerald-500/35",
      EVENT: "bg-orange-500/15 text-orange-400 border-orange-500/35",
      DATE: "bg-purple-500/15 text-purple-400 border-purple-500/35"
    };
    return maps[type.toUpperCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/25";
  };

  return (
    <div className="space-y-8 font-sans pb-12 relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">Real-Time News Stream</h1>
          <p className="text-slate-400 text-xs">Simulated live feed of corporate statements analyzed dynamically.</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
              isPlaying 
                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25" 
                : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setLoading(true);
              fetchInitialFeed();
            }}
            className="p-2 border border-darkBorder hover:border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Scrolling Ticker */}
      {feed.length > 0 && (
        <div className="w-full bg-slate-900/60 border border-darkBorder py-2 rounded-xl overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="whitespace-nowrap flex space-x-10 animate-grid-scroll" style={{ animationDuration: "35s" }}>
            {feed.slice(0, 5).map((item, idx) => (
              <div key={idx} className="inline-flex items-center space-x-2.5 text-[11px] text-slate-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                <span className="text-white font-semibold">{item.headline}</span>
                <span className="text-cyan-400 uppercase font-mono tracking-wide">{item.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Cards Feed */}
      {loading ? (
        <div className="py-12 text-center text-cyan-400 text-xs font-semibold">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <span>Synchronizing live feed parameters...</span>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2.5 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : feed.length > 0 ? (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {feed.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel p-5 rounded-2xl border border-darkBorder flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden group animate-in slide-in-from-top-4 duration-300"
            >
              
              {/* Category tag decoration line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-600 opacity-60" />

              {/* Left Side: Article info & Highlights */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-cyan-400 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center font-semibold">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight select-all">
                  {item.headline}
                </h3>
                
                <div className="py-1">
                  <EntityHighlighter tokens={item.tokens} />
                </div>
              </div>

              {/* Right Side: Entity badge lists */}
              <div className="md:w-56 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-darkBorder/40 pt-4 md:pt-0 md:pl-5 space-y-3 text-xs">
                
                {/* Entities List */}
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block mb-2">Extracted Entities</span>
                  {item.entities && item.entities.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.entities.map((e, eIdx) => (
                        <div 
                          key={eIdx} 
                          className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border tracking-wider uppercase select-all ${getEntityBadgeStyle(e.type)}`}
                          title={`Text: ${e.text} | Confidence: ${(e.confidence * 100).toFixed(1)}%`}
                        >
                          {e.text.slice(0, 12)}{e.text.length > 12 ? ".." : ""} ({e.type})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic block">No entities found.</span>
                  )}
                </div>

                {/* Score */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold border-t border-darkBorder/30 pt-3">
                  <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" /> {item.source}</span>
                  <span className="text-emerald-400 font-mono font-bold">{(item.overall_confidence * 100).toFixed(1)}%</span>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 italic text-xs font-semibold">
          No live streaming content loaded yet.
        </div>
      )}

    </div>
  );
};
