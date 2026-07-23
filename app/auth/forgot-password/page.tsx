'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      // Never expose whether an email exists for security reasons
      if (error) {
        console.error('Password reset error:', error.message);
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('success'); // Fail safe to avoid exposing account existence
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-white flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-[#12141C] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-white/60">Enter your email and we will send you a secure recovery link.</p>
        </div>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm text-center mb-6">
            If an account exists for this email, a reset link has been dispatched. Please check your inbox.
            <div className="mt-4">
              <Link href="/auth/login" className="text-white underline font-medium hover:text-emerald-300">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00FFA3] transition-colors"
              />
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#00FFA3] text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending Recovery Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-xs text-white/60 hover:text-white transition-colors">
                Remember your password? Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
