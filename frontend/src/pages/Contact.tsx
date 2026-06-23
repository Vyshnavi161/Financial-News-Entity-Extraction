import React, { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, CheckCircle, Sparkles } from "lucide-react";

export const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate API dispatch
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 font-sans pb-12">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl items-center justify-center text-cyan-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <h1 className="font-outfit text-3xl font-extrabold text-white">Get In Touch</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Have questions about the custom Transformer architecture, model performance, or enterprise licensing? Submit a query below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Contact Info */}
        <div className="space-y-4 md:col-span-1">
          <div className="glass-panel p-5 rounded-2xl border border-darkBorder space-y-4">
            <h3 className="text-sm font-bold text-white mb-2">Corporate Details</h3>
            
            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>intelligence@finnews-ner.io</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-purple-400 shrink-0" />
              <span>+1 (800) 555-FIN-NER</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suite 450, Market Street, San Francisco, CA</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-darkBorder/60 bg-slate-900/10 text-[10px] text-slate-500 leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 mb-2" />
            Our NLP systems operate in highly secure environments. On-premise training code and weight configurations are available for banking partners.
          </div>
        </div>

        {/* Right Side: Inquiry Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 rounded-2xl border border-darkBorder shadow-xl relative">
            
            {submitted && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-3 z-10 animate-in fade-in duration-300">
                <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
                <h3 className="text-sm font-bold text-white">Inquiry Dispatched Successfully</h3>
                <p className="text-[11px] text-slate-400">Our engineering representatives will contact you shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Inquiry Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject (optional)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Message</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message here..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-cyan-500/10 transition-all"
              >
                Send Message
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
