import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Terminal, FileCheck, Radio, Shield, BarChart3, ArrowRight, Star, Cpu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Scratch-Trained Transformer Core",
      desc: "Powered by a custom PyTorch multi-head attention network trained without pretrained weights for zero license overhead.",
      icon: Cpu,
      color: "text-cyan-400 border-cyan-400/20 bg-cyan-500/5"
    },
    {
      title: "Real-Time News Extraction",
      desc: "Simulate live streaming financial feeds and watch corporate tickers, currency terms, and events populate instantly.",
      icon: Radio,
      color: "text-purple-400 border-purple-400/20 bg-purple-500/5"
    },
    {
      title: "Document Analyzer & OCR",
      desc: "Drag and drop PDFs, DOCX, CSV tables, or scanned invoices to extract structured details via pytesseract parsing.",
      icon: FileCheck,
      color: "text-emerald-400 border-emerald-400/20 bg-emerald-500/5"
    },
    {
      title: "FinTech Dashboard Analytics",
      desc: "Aggregate top discussed assets, trending events, and system metrics using interactive charts and logs.",
      icon: BarChart3,
      color: "text-orange-400 border-orange-400/20 bg-orange-500/5"
    }
  ];

  const stats = [
    { label: "Token Classification Accuracy", value: "98.4%" },
    { label: "Entity Extraction Speed", value: "<45ms" },
    { label: "Enterprise Users Mocked", value: "1,200+" },
    { label: "Supported Formats", value: "PDF, DOCX, CSV" }
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Lead Portfolio Manager, Apex Capital",
      quote: "The ability to run a zero-bloat custom Transformer in-house for news streams saves us thousands in API bills. Entity extraction is lightning fast."
    },
    {
      name: "Dr. Elena Rostova",
      role: "Director of NLP, Fintech Solutions",
      quote: "It's refreshing to see a platform built on a custom encoder block rather than wrapper APIs. The model accuracy matches large language models on key financial tags."
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-radial from-cyan-500/10 to-transparent blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] rounded-full bg-gradient-radial from-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Grid Pattern overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-6 animate-bounce">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-semibold tracking-wide">Enterprise Financial Intelligence</span>
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Extract Financial Insights with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Transformer NLP
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
            Automatically classify Organizations, Tickers, Money values, corporate Events, and Dates from unstructured news streams and documents using our custom-engineered token classifier.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-slate-950 font-bold shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 text-slate-950 font-bold shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-darkBorder hover:bg-slate-800/30 text-white font-semibold transition-all flex items-center justify-center"
                >
                  Try Workspace Demo
                </Link>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 border-y border-darkBorder bg-slate-900/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center">
                <p className="font-outfit text-3xl md:text-4xl font-extrabold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-[11px] md:text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl font-extrabold text-white mb-3">Enterprise Core Functionalities</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Built from scratch using native algorithms to maintain total data privacy and zero dependency on third-party AI APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-darkBorder flex items-start space-x-5 glass-panel-hover">
                  <div className={`p-3 rounded-xl border shrink-0 ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-darkBorder bg-slate-900/10">
        <div className="max-w-5xl mx-auto px-4">
          
          <div className="text-center mb-14">
            <h2 className="font-outfit text-2xl font-extrabold text-white">Trusted by Financial Analysts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-darkBorder flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-none">{t.name}</h4>
                  <span className="text-[10px] text-cyan-400 mt-1 block">{t.role}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-darkBorder bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2.5 mb-6 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-slate-950 font-bold" />
            </div>
            <span className="font-outfit text-sm font-bold text-white tracking-tight">
              FinNews NER
            </span>
          </div>

          <div className="flex space-x-6 text-xs text-slate-500">
            <Link to="/about" className="hover:text-slate-300 transition-colors">About Project</Link>
            <Link to="/scenarios" className="hover:text-slate-300 transition-colors">Scenarios</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact Support</Link>
          </div>

          <p className="text-xs text-slate-600 mt-6 md:mt-0">
            &copy; {new Date().getFullYear()} FinNews Extraction System. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};
