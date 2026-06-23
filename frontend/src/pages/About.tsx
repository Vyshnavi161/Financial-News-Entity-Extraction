import React from "react";
import { Info, Cpu, CheckCircle2, Award, Zap } from "lucide-react";

export const About: React.FC = () => {
  const highlights = [
    {
      title: "In-House Data Security",
      desc: "By training a custom NLP model, all news text and uploaded financial files are processed locally. No data is transmitted to external corporate LLM providers."
    },
    {
      title: "Zero API Volatility",
      desc: "Running model parameters natively in PyTorch/CPU saves enterprise environments from rate limits, pricing hikes, and network latency fluctuations."
    },
    {
      title: "Finance Vocab Optimization",
      desc: "Our custom FinanceTokenizer is fitted specifically on financial reports and tickers, yielding clean tokenization bounds for currencies and values."
    }
  ];

  const entitiesDefined = [
    { tag: "ORG", name: "Company Names", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", desc: "Extracts corporate entities, subsidiaries, and institutions (e.g., Tesla Inc., Apple, Goldman Sachs)." },
    { tag: "TICKER", name: "Stock Tickers", color: "text-red-400 bg-red-500/10 border-red-500/20", desc: "Locates trading codes and equity symbols (e.g., TSLA, AAPL, MSFT, NVDA)." },
    { tag: "MONEY", name: "Financial Values", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", desc: "Extracts deal sizes, revenue metrics, pricing, or currency statements (e.g., $5 billion, £80M, €150)." },
    { tag: "EVENT", name: "Corporate Actions", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", desc: "Flags market-moving events (e.g., acquisition deal, earnings growth, stock split, share buyback)." },
    { tag: "DATE", name: "Time Frames", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", desc: "Locates calendar bounds and economic windows (e.g., Monday, Q3 2026, December, fiscal year 2026)." }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 font-sans pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-darkBorder relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-xl" />
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Info className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-outfit text-3xl font-extrabold text-white">About The Platform</h1>
            <p className="text-slate-400 text-xs mt-1">Financial News Named Entity Recognition (NER) Intelligence</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mt-4">
          This system is an enterprise-grade NLP intelligence workspace designed to ingest unstructured financial texts, press releases, or scanned documents, and yield structured tabular outputs of core market indicators. It serves investment analysts, compliance teams, and hedge funds who need to monitor hundreds of feeds in real time.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {highlights.map((h, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-darkBorder hover:border-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">{h.title}</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      {/* Target Labels Definitions */}
      <div className="glass-panel p-6 rounded-2xl border border-darkBorder">
        <h2 className="font-outfit text-lg font-bold text-white mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-400" /> Target Label System
        </h2>
        <div className="space-y-4">
          {entitiesDefined.map((ed, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-slate-900/30 border border-slate-900 rounded-xl">
              <div className={`px-2.5 py-1 text-xs font-extrabold rounded-md border tracking-wider select-all ${ed.color}`}>
                {ed.tag}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">{ed.name}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{ed.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-lg">
          <h3 className="font-outfit text-base font-bold text-white flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-emerald-400" /> Training Methodology
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            The underlying Named Entity Recognition model is compiled in PyTorch. The training sequence compiles a local dictionary from generated financial news templates, and trains on aligned multi-head self-attention bounds. During backpropagation, it fits cross-entropy updates to classify sequence elements with token classification heads, ignoring padding blocks.
          </p>
          <div className="flex items-center space-x-2 text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked & Trained From Scratch
          </div>
        </div>
        <div className="w-full md:w-auto shrink-0 bg-slate-900 border border-slate-800 p-4 rounded-xl text-center space-y-1">
          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Vocabulary Load</p>
          <p className="text-2xl font-extrabold text-white font-outfit">1,450+</p>
          <p className="text-[9px] text-slate-400">Contextual Tokens</p>
        </div>
      </div>

    </div>
  );
};
