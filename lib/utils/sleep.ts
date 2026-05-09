export const safeSleepHours = (logData?: any, sleepLogData?: any): number => {
  // 1. Official sleep_logs schema
  if (sleepLogData?.sleep_hours !== undefined && sleepLogData?.sleep_hours !== null) {
    return Number(sleepLogData.sleep_hours) || 0;
  }
  // 2. Legacy daily_logs fallback for backward compatibility
  if (!logData) return 0;
  return Number(logData.sleep_hours ?? logData.hours ?? logData.amount ?? logData.duration ?? 0) || 0;
};

export const safeSleepQuality = (logData?: any, sleepLogData?: any): string => {
  // 1. Official sleep_logs schema
  if (sleepLogData?.sleep_quality) {
    return String(sleepLogData.sleep_quality).toLowerCase();
  }
  // 2. Legacy daily_logs fallback
  if (!logData) return "moderate";
  return String(logData.sleep_quality ?? logData.quality ?? "moderate").toLowerCase();
};

export const safeRecoveryScore = (score?: any, computedHours: number = 0): number => {
  const s = Number(score);
  if (!isNaN(s) && s > 0) return s;
  
  // Safe calculation fallback if DB score is 0 or missing, but hours exist
  if (computedHours > 0) return Math.min(100, Math.round((computedHours / 8) * 100));
  return 0;
};
