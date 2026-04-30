"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Naya import
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signup } from '../auth/actions';

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Router initialize karo

  async function handleForm(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await signup(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // SUCCESS: User ban gaya hai, ab force redirect karo
      router.refresh(); // Cookies check karne ke liye refresh
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-mint/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-2">NUVYU<span className="text-mint">.AI</span></h1>
          <p className="text-white/50 text-sm font-medium">Create your AI transformation account.</p>
        </div>

        <form action={handleForm} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input name="fullName" required placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-mint outline-none transition-all" />
          </div>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input type="email" name="email" required placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-mint outline-none transition-all" />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input type="password" name="password" required placeholder="Password" minLength={6} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-mint outline-none transition-all" />
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

          <button disabled={loading} className="w-full bg-mint text-black font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Start Journey <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-8">
          Already have an account? <Link href="/login" className="text-mint font-bold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
