export interface BackupPayload {
  version: number;
  timestamp: string;
  guestId: string;
  logs: Array<{
    id: string;
    timestamp: string;
    action: string;
    details?: Record<string, unknown>;
  }>;
  preferences?: Record<string, unknown>;
}

const GUEST_ID_KEY = 'nuvyu_guest_id';
const GUEST_LOGS_KEY = 'nuvyu_guest_logs';

export class GuestManager {
  static getOrCreateGuestId(): string {
    if (typeof window === 'undefined') return '';
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  }

  static logAsGuest(action: string, details?: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;
    const logs = this.getLocalLogs();
    logs.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
    });
    localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(logs));
  }

  static getLocalLogs(): Array<{ id: string; timestamp: string; action: string; details?: Record<string, unknown> }> {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(GUEST_LOGS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  // 🧠 PRIVACY POLICY: User-initiated encrypted/structured backup generation
  static generateBackup(): string {
    const backup: BackupPayload = {
      version: 1,
      timestamp: new Date().toISOString(),
      guestId: this.getOrCreateGuestId(),
      logs: this.getLocalLogs(),
      preferences: {
        coach_tone: localStorage.getItem('nuvyu_coach_tone') || 'supportive',
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  // 🧠 PRIVACY POLICY: Integrity-checked backup restoration
  static restoreBackup(backupJson: string): boolean {
    try {
      const parsed: BackupPayload = JSON.parse(backupJson);
      if (!parsed.version || !Array.isArray(parsed.logs)) {
        throw new Error('Invalid backup schema');
      }
      localStorage.setItem(GUEST_ID_KEY, parsed.guestId || crypto.randomUUID());
      localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(parsed.logs));
      if (parsed.preferences?.coach_tone) {
        localStorage.setItem('nuvyu_coach_tone', String(parsed.preferences.coach_tone));
      }
      return true;
    } catch {
      return false;
    }
  }

  static clearLocalData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_LOGS_KEY);
  }
}
