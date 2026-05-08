import { IntakeTimelineItem } from './energy';

export interface ActivityBreakdown {
  name: string;
  burn: number;
}

export interface AnalyticsDailyData {
  date: string;
  fullDate: string;
  score: number;
  steps: number;
  water: number;
  sleep_hours: number;
  recovery_score: number;
  streak: number;
  calorie_burn: number;
  calorie_target: number;
  calorie_intake: number;
  meal_timeline: IntakeTimelineItem[];
  activity_breakdown: ActivityBreakdown[];
  bmr_burn: number;
  energy_status: "deficit" | "surplus" | "maintenance";
}

export interface AnalyticsStats {
  stepsTrend: string;
  waterTrend: string;
  sleepTrend: string;
  recoveryTrend: string;
  calorieBurnTrend: string;
}

export interface AnalyticsSummary {
  dailyData: AnalyticsDailyData[];
  stats: AnalyticsStats;
  profileBase: {
    tdee: number;
    bmr: number;
  };
}
