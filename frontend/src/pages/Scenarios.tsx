import React, { useState } from "react";
import { 
  Radio, TrendingUp, FileCheck, ArrowRight, Sparkles, 
  ChevronDown, ChevronUp, Bot, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

interface ScenarioItem {
  id: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  input: string;
  entities: { text: string; type: string; color: string }[];
  benefit: string;
}

export const Scenarios: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>("news");

  const scenarios: ScenarioItem[] = [
    {
      id: "news",
      title: "Real-Time Financial News Monitoring",
      desc: "Hedge funds and news desks parse incoming Bloomberg/Reuters headlines. The AI highlights transaction values and events immediately.",
      icon: Radio,
      color: "from-cyan-500 to-blue-600 text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
      input: "Apple acquired payment startup PayPlus in a $2B deal finalized on Tuesday.",
      entities: [
        { text: "Apple", type: "ORG", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
        { text: "PayPlus", type: "ORG", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
        { text: "$2B", type: "MONEY", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
        { text: "deal", type: "EVENT", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
        { text: "Tuesday", type: "DATE", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
      ],
      benefit: "Saves portfolio managers from scanning paragraphs manually, decreasing trade signal latency from minutes to milliseconds."
    },
    {
      id: "market",
      title: "Stock Market Insights Generation",
      desc: "Brokerages scan earnings releases and executive statements to link financial metrics back to asset tickers dynamically.",
      icon: TrendingUp,
      color: "from-red-500 to-pink-600 text-red-400 border-red-500/20 bg-red-500/5",
      input: "NVIDIA (NVDA) stock splits after crossing $1.2 trillion market cap on Thursday.",
      entities: [
        { text: "NVIDIA", type: "ORG", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
        { text: "NVDA", type: "TICKER", color: "bg-red-500/10 text-red-400 border-red-500/30" },
        { text: "$1.2 trillion", type: "MONEY", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
        { text: "stock splits", type: "EVENT", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
        { text: "Thursday", type: "DATE", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
      ],
      benefit: "Automatically updates broker spreadsheets, linking corporate milestones directly to database stock tickers."
    },
    {
      id: "document",
      title: "Automated Financial Document Review",
      desc: "Audit firms and banks ingest credit agreements, financial tables, and scanned invoices, logging totals and entities instantly.",
      icon: FileCheck,
      color: "from-emerald-500 to-teal-600 text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      input: "JPMorgan Chase reported record-breaking net interest income valued at $14 billion in Q3 2026.",
      entities: [
        { text: "JPMorgan Chase", type: "ORG", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
        { text: "$14 billion", type: "MONEY", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
        { text: "net interest income", type: "EVENT", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
        { text: "Q3 2026", type: "DATE", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" }
      ],
      benefit: "Accelerates due-diligence cycles. Scans and matches balance sheets against databases, decreasing human auditing error rates."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl items-center justify-center text-cyan-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="font-outfit text-3xl font-extrabold text-white">Business Scenarios</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Explore how our custom Transformer NER pipeline fits into enterprise workflows across banking, auditing, and asset management.
        </p>
      </div>

      {/* Scenario cards */}
      <div className="space-y-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeId === sc.id;
          return (
            <div 
              key={sc.id} 
              className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
                isActive ? "border-cyan-500/40 bg-slate-900/20 shadow-lg shadow-cyan-500/5" : "border-darkBorder hover:border-slate-800 bg-slate-900/10"
              }`}
            >
              
              {/* Header Toggle */}
              <div 
                onClick={() => setActiveId(isActive ? null : sc.id)}
                className="p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-tr ${sc.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{sc.title}</h3>
                    <p className="text-slate-400 text-[10px] mt-0.5">{sc.desc.slice(0, 75)}...</p>
                  </div>
                </div>
                <div className="text-slate-500 hover:text-white p-1 rounded-lg">
                  {isActive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expandable Section */}
              {isActive && (
                <div className="px-5 pb-6 pt-2 border-t border-darkBorder/40 space-y-4 animate-in slide-in-from-top-3 duration-200">
                  <p className="text-slate-300 text-xs leading-relaxed">{sc.desc}</p>
                  
                  {/* Visual Example Preview */}
                  <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Example Text Statement</span>
                      <p className="text-xs text-white leading-relaxed select-all italic">"{sc.input}"</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-2">Resulting Entity Classifications</span>
                      <div className="flex flex-wrap gap-2">
                        {sc.entities.map((e, idx) => (
                          <div key={idx} className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold border tracking-wide uppercase select-all ${e.color}`}>
                            {e.text}
                            <span className="ml-1.5 opacity-60 text-[8px] tracking-widest font-sans font-semibold">({e.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Business Value */}
                  <div className="flex items-start space-x-3 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                    <Bot className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider block">Operational Benefit</span>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">{sc.benefit}</p>
                    </div>
                  </div>

                  {/* Navigation link workspace */}
                  <div className="flex justify-end pt-2">
                    <Link
                      to={sc.id === "document" ? "/document-analyzer" : "/analyzer"}
                      className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline uppercase tracking-wider"
                    >
                      <span>Try workspace analyzer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
