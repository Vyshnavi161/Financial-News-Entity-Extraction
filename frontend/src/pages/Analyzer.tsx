import React, { useState } from "react";
import { 
  Terminal, Sparkles, AlertCircle, FileText, 
  Download, RefreshCw, Cpu, CheckCircle, Tag
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

interface AnalysisResult {
  entities: Entity[];
  tokens: Token[];
  overall_confidence: number;
}

export const Analyzer: React.FC = () => {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rawJsonOpen, setRawJsonOpen] = useState(false);

  const headlinePresets = [
    {
      title: "Tesla Gigafactory Expansion",
      text: "Tesla announced a $5 billion investment plan on Monday to expand its Berlin gigafactory. The stock (TSLA) reacted positively, jumping 3.4%."
    },
    {
      title: "Apple PayPlus Acquisition",
      text: "Apple acquired PayPlus in a $2B deal finalized on Tuesday. The acquisition will allow the tech giant (AAPL) to enhance its payments infrastructure."
    },
    {
      title: "Microsoft Cloud Earnings",
      text: "Microsoft reported Q3 earnings growth yesterday, exceeding forecasts with total cloud revenue reaching $25 billion. The company (MSFT) credited AI."
    }
  ];

  const handlePresetClick = (presetText: string) => {
    setText(presetText);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyzer/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.detail || "Analysis failed. Please check inputs.");
      }
    } catch (e) {
      setError("Failed to communicate with NLP server. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleExportCSV = () => {
    if (!result || result.entities.length === 0) return;
    
    // Construct CSV content
    const headers = "Entity Text,Entity Type,Model Confidence\n";
    const rows = result.entities.map(e => 
      `"${e.text.replace(/"/g, '""')}",${e.type},${(e.confidence * 100).toFixed(1)}%`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finnews_ner_extraction_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">AI News Workspace</h1>
        <p className="text-slate-400 text-xs">Pasted unstructured statements and analyze them using our custom Transformer.</p>
      </div>

      {/* Editor & Presets Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Presets Sidebar */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-1 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-cyan-400" /> Presets Headlines
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Click any headline preset below to populate the workspace with test financial data.
          </p>
          <div className="space-y-2">
            {headlinePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset.text)}
                className="w-full text-left p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 text-slate-300 rounded-xl transition-all group"
              >
                <h4 className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">{preset.title}</h4>
                <p className="text-[10px] text-slate-500 mt-1 truncate">{preset.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="glass-panel p-6 rounded-2xl border border-darkBorder lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <Terminal className="w-4 h-4 mr-2 text-cyan-400" /> Raw Statements Editor
          </h3>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
              setError(null);
            }}
            placeholder="Paste news articles or financial headlines here..."
            className="w-full p-4 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setText("");
                setResult(null);
                setError(null);
              }}
              className="px-3.5 py-2 border border-darkBorder hover:border-slate-800 text-[10px] text-slate-400 hover:text-white rounded-xl transition-colors font-bold uppercase tracking-wider"
            >
              Clear Editor
            </button>
            
            <button
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-extrabold text-[10px] rounded-xl shadow-lg hover:shadow-cyan-500/10 transition-all uppercase tracking-wider disabled:opacity-40 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Extraction...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Extract Entities</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Error Output block */}
      {error && (
        <div className="flex items-center space-x-2.5 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Highlighted text container */}
          <div className="glass-panel p-6 rounded-2xl border border-darkBorder lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-darkBorder/40 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Segmented Entity Map
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center">
                <Cpu className="w-3.5 h-3.5 mr-1" /> Model Evaluation Complete
              </span>
            </div>
            
            <div className="py-2">
              <EntityHighlighter tokens={result.tokens} />
            </div>
          </div>

          {/* Stats details & Actions */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Confidence Card */}
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">NLP F1 Confidence</span>
                <span className="text-2xl font-extrabold text-white font-outfit mt-1 block">
                  {(result.overall_confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
            </div>

            {/* Actions list */}
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Export Data</h4>
              
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs rounded-xl transition-all"
              >
                <span className="flex items-center"><Download className="w-4 h-4 mr-2 text-cyan-400" /> Export CSV Table</span>
                <span className="text-[9px] text-slate-500 uppercase">.csv</span>
              </button>

              <button
                onClick={() => setRawJsonOpen(!rawJsonOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs rounded-xl transition-all"
              >
                <span className="flex items-center"><FileText className="w-4 h-4 mr-2 text-purple-400" /> View Raw Response JSON</span>
                <span className="text-[9px] text-slate-500 uppercase">.json</span>
              </button>
            </div>

          </div>

          {/* Structured Table */}
          {result.entities.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-cyan-400" /> Extracted Entities Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-darkBorder text-slate-500">
                      <th className="py-2.5 font-bold uppercase tracking-wider">Entity Text</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider text-center">Class Label</th>
                      <th className="py-2.5 font-bold uppercase tracking-wider text-right">Confidence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkBorder/40">
                    {result.entities.map((e, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="py-2.5 font-bold select-all">{e.text}</td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border tracking-wider uppercase shrink-0 ${getEntityBadgeStyle(e.type)}`}>
                            {e.type}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-emerald-400">
                          {(e.confidence * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw JSON View block */}
          {rawJsonOpen && (
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-3 space-y-2 animate-in slide-in-from-top-4 duration-200">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Raw API JSON Payload</span>
              <pre className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-[10px] text-slate-400 overflow-x-auto select-all leading-normal font-mono max-h-[250px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
