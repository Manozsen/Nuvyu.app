"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { GuestManager } from '../../lib/auth/guestManager';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Supabase Client directly in browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget); 
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        setError(authError.message);
        setLoading(false); 
      } else {
        // Hard-redirect to completely bypass Next.js cache
        window.location.href = '/dashboard'; 
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 selection:bg-mint/30 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-mint/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-2">NUVYU<span className="text-mint">.AI</span></h1>
          <p className="text-white/50 text-sm font-medium">Welcome back, Coach is waiting.</p>
        </div>

        <form onSubmit={handleForm} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-mint transition-colors" size={20} />
            <input 
              type="email" name="email" required placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all backdrop-blur-md"
            />
          </div>

           <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-mint transition-colors" size={20} />
            <input 
              type="password" name="password" required placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex justify-end mt-1">
            <Link href="/auth/forgot-password" className="text-mint text-xs font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-mint text-black font-bold py-4 rounded-2xl flex justify-center items-center gap-2 mt-4 hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Access Dashboard <ArrowRight size={20} /></>}
          </button>
        </form>

         <p className="text-center text-white/50 text-sm mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-mint font-bold hover:underline">Level up here</Link>
        </p>

        <div className="mt-8 pt-6 border-t border-white/10 w-full text-center">
          <button
            type="button"
            onClick={() => {
              GuestManager.getOrCreateGuestId();
              window.location.href = '/dashboard';
            }}
            className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-2xl text-sm hover:bg-white/10 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
