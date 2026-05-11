// 🧠 CENTRAL ENERGY & RECOVERY INTELLIGENCE SYSTEM
import { calculateProgressiveBMR } from './bmrDistribution';

// TIMEZONE SAFE HELPER (Bug 4 Fix)
export function getLocalDateString(d: Date = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// MET-BASED ACTIVITY BURN (Bug 2 Fix)
export function calculateActivityCalories(type: string, durationMins: number, intensity: string, weightKg: number = 70) {
  const metValues: Record<string, number> = {
    hiking: 6.0, trekking: 7.0, swimming: 8.0, cycling: 7.5,
    football: 7.0, cricket: 5.0, yoga: 3.0, dance: 5.0,
    pushups: 8.0, squats: 7.5, running: 9.8, strength: 6.0,
    walking: 3.5, custom: 5.0, workout: 6.0
  };
  
  const safeType = (type || 'custom').toLowerCase().trim();
  let met = metValues[safeType] || metValues.custom;

  if (intensity === 'low') met *= 0.8;
  if (intensity === 'high') met *= 1.2;

  // Real formula: Calories = MET * Weight(kg) * Time(hrs)
  return Math.round(met * weightKg * (durationMins / 60));
}

export function calculateEnergyBalance(profile: any, logs: any[]) {
  const weight = profile?.weight || 70;
  
  // 🧠 REAL PERSONALIZED CALORIE ENGINE (Mifflin-St Jeor fallback if DB BMR missing)
  let bmr = profile?.bmr || 1500;
  if (profile?.age && profile?.height && profile?.weight && profile?.gender) {
    const isMale = profile.gender.toLowerCase() === 'male';
    bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + (isMale ? 5 : -161);
  }
  
  let targetCalories = profile?.target_calories || profile?.tdee || Math.round(bmr * 1.2);

  const progressiveBMR = calculateProgressiveBMR(bmr);
  let stepsBurn = 0;
  let workoutBurn = 0;
  let manualActivityBurn = 0;
  let intakeCalories = 0;
  
  const intakeTimeline: any[] = [];
  const burnTimeline: any[] = [];

  (logs || []).forEach(log => {
    const logTime = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (log.log_type === 'steps') {
      const steps = Number(log.data?.amount) || 0;
      const burn = Math.round(steps * weight * 0.0005); // Realistic step burn
      stepsBurn += burn;
      if (burn > 0) burnTimeline.push({ time: logTime, source: 'Steps', calories: burn });
      
    } else if (log.log_type === 'workout') {
      const duration = Number(log.data?.duration) || 30;
      const type = log.data?.exercise || 'workout';
      const intensity = log.data?.intensity || 'medium';
      const burn = calculateActivityCalories(type, duration, intensity, weight);
      workoutBurn += burn;
      burnTimeline.push({ time: logTime, source: type, calories: burn });
      
    } else if (log.log_type === 'activity') {
      const duration = Number(log.data?.duration_mins) || Number(log.data?.duration) || 30;
      const type = log.data?.activity_name || 'custom';
      const intensity = log.data?.intensity || 'medium';
      const burn = calculateActivityCalories(type, duration, intensity, weight);
      manualActivityBurn += burn;
      burnTimeline.push({ time: logTime, source: type, calories: burn });
      
    } else if (log.log_type === 'food' || log.log_type === 'drink') {
       const text = log.data?.text || '';
       const extractedCals = text.match(/(\d+)\s*(kcal|calories)/i);
       const calories = extractedCals ? parseInt(extractedCals[1], 10) : 350;
       intakeCalories += calories;
       intakeTimeline.push({ time: logTime, food: text, calories });
    }
  });

  const activityBurn = stepsBurn + workoutBurn + manualActivityBurn;
  const totalBurn = progressiveBMR.currentBurn + activityBurn;
  const netBalance = intakeCalories - totalBurn;

  return {
    totalBurn,
    bmrBurn: progressiveBMR.currentBurn,
    activityBurn,
    stepsBurn,
    workoutBurn,
    intakeCalories,
    energyBalance: netBalance,
    targetCalories,
    deficit: netBalance < 0 ? Math.abs(netBalance) : 0,
    surplus: netBalance > 0 ? netBalance : 0,
    intakeTimeline,
    burnTimeline
  };
}

export function calculateRecoveryState(sleepHours: number, sleepQuality: string, consistency: string, energyBalance: number) {
  if (!sleepHours || sleepHours === 0) return 'unknown';
  let score = 100;
  
  if (sleepHours < 5) score -= 40;
  else if (sleepHours < 7) score -= 20;

  if (sleepQuality === 'poor') score -= 20;
  if (sleepQuality === 'good') score += 10;
  if (energyBalance < -1000) score -= 15; // Severe deficit impairs recovery

  if (score >= 90) return 'optimal';
  if (score >= 70) return 'moderate';
  if (score >= 50) return 'fatigued';
  return 'overtrained';
}

export function detectFatiguePattern(recoveryState: string, sleepHours: number, activityBurn: number) {
  if (sleepHours > 0 && sleepHours < 6 && activityBurn > 800) return 'high_risk';
  if (recoveryState === 'overtrained') return 'critical_warning';
  if (recoveryState === 'fatigued') return 'elevated_risk';
  return 'low_risk';
}
