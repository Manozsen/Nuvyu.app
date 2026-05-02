"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Droplets, Footprints, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function LogActivity() {
  const [logType, setLogType] = useState<'water' | 'steps'>('water');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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

    try {
      const { error } = await supabase.from('daily_logs').insert({
        user_id: userId,
        log_type: logType,
        data: { amount: Number(amount) }
      });

      if (error) throw error;
      
      // Success -> Go back to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error saving log:", error);
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
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FFA3]/5 rounded-full blur-[150px] pointer-events-none" />

      <header className="pt-10 pb-6 flex items-center gap-4 z-10 relative">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/10 transition-all text-white/60 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black tracking-tighter">Add <span className="text-[#00FFA3]">Log</span></h1>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 -mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative"
        >
          {/* Type Selector */}
          <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => { setLogType('water'); setAmount(''); }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                logType === 'water' ? 'bg-blue-500/20 text-blue-400 shadow-md' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Droplets size={18} /> Water
            </button>
            <button 
              onClick={() => { setLogType('steps'); setAmount(''); }}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                logType === 'steps' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-md' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Footprints size={18} /> Steps
            </button>
          </div>

          {/* Dynamic Input Area */}
          <div className="space-y-6 mb-8">
            {logType === 'water' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Quick Add</p>
                <div className="flex gap-3 mb-6">
                  {[ { label: '+250ml', val: '250' }, { label: '+500ml', val: '500' }, { label: '+1L', val: '1000' } ].map((btn) => (
                    <button 
                      key={btn.val}
                      onClick={() => setAmount(btn.val)}
                      className="flex-1 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-500/20 transition-all text-sm"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
                {logType === 'water' ? 'Manual Amount (ml)' : 'Manual Amount (Steps)'}
              </p>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder={logType === 'water' ? 'e.g. 300' : 'e.g. 2500'} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-black text-white placeholder:text-white/20 focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] focus:outline-none transition-all text-center" 
                autoFocus
              />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={!amount || loading} 
            className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={24}/> : <><CheckCircle2 size={20} /> Save Progress</>}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
