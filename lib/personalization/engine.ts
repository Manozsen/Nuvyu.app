// 🧠 BEHAVIOR PRIORITY ENGINE
export function getBehaviorPriority(target: string, timeline: string) {
  const t = (target || 'healthy_lifestyle').toLowerCase();
  const time = (timeline || 'sustainable_lifestyle').toLowerCase();
  
  let priorities = [];
  let urgency = time === '30_days' ? 'High Urgency' : time === '90_days' ? 'Moderate Urgency' : 'Sustainable Pace';

  if (t.includes('six_pack') || t.includes('fat_loss') || t.includes('lean') || t.includes('wedding')) {
    priorities.push("Calorie Deficit", "High Protein", "Consistency");
  } else if (t.includes('muscle') || t.includes('gain') || t.includes('athletic') || t.includes('strength')) {
    priorities.push("Progressive Overload", "Calorie Surplus", "Recovery/Sleep");
  } else if (t.includes('height') || t.includes('posture')) {
    priorities.push("Mobility/Stretching", "Sleep Quality", "Spine Health");
  } else if (t.includes('stamina')) {
    priorities.push("Cardiovascular Health", "Hydration", "Daily Movement");
  } else {
    priorities.push("Daily Movement", "Balanced Diet", "Hydration");
  }

  return { priorities, urgency };
}

// 🧠 ADVANCED CALORIE TARGET ENGINE
export function calculateAdvancedCalories(bmr: number, tdee: number, primaryTarget: string, timeline: string, identity: string) {
  let targetCalories = tdee;
  
  // Legacy Fallback
  if (identity === 'Lean & Fit') targetCalories -= 300;
  else if (identity === 'Muscular') targetCalories += 300;

  const pt = (primaryTarget || '').toLowerCase();
  const tl = (timeline || '').toLowerCase();

  // Transformation Pace Multipliers
  if (pt.includes('fat_loss') || pt.includes('six_pack') || pt.includes('lean') || pt.includes('wedding')) {
    if (tl === '30_days') targetCalories = tdee * 0.75; // Aggressive
    else if (tl === '90_days') targetCalories = tdee * 0.85; // Moderate
    else targetCalories = tdee * 0.90; // Sustainable
  } else if (pt.includes('muscle') || pt.includes('gain') || pt.includes('strength') || pt.includes('athletic')) {
    if (tl === '30_days' || tl === '90_days') targetCalories = tdee * 1.15; // Aggressive Bulk
    else targetCalories = tdee * 1.10; // Lean Bulk
  }

  return Math.round(targetCalories);
}

// 🧠 ADAPTIVE GOAL ENGINE 
// Intelligently adjusts daily targets based on fatigue and recovery data to prevent burnout.

export function calculateAdaptiveGoals(baseTDEE: number, baseSteps: number, recovery_state: string, burnout_risk: string) {
  let adaptive_tdee = baseTDEE || 2000;
  let adaptive_steps = baseSteps || 6000;
  let recommendation = "maintain";

  // 🧠 Burnout Protection Logic
  if (burnout_risk === 'high' || recovery_state === 'poor' || recovery_state === 'overtrained') {
    adaptive_steps = Math.max(3000, baseSteps * 0.7); // Safely reduce movement load by 30%
    adaptive_tdee = baseTDEE + 200; // Slight caloric surplus recommended to aid physical recovery
    recommendation = "recovery_focus";
  } 
  // 🧠 Progressive Overload Logic
  else if (recovery_state === 'optimal' || recovery_state === 'excellent') {
    adaptive_steps = baseSteps * 1.1; // Safely suggest a 10% movement increase
    recommendation = "progressive_overload";
  }

  return {
    recommended_steps: Math.round(adaptive_steps),
    recommended_calories: Math.round(adaptive_tdee),
    adaptation_mode: recommendation
  };
}
