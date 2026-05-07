// 🧠 BEHAVIOR PRIORITY ENGINE
export function getBehaviorPriority(target: string) {
  const t = (target || '').toLowerCase();
  
  if (t.includes('six_pack') || t.includes('fat_loss')) {
    return ['calorie_deficit', 'consistency', 'hydration', 'abs_core'];
  }
  if (t.includes('height') || t.includes('posture')) {
    return ['sleep_recovery', 'posture_correction', 'stretching', 'mobility'];
  }
  if (t.includes('30_days') || t.includes('wedding') || t.includes('comeback')) {
    return ['urgency', 'streak_focus', 'strict_discipline', 'high_intensity'];
  }
  if (t.includes('muscle') || t.includes('athletic') || t.includes('strength')) {
    return ['protein_focus', 'progressive_overload', 'deep_recovery'];
  }
  
  return ['balance', 'sustainability', 'habit_building', 'mental_health'];
}

// 🧠 TARGET-BASED CALORIE ENGINE
export function calculateTransformationCalories(bmr: number, tdee: number, target: string, timeline: string) {
  const t = (target || '').toLowerCase();
  const time = (timeline || '').toLowerCase();
  let targetCalories = tdee;
  let pace = "maintenance";

  // Transformation Pace Multipliers
  let deficit = 0.85; // Default 15% deficit
  let surplus = 1.1;  // Default 10% surplus

  // Adjust urgency based on timeline
  if (time.includes('30_days')) {
    deficit = 0.75; // Aggressive 25% deficit
    pace = "aggressive";
  } else if (time.includes('6_months') || time.includes('1_year') || time.includes('sustainable')) {
    deficit = 0.90; // Sustainable 10% deficit
    pace = "sustainable";
  }

  // Adjust target based on goal
  if (t.includes('fat') || t.includes('lean') || t.includes('six_pack') || t.includes('wedding')) {
    targetCalories = tdee * deficit;
    pace = pace === "aggressive" ? "aggressive_cut" : "steady_cut";
  } else if (t.includes('muscle') || t.includes('gain') || t.includes('strength') || t.includes('athletic')) {
    targetCalories = tdee * surplus;
    pace = "steady_bulk";
  }

  return {
    target_calories: Math.max(bmr, Math.round(targetCalories)), // Never recommend below BMR
    transformation_pace: pace,
    behavior_priorities: getBehaviorPriority(target)
  };
}
