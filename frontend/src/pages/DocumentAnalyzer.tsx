import React, { useState, useEffect, useRef } from "react";
import { 
  FileCode, Upload, CheckCircle, AlertCircle, RefreshCw, 
  Trash2, Download, History, Tag, Eye, Info
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

interface UploadResponse {
  file_id: string;
  filename: string;
  size: number;
  text: string;
  entities: Entity[];
  tokens: Token[];
  overall_confidence: number;
}

interface HistoryFile {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  created_at: string;
}

export const DocumentAnalyzer: React.FC = () => {
  const { token } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [filesHistory, setFilesHistory] = useState<HistoryFile[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFilesHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFilesHistory(data);
      }
    } catch (e) {
      console.error("Error fetching files list", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchFilesHistory();
  }, [token]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadPercent(10);
    setError(null);
    setResult(null);

    // Simulate progress updates
    const timer = setInterval(() => {
      setUploadPercent(p => (p >= 85 ? p : p + 15));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(timer);
      setUploadPercent(100);

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        fetchFilesHistory(); // Refresh history
      } else {
        setError(data.detail || "File processing failed. Ensure file is readable.");
      }
    } catch (e) {
      clearInterval(timer);
      setError("Network error. Failed to dispatch file to backend.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteFile = async (id: string) => {
    if (!window.confirm("Delete this document and all its extracted entity metrics?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (result?.file_id === id) setResult(null);
        fetchFilesHistory();
      } else {
        alert("Delete request failed.");
      }
    } catch (e) {
      alert("Error deleting file.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-white tracking-tight">Document Workspace</h1>
        <p className="text-slate-400 text-xs">Upload structured or scanned text documents to extract financial entities.</p>
      </div>

      {/* Main Drag-Drop Area & Sidebar History split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Box */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleTriggerInput}
            className={`glass-panel p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px] ${
              dragActive 
                ? "border-cyan-500 bg-cyan-500/5 shadow-cyan-500/10 shadow-lg" 
                : "border-slate-800 hover:border-slate-700/80 bg-slate-900/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".pdf,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg"
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-4 w-full max-w-xs">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Extracting text & entities</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Uploading document... {uploadPercent}%</p>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div className="bg-cyan-500 h-full transition-all duration-200" style={{ width: `${uploadPercent}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Drag & drop financial file here</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Supports PDF, DOCX, TXT, CSV, or PNG/JPG scans (with OCR Fallback).
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase rounded-lg hover:border-cyan-500/35 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="flex items-center space-x-2.5 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Recent Uploads Sidebar */}
        <div className="glass-panel p-5 rounded-2xl border border-darkBorder lg:col-span-1 space-y-4 h-fit max-h-[300px] overflow-y-auto">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
            <History className="w-4 h-4 mr-2 text-cyan-400" /> Recent Uploads
          </h3>
          
          {historyLoading ? (
            <div className="py-6 text-center text-slate-500 text-[11px]">Loading history...</div>
          ) : filesHistory.length > 0 ? (
            <div className="space-y-2.5">
              {filesHistory.map((fh) => (
                <div key={fh.id} className="flex items-center justify-between p-2.5 bg-slate-900/50 border border-slate-900 rounded-xl group">
                  <div className="flex items-center space-x-2.5 max-w-[70%]">
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="truncate text-[10px] text-slate-300 font-medium">
                      <p className="truncate font-bold text-white" title={fh.filename}>{fh.filename}</p>
                      <p className="text-slate-500 text-[9px] mt-0.5">{formatBytes(fh.size)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteFile(fh.id)}
                    className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/5 rounded transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                    title="Delete File Log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-[11px] italic">
              No recent files uploaded.
            </div>
          )}
        </div>

      </div>

      {/* Upload Results Preview */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Highlighted text container */}
          <div className="glass-panel p-6 rounded-2xl border border-darkBorder lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-darkBorder/40 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> Extracted Text entity Map
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Processed Size: {formatBytes(result.size)}
              </span>
            </div>
            
            <div className="py-2 max-h-[300px] overflow-y-auto pr-1">
              <EntityHighlighter tokens={result.tokens} />
            </div>
          </div>

          {/* Stats details & Actions */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Confidence Card */}
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Overall Confidence</span>
                <span className="text-2xl font-extrabold text-white font-outfit mt-1 block">
                  {(result.overall_confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            {/* OCR Info Card */}
            <div className="glass-panel p-5 rounded-2xl border border-darkBorder/60 bg-slate-900/10 flex items-start space-x-3 text-[10px] text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-400 mb-1">OCR Processing</p>
                <p>If you upload an image report scan, the backend OCR module will automatically reconstruct lines before running entity classification.</p>
              </div>
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

        </div>
      )}

    </div>
  );
};
