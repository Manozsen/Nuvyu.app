'use client';

import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export function SecuritySettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setStatus('success');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="bg-[#12141C] border border-white/10 rounded-2xl p-6 text-white max-w-xl">
      <h2 className="text-lg font-semibold mb-1">Security & Password</h2>
      <p className="text-sm text-white/60 mb-6">Update your account password securely.</p>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00FFA3]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00FFA3]"
          />
        </div>

        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs">
            Password successfully updated.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#00FFA3] text-black font-semibold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
