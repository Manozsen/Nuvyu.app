import { createBrowserClient } from '@supabase/ssr';

// 🧠 INTERFACE-BASED REPOSITORY ARCHITECTURE
// Enforces Dependency Inversion. The UI depends on the abstraction, not the implementation.

export interface IDashboardRepository {
  getClient(): any; // Maintained temporarily for legacy coach integration
  getUser(): Promise<any>;
  getProfile(userId: string): Promise<any>;
  getLogs(userId: string, start: string, end: string): Promise<any>;
  getPastLogs(userId: string, start: string, end: string): Promise<any>;
  getLatestSleep(userId: string): Promise<any>;
}

export class SupabaseDashboardRepository implements IDashboardRepository {
  getClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getUser() {
    return await this.getClient().auth.getUser();
  }

  async getProfile(userId: string) {
    return await this.getClient().from('profiles').select('*').eq('id', userId).single();
  }

  async getLogs(userId: string, start: string, end: string) {
    return await this.getClient()
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end);
  }

  async getPastLogs(userId: string, start: string, end: string) {
    return await this.getClient()
      .from('daily_logs')
      .select('log_type, data')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lt('created_at', end);
  }

  async getLatestSleep(userId: string) {
    return await this.getClient()
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
  }
}

export class SQLiteDashboardRepository implements IDashboardRepository {
  // 🧠 Placeholder for true Offline-First execution
  getClient() { throw new Error("Not implemented"); }
  async getUser() { throw new Error("Not implemented"); }
  async getProfile() { throw new Error("Not implemented"); }
  async getLogs() { throw new Error("Not implemented"); }
  async getPastLogs() { throw new Error("Not implemented"); }
  async getLatestSleep() { throw new Error("Not implemented"); }
}

// Global singleton instance for Dependency Injection
export const dashboardRepository: IDashboardRepository = new SupabaseDashboardRepository();
