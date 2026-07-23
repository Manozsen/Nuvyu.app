import { createClient } from '@/lib/supabase/client';

export interface GuestLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details?: Record<string, unknown>;
}

const GUEST_ID_KEY = 'nuvyu_guest_id';
const GUEST_LOGS_KEY = 'nuvyu_guest_logs';
const GUEST_MIGRATED_KEY = 'nuvyu_guest_migrated';

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export async function migrateGuestDataToAccount(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  if (localStorage.getItem(GUEST_MIGRATED_KEY) === 'true') return;

  const rawLogs = localStorage.getItem(GUEST_LOGS_KEY);
  if (!rawLogs) {
    localStorage.setItem(GUEST_MIGRATED_KEY, 'true');
    return;
  }

  const logs: GuestLogEntry[] = JSON.parse(rawLogs);
  if (logs.length === 0) {
    localStorage.setItem(GUEST_MIGRATED_KEY, 'true');
    return;
  }

  const supabase = createClient();
  const guestId = localStorage.getItem(GUEST_ID_KEY) || 'unknown_guest';

  const payload = logs.map((log) => ({
    user_id: userId,
    guest_id: guestId,
    action: log.action,
    details: log.details || {},
    created_at: log.timestamp,
  }));

  const { error } = await supabase.from('activity_logs').insert(payload);
  if (error) throw new Error(`Migration failed: ${error.message}`);

  localStorage.setItem(GUEST_MIGRATED_KEY, 'true');
  localStorage.removeItem(GUEST_LOGS_KEY);
}
