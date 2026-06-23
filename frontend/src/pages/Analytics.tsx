import React, { useState, useEffect } from "react";
import { 
  BarChart3, Search, Trash2, Calendar, FileText, 
  ExternalLink, ChevronLeft, ChevronRight, Eye, Tag
} from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";
import { TableSkeleton } from "../components/Skeletons";

interface Entity {
  text: string;
  type: string;
  confidence: number;
}

interface AnalysisItem {
  id: string;
  text: string;
  source_type: "news" | "document";
  filename?: string;
  entities: Entity[];
  overall_confidence: number;
  created_at: string;
}

export const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "news" | "document">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Selected item for modal inspect
  const [selectedItem, setSelectedItem] = useState<AnalysisItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(
        `${API_BASE_URL}/api/analyzer/history?page=${page}&limit=${limit}${searchParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        
        // Filter by source type client-side if needed, but since total is returned,
        // we'll apply client filters or map items directly.
        let filteredItems = data.items;
        if (filterType !== "all") {
          filteredItems = filteredItems.filter((i: AnalysisItem) => i.source_type === filterType);
        }
        
        setItems(filteredItems);
        setTotal(data.total);
      } else {
        setError("Failed to fetch analytics records.");
      }
    } catch (e) {
      setError("Network error fetching extraction logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, page, filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this analysis record?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyzer/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh
        if (selectedItem?.id === id) setSelectedItem(null);
        fetchHistory();
      } else {
        alert("Failed to delete the selected record.");
      }
    } catch (e) {
      alert("Error deleting record.");
    }
  };

  const getEntityBadgeStyle = (type: string) => {
    const maps: Record<string, string> = {
      ORG: "bg-blue-500/10 text-blue-400 border-blue-500/25",
      TICKER: "bg-red-500/10 text-red-400 border-red-500/25",
      MONEY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      EVENT: "bg-orange-500/10 text-orange-400 border-orange-500/25",
      DATE: "bg-purple-500/10 text-purple-400 border-purple-500/25"
    };
    return maps[type.toUpperCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/25";
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">Historical Analytics</h1>
        <p className="text-slate-400 text-xs">Examine past news Extractions and document entities.</p>
      </div>

      {/* Filters & Search Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-darkBorder bg-slate-900/10">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
          <span className="absolute left-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords inside text logs..."
            className="w-full pl-9 pr-20 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-[10px] rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Picker */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source Type</span>
          <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["all", "news", "document"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilterType(t);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  filterType === t 
                    ? "bg-cyan-500 text-slate-950" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Analytics Main Log Table */}
      <div className="glass-panel p-5 rounded-2xl border border-darkBorder overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="py-12 text-center text-red-400 text-xs font-semibold">{error}</div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-darkBorder text-slate-500">
                    <th className="py-3 font-bold uppercase tracking-wider">Created At</th>
                    <th className="py-3 font-bold uppercase tracking-wider">Source</th>
                    <th className="py-3 font-bold uppercase tracking-wider">Text Extract Preview</th>
                    <th className="py-3 font-bold uppercase tracking-wider text-center">Entities</th>
                    <th className="py-3 font-bold uppercase tracking-wider text-center">Avg Confidence</th>
                    <th className="py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkBorder/40">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/20 text-slate-300">
                      <td className="py-3 font-medium text-slate-400 select-all whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          item.source_type === "document" 
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}>
                          {item.source_type}
                        </span>
                      </td>
                      <td className="py-3 max-w-[280px] truncate" title={item.text}>
                        {item.source_type === "document" ? (
                          <span className="flex items-center text-purple-300 font-medium">
                            <FileText className="w-3.5 h-3.5 mr-1 shrink-0" /> {item.filename}
                          </span>
                        ) : (
                          item.text
                        )}
                      </td>
                      <td className="py-3 text-center font-bold font-mono text-cyan-400">
                        {item.entities.length}
                      </td>
                      <td className="py-3 text-center font-semibold text-emerald-400">
                        {(item.overall_confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 border border-darkBorder hover:border-cyan-500/30 rounded-lg hover:text-cyan-400 transition-colors"
                            title="Inspect Entities"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 border border-red-500/10 hover:border-red-500/25 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-darkBorder/40">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Showing {items.length} of {total} records
              </span>
              <div className="flex space-x-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-darkBorder text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-darkBorder text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            No historical records match filters.
          </div>
        )}
      </div>

      {/* Inspect Entities Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col justify-between h-[450px]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-darkBorder pb-3">
              <div>
                <h3 className="font-outfit font-bold text-white text-base">Extraction Inspection</h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  ID: {selectedItem.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white rounded-lg transition-colors font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Source Text</span>
                <p className="p-3 bg-slate-900/50 border border-slate-900 rounded-xl text-slate-300 text-xs leading-relaxed max-h-[120px] overflow-y-auto">
                  {selectedItem.text}
                </p>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Detected Entities ({selectedItem.entities.length})</span>
                {selectedItem.entities.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItem.entities.map((e, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-900 rounded-xl">
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border tracking-wider uppercase shrink-0 ${getEntityBadgeStyle(e.type)}`}>
                            {e.type}
                          </span>
                          <span className="text-xs font-bold text-white leading-none select-all">{e.text}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold font-mono">{(e.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No financial entities extracted in this record.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-darkBorder/40 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(selectedItem.created_at).toLocaleString()}</span>
              <span className="text-emerald-400">Total F1 Confidence: {(selectedItem.overall_confidence * 100).toFixed(1)}%</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
