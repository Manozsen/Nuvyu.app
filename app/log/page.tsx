"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Droplets, Footprints, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function LogActivity() {
  const [logType, setLogType] = useState<'water' | 'steps'>('water');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/login';
      } else {
        setUserId(user.id);
        setIsAuthChecking(false);
      }
    };
    checkUser();
  }, [supabase.auth]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || !userId) return;
    setLoading(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.from('daily_logs').insert({
        user_id: userId,
        log_type: logType,
        data: { amount: Number(amount) }
      });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      
      // Success -> Hard redirect to dashboard to refresh data
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Error saving log:", error);
      setSubmitError(error.message || "Table 'daily_logs' missing or RLS is enabled.");
      setLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col px-6 relative overflow-hidden selection:bg-[#00FFA3]/30">
      
      {/* PREMIUM GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FFA3]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="pt-10 pb-6 flex items-center gap-4 z-10 relative">
        <Link href="/dashboard" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-all text-white/60 hover:text-white shadow-lg">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none">Add <span className="text-[#00FFA3]">Log</span></h1>
          <p className="text-white/40 text-xs font-medium mt-1">Track your daily progress</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 -mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative"
        >
          {/* TYPE SELECTOR (Segmented Control Style) */}
          <div className="flex gap-2 mb-8 bg-black/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setLogType('water'); setAmount(''); setSubmitError(null); }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                logType === 'water' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Droplets size={18} /> Water
            </button>
            <button 
              onClick={() => { setLogType('steps'); setAmount(''); setSubmitError(null); }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                logType === 'steps' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.2)] border border-[#00FFA3]/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Footprints size={18} /> Steps
            </button>
          </div>

          <div className="space-y-6 mb-8">
            {/* QUICK ADD BUTTONS */}
            <AnimatePresence mode="wait">
              {logType === 'water' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">Quick Add</p>
                  <div className="flex gap-3 mb-6">
                    {[ { label: '+250ml', val: '250' }, { label: '+500ml', val: '500' }, { label: '+1L', val: '1000' } ].map((btn) => (
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        key={btn.val}
                        onClick={() => setAmount(btn.val)}
                        className="flex-1 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 font-bold hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all text-sm shadow-sm"
                      >
                        {btn.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MANUAL INPUT */}
            <div>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">
                {logType === 'water' ? 'Manual Amount (ml)' : 'Manual Amount (Steps)'}
              </p>
              <div className="relative group">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder={logType === 'water' ? 'e.g. 300' : 'e.g. 2500'} 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-3xl font-black text-center text-white placeholder:text-white/10 focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] focus:outline-none transition-all shadow-inner" 
                  autoFocus
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-bold tracking-widest">
                  {logType === 'water' ? 'ML' : 'STEPS'}
                </span>
              </div>
            </div>
          </div>

          {/* ERROR ALERT (Visible only if Supabase rejects data) */}
          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 shadow-lg"
              >
                <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-bold">Failed to save log</p>
                  <p className="text-red-400/70 text-xs mt-1">{submitError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <motion.button 
            whileTap={!amount || loading ? {} : { scale: 0.98 }}
            onClick={handleSave} 
            disabled={!amount || loading} 
            className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-3 disabled:opacity-30 disabled:grayscale transition-all hover:shadow-[0_0_25px_rgba(0,255,163,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" size={24}/> : <><CheckCircle2 size={22} strokeWidth={3} /> Save Progress</>}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}
