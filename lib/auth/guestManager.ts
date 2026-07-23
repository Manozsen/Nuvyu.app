import { createClient } from '@/lib/supabase/client';

export const GUEST_STORAGE_KEY = 'nuvyu_guest_session';
export const GUEST_LOGS_KEY = 'nuvyu_guest_logs';

export interface GuestLog {
  id: string;
  log_type: string;
  data: any;
  timestamp: string;
}

export class GuestManager {
  static isGuest(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  }

  static initGuestSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    if (!localStorage.getItem(GUEST_LOGS_KEY)) {
      localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify([]));
    }
  }

  static logAsGuest(logType: string, data: any): void {
    if (typeof window === 'undefined') return;
    const existing = JSON.parse(localStorage.getItem(GUEST_LOGS_KEY) || '[]');
    const newLog: GuestLog = {
      id: 'guest_' + Math.random().toString(36.substring(2, 9)),
      log_type: logType,
      data,
      timestamp: new Date().toISOString()
    };
    existing.push(newLog);
    localStorage.setItem(GUEST_LOGS_KEY, JSON.stringify(existing));
  }

  static getGuestLogs(): GuestLog[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(GUEST_LOGS_KEY) || '[]');
  }

  static async migrateGuestDataToAccount(userId: string): Promise<void> {
    const logs = this.getGuestLogs();
    if (logs.length === 0) {
      this.clearGuestSession();
      return;
    }

    const supabase = createClient();
    for (const log of logs) {
      await supabase.from('telemetry_logs').insert({
        user_id: userId,
        log_type: log.log_type,
        data: log.data,
        timestamp: log.timestamp
      });
    }

    this.clearGuestSession();
  }

  static clearGuestSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(GUEST_LOGS_KEY);
  }
}
