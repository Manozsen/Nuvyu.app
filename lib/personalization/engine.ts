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

// 🧠 ADAPTIVE GOAL ENGINE (Recovery-Aware Progression System)
// Intelligently adjusts daily targets based on fatigue, drift, and recovery data.

export function calculateAdaptiveGoals(baseTDEE: number, baseSteps: number, recovery_state: string, burnout_risk: string, adherence_profile: string = "stable", behavioral_drift: string = "stable") {
  let adaptive_tdee = baseTDEE || 2000;
  let adaptive_steps = baseSteps || 6000;
  let recommended_water = 3000;
  let workout_intensity = "moderate";
  let recommendation = "maintain";

  // 🧠 Early-Warning Behavioral Drift Protection
  if (behavioral_drift === 'multi_system_collapse' || behavioral_drift === 'recovery_deterioration') {
    adaptive_steps = Math.max(4000, baseSteps * 0.8); // Scale back before full burnout
    workout_intensity = "low_impact_preferred";
    recommendation = "drift_correction";
  }

  // 🧠 Burnout & Severe Recovery Protection Logic
  if (burnout_risk === 'high' || recovery_state === 'poor' || recovery_state === 'overtrained') {
    adaptive_steps = Math.max(3000, baseSteps * 0.7); // Safely reduce movement load by 30%
    adaptive_tdee = baseTDEE + 200; // Slight caloric surplus recommended to aid physical recovery
    recommended_water = 3500; // Extra hydration for cellular recovery
    workout_intensity = "low_impact_only";
    recommendation = "recovery_focus";
  } 
  // 🧠 Progressive Overload Logic
  else if (recovery_state === 'optimal' || recovery_state === 'excellent') {
    adaptive_steps = baseSteps * 1.1; // Safely suggest a 10% movement increase
    workout_intensity = "high_intensity_approved";
    recommendation = "progressive_overload";
  }

  // 🧠 Smart Adherence Friction Reduction
  if (adherence_profile === "struggling" && recommendation !== "recovery_focus") {
    adaptive_steps = Math.min(adaptive_steps, 5000); // Reduce cognitive/physical load to rebuild habit momentum safely
    recommendation = "habit_rebuilding";
  }

    // 🧠 PHASE 4: AUTONOMOUS GOAL MODULATION
  const goal_modulation_metadata = {
    hydration_adjusted: recommended_water !== 3000,
    activity_adjusted: adaptive_steps !== baseSteps,
    recovery_focused: recommendation === "recovery_focus",
    modulation_confidence: 0.85
  };

  return {
    recommended_steps: Math.round(adaptive_steps),
    recommended_calories: Math.round(adaptive_tdee),
    recommended_water,
    workout_intensity,
    adaptation_mode: recommendation,
    goal_modulation_metadata
  };
}

// 🧠 DYNAMIC GREETING ENGINE
export function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

