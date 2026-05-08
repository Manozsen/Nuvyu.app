export interface DailyLog {
  id?: string;
  user_id: string;
  log_type: "steps" | "water" | "food" | "workout" | "activity" | "drink";
  data: any;
  created_at: string;
}

export interface SleepLog {
  id?: string;
  user_id: string;
  date: string;
  sleep_hours: number;
  sleep_quality: string;
  recovery_score: number;
  created_at?: string;
}
