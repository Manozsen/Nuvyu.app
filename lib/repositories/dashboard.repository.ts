import { createBrowserClient } from '@supabase/ssr';

// 🧠 REPOSITORY LAYER
// The Dashboard MUST NOT communicate directly with databases.
export class DashboardRepository {
  static getClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  static async getUser() {
    return await this.getClient().auth.getUser();
  }

  static async getProfile(userId: string) {
    return await this.getClient().from('profiles').select('*').eq('id', userId).single();
  }

  static async getLogs(userId: string, start: string, end: string) {
    return await this.getClient()
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end);
  }

  static async getPastLogs(userId: string, start: string, end: string) {
    return await this.getClient()
      .from('daily_logs')
      .select('log_type, data')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lt('created_at', end);
  }

  static async getLatestSleep(userId: string) {
    return await this.getClient()
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
  }
}
