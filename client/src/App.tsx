import React, { useState, useEffect } from 'react';
import './index.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Globe, CheckCircle, AlertCircle, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'extracting' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'extracting' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/status/${jobId}`);
          if (res.data.status === 'completed') {
            setStatus('completed');
            setProgress(100);
            clearInterval(interval);
          } else if (res.data.status === 'failed') {
            setStatus('failed');
            setError(res.data.error);
            clearInterval(interval);
          } else {
            setProgress(prev => Math.min(prev + 5, 95));
          }
        } catch (err) {
          console.error('Status fetch error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, jobId]);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      setStatus('extracting');
      setProgress(10);
      setError(null);
      const res = await axios.post(`${API_BASE}/extract`, { url });
      setJobId(res.data.jobId);
    } catch (err: any) {
      setStatus('failed');
      setError(err.response?.data?.error || 'Failed to start extraction');
    }
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`${API_BASE}/download/${jobId}`, '_blank');
    }
  };

  const resetState = () => {
    setStatus('idle');
    setUrl('');
    setProgress(0);
    setError(null);
    setJobId(null);
  };

  return (
    <div className="relative min-h-screen w-full font-apple bg-[#030303] text-white overflow-x-hidden">
      <style>{`
        .premium-card {
          background: rgba(18, 18, 18, 0.7) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 24px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .premium-input {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 20px 24px 20px 56px !important;
          border-radius: 14px !important;
          color: white !important;
        }
        .btn-apple {
          background: #ffffff !important;
          color: #000000 !important;
          padding: 18px 36px !important;
          border-radius: 30px !important;
          font-weight: 600 !important;
        }
        h1 {
          background: linear-gradient(to bottom, #ffffff, #a1a1a6) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
      `}</style>
      {/* Animated Background Component */}
      <div className="fixed inset-0 z-0">
        <HeroGeometric />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-[15vh] pb-12 flex flex-col items-center justify-center min-h-screen">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              SnapSite Pro
            </h1>
            <p className="text-white/40 text-base md:text-lg max-w-lg mx-auto leading-relaxed font-light">
              Precision extraction module for modern web architecture. 
              Transform any URL into a production-ready codebase.
            </p>
          </motion.div>
        </header>

        <main className="w-full flex justify-center">
          <motion.div 
            className="premium-card w-full max-w-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="p-8 md:p-10">
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.form 
                    key="idle"
                    onSubmit={handleExtract}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60 transition-colors" size={20} />
                      <input 
                        type="url" 
                        className="premium-input" 
                        placeholder="Enter website URL (https://...)" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-apple w-full flex items-center justify-center gap-2">
                      Begin Extraction <ArrowRight size={20} />
                    </button>
                  </motion.form>
                )}

                {status === 'extracting' && (
                  <motion.div 
                    key="extracting"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    <Loader2 className="animate-spin mx-auto mb-8 text-white" size={40} />
                    <h2 className="text-3xl font-semibold mb-3">Siphoning assets</h2>
                    <p className="text-white/40 text-lg mb-8">
                      Processing {new URL(url).hostname}
                    </p>
                    
                    <div className="progress-container mb-4">
                      <motion.div 
                        className="progress-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium tracking-widest text-white/60 uppercase">{progress}% Complete</p>
                  </motion.div>
                )}

                {status === 'completed' && (
                  <motion.div 
                    key="completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                      <CheckCircle className="text-white" size={40} />
                    </motion.div>
                    <h2 className="text-3xl font-semibold mb-3">Extraction successful</h2>
                    <p className="text-white/40 text-lg mb-10">
                      The archive is prepared and optimized for local development.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={resetState} className="btn-secondary flex items-center justify-center gap-2">
                        <RefreshCcw size={18} /> New
                      </button>
                      <button onClick={handleDownload} className="btn-apple flex items-center justify-center gap-2">
                        <Download size={20} /> Download ZIP
                      </button>
                    </div>
                  </motion.div>
                )}

                {status === 'failed' && (
                  <motion.div 
                    key="failed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <AlertCircle className="mx-auto mb-6 text-red-500" size={48} />
                    <h2 className="text-3xl font-semibold mb-3">Process interrupted</h2>
                    <p className="text-white/40 mb-10 text-lg">{error}</p>
                    <button onClick={resetState} className="btn-apple px-10">
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        <footer className="mt-auto pt-24 text-center">
          <p className="text-white/80 text-sm tracking-widest uppercase">
            © 2026 SnapSite Pro | Advanced Scraper Logic
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
