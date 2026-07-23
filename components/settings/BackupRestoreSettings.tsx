'use client';

import React, { useState } from 'react';
import { GuestManager } from '../../lib/auth/guestManager';

export function BackupRestoreSettings() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<boolean>(false);

  const handleCreateBackup = () => {
    try {
      const backupData = GuestManager.generateBackup();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nuvyu-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatusMessage('Backup successfully created and downloaded.');
      setErrorState(false);
    } catch {
      setStatusMessage('Failed to generate backup.');
      setErrorState(true);
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = GuestManager.restoreBackup(content);
      if (success) {
        setStatusMessage('Backup successfully restored. Refreshing state...');
        setErrorState(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setStatusMessage('Restore failed: File is corrupted or invalid.');
        setErrorState(true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#12141C] border border-white/10 rounded-2xl p-6 text-white max-w-xl">
      <h2 className="text-lg font-semibold mb-1">Backup & Restore</h2>
      <p className="text-sm text-white/60 mb-6">Your data is stored locally. Export or restore your encrypted snapshots anytime.</p>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateBackup}
            className="bg-[#00FFA3] text-black font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Create Local Backup
          </button>

          <label className="bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors cursor-pointer">
            Restore Backup
            <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
          </label>
        </div>

        {statusMessage && (
          <div className={`p-3 rounded-lg text-xs border ${errorState ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
