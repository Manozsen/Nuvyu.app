// 🧠 PHASE 10H: OPERATING STATE ENGINE
export function determineOperatingState(burnout_risk: string, adherence_profile: string) {
  let operating_state = "growth";
  if (burnout_risk === "high") operating_state = "burnout_protection";
  else if (adherence_profile === "struggling") operating_state = "rebuild";
  else if (burnout_risk === "medium") operating_state = "recovery";

  return {
    operating_state,
    operating_confidence: 0.9,
    state_reason: `Triggered by burnout risk: ${burnout_risk} & adherence: ${adherence_profile}`
  };
}

// 🧠 PHASE 10A: ADAPTIVE INTERVENTION ENGINE
export function determineInterventionMode(operating_state: string) {
  let intervention_mode = "momentum_push";
  if (operating_state === "burnout_protection") intervention_mode = "recovery_enforcement";
  else if (operating_state === "rebuild") intervention_mode = "friction_reduction";
  else if (operating_state === "recovery") intervention_mode = "consistency_stabilization";

  return {
    intervention_mode,
    intervention_confidence: 0.85,
    intervention_reason: `Aligned with operating state: ${operating_state}`,
    intervention_priority: "high"
  };
}

// 🧠 PHASE 10F: AUTONOMOUS PRIORITY STACK
export function buildAutonomousPriorityStack(intervention_mode: string) {
  if (intervention_mode === "recovery_enforcement") {
    return { priority_1: "Sleep Optimization", priority_2: "Cognitive Rest", priority_3: "Hydration", priority_4: "Light Mobility", priority_reasoning: "System overload detected." };
  }
  if (intervention_mode === "friction_reduction") {
    return { priority_1: "Micro-Habits", priority_2: "Hydration", priority_3: "Sleep", priority_4: "Diet Maintenance", priority_reasoning: "Adherence is fragile." };
  }
  return { priority_1: "Progressive Overload", priority_2: "Dietary Adherence", priority_3: "Sleep", priority_4: "Activity Targets", priority_reasoning: "Stable momentum." };
}

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

export function calculateAdaptiveGoals(baseTDEE: number, baseSteps: number, recovery_state: string, burnout_risk: string, adherence_profile: string = "stable", behavioral_drift: string = "stable", user_manual_goals: any = null) {
  let adaptive_tdee = baseTDEE || 2000;
  let adaptive_steps = baseSteps || 6000;
  let recommended_water = 3000;
  let recommended_sleep = 7.5;
  let recommended_protein = Math.round((baseTDEE || 2000) * 0.075); // Safe heuristic baseline
  let workout_intensity = "moderate";
  let recommendation = "maintain";
  let challenge_difficulty: 'Low' | 'Moderate' | 'High' | 'Extreme' = 'Moderate';

  // 🧠 Early-Warning Behavioral Drift Protection
  if (behavioral_drift === 'multi_system_collapse' || behavioral_drift === 'recovery_deterioration') {
    adaptive_steps = Math.max(4000, baseSteps * 0.8); // Scale back before full burnout
    workout_intensity = "low_impact_preferred";
    recommendation = "drift_correction";
    challenge_difficulty = 'Low';
  }

  // 🧠 Burnout & Severe Recovery Protection Logic
  if (burnout_risk === 'high' || recovery_state === 'poor' || recovery_state === 'overtrained') {
    adaptive_steps = Math.max(3000, baseSteps * 0.7); // Safely reduce movement load by 30%
    adaptive_tdee = baseTDEE + 200; // Slight caloric surplus recommended to aid physical recovery
    recommended_water = 3500; // Extra hydration for cellular recovery
    recommended_sleep = 8.5; // Protect recovery first
    workout_intensity = "low_impact_only";
    recommendation = "recovery_focus";
    challenge_difficulty = 'Low';
  } 
  // 🧠 Progressive Overload Logic
  else if (recovery_state === 'optimal' || recovery_state === 'excellent') {
    adaptive_steps = baseSteps * 1.1; // Safely suggest a 10% movement increase (never aggressive)
    recommended_water = 3200;
    workout_intensity = "high_intensity_approved";
    recommendation = "progressive_overload";
    challenge_difficulty = 'High';
  }

  // 🧠 Smart Adherence Friction Reduction
  if (adherence_profile === "struggling" && recommendation !== "recovery_focus") {
    adaptive_steps = Math.min(adaptive_steps, 5000); // Reduce cognitive/physical load to rebuild habit momentum safely
    recommendation = "habit_rebuilding";
    challenge_difficulty = 'Low';
  }

  // 🧠 PHASE 12: GOAL PACKET GENERATION (Source of Truth)
  let final_goal_packet = {
    target_steps: Math.round(adaptive_steps),
    target_water: recommended_water,
    target_sleep: recommended_sleep,
    target_protein: recommended_protein,
    challenge_difficulty,
    goal_source: 'auto' as 'auto' | 'manual',
    override_warning: null as string | null
  };

  // 🧠 PHASE 12: MANUAL GOAL INTEGRATION & SAFETY
  if (user_manual_goals) {
    final_goal_packet.goal_source = 'manual';
    final_goal_packet.target_steps = user_manual_goals.steps || final_goal_packet.target_steps;
    final_goal_packet.target_water = user_manual_goals.water || final_goal_packet.target_water;
    final_goal_packet.target_sleep = user_manual_goals.sleep || final_goal_packet.target_sleep;
    final_goal_packet.target_protein = user_manual_goals.protein || final_goal_packet.target_protein;
    
    // Safety Warning for Unrealistic/Dangerous Goals
    if (burnout_risk === 'high' && final_goal_packet.target_steps > 10000) {
      final_goal_packet.override_warning = "Manual step target is too high given current physiological burnout risk. Consider lowering.";
    }
  }

  // 🧠 PHASE 4 & 6: AUTONOMOUS GOAL MODULATION & BEHAVIORAL CAPACITY BUDGET
  const goal_modulation_metadata = {
    hydration_adjusted: final_goal_packet.target_water !== 3000,
    activity_adjusted: final_goal_packet.target_steps !== baseSteps,
    recovery_focused: recommendation === "recovery_focus",
    modulation_confidence: 0.85
  };

  let capacity_score = 100;
  if (burnout_risk === "high") capacity_score -= 50;
  if (adherence_profile === "struggling") capacity_score -= 30;

  const capacity_packet = {
    capacity_score,
    capacity_level: capacity_score > 70 ? "high" : capacity_score > 40 ? "moderate" : "low",
    capacity_confidence: "high",
    limiting_factor: burnout_risk === "high" ? "physiological_debt" : adherence_profile === "struggling" ? "behavioral_friction" : "none"
  };

  const capacity_budget = {
    available_effort_units: Math.round(capacity_score / 10),
    max_friction_tolerance: capacity_score > 60 ? "high" : "low"
  };

  return {
    recommended_steps: final_goal_packet.target_steps,
    recommended_calories: Math.round(adaptive_tdee),
    recommended_water: final_goal_packet.target_water,
    workout_intensity,
    adaptation_mode: recommendation,
    goal_modulation_metadata,
    capacity_packet,
    capacity_budget,
    goal_packet: final_goal_packet // 🧠 Phase 12 Architecture Payload
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

// 🧠 PHASE 11 MODULE 2: INTERVENTION RECOMMENDATION ENGINE
export function generateInterventionPacket(lifeload_score: number, burnout_risk: string, adherence_score: number) {
  let primary_intervention = "Maintain Momentum";
  let expected_benefit = "+5 Daily Score";
  let friction_level = "Low";

  if (burnout_risk === "high" || lifeload_score < 40) {
    primary_intervention = "Reduce training volume 20% & enforce sleep before 11 PM";
    expected_benefit = "+15 Recovery Score";
    friction_level = "High";
  } else if (adherence_score < 50) {
    primary_intervention = "Increase morning hydration by 500ml to rebuild habit loop";
    expected_benefit = "+10 Consistency";
    friction_level = "Low";
  }

  return { primary_intervention, expected_benefit, friction_level };
}

// 🧠 PHASE 11 MODULE 3: AUTONOMOUS COACH ENGINE (+ PHASE 12 BILINGUAL LAYER)
export function generateCoachActionPacket(operating_state: string, intervention_packet: any, behavioral_memory: any) {
  let todays_priority = "Progressive Overload";
  let actionable_metric = "Steps > 8000";
  let confidence_score = 80;
  
  // 🧠 PHASE 12: Context Templates (Bilingual Routing)
  let templates = {
    english: "Momentum is strong. Let's push for progressive overload today.",
    hinglish: "Momentum badhiya hai. Aaj limits push karte hain.",
    banglish: "Bhalo momentum ache. Ajke target push kora chai."
  };

  if (operating_state === "burnout_protection" || behavioral_memory.sleep_behavior === "sleep_deprived") {
    todays_priority = "Sleep Optimization";
    actionable_metric = "In bed by 10:30 PM";
    confidence_score = 92;
    templates = {
      english: "Prioritize recovery today. Get to bed early to clear sleep debt.",
      hinglish: "Aaj recovery zaroori hai. Jaldi so jao aur body ko heal hone do.",
      banglish: "Ajke bishram dorkar. Rat e taratari ghumate jao."
    };
  } else if (operating_state === "rebuild" || behavioral_memory.hydration_behavior === "chronically_dehydrated") {
    todays_priority = "Hydration Recovery";
    actionable_metric = "Water > 2500ml";
    confidence_score = 88;
    templates = {
      english: "Let's rebuild momentum. Focus on hitting your hydration targets today.",
      hinglish: "Chalo wapas track pe aate hain. Aaj paani ka target zaroor pura karna.",
      banglish: "Abar shuru kora jak. Ajke jol khaoar target puron koro."
    };
  }

  return { 
    todays_priority, 
    actionable_metric, 
    confidence_score,
    localized_templates: templates // 🧠 Phase 12 Bilingual Context Injection
  };
}

// 🧠 PHASE 11 MODULE 4: HABIT PRESCRIPTION ENGINE
export function generateHabitPrescription(fatigue_risk: string, intervention_packet: any) {
  let micro_habit = "Walk 1500 steps after dinner";
  let difficulty = "Low";
  let impact = "High";
  let timing = "Evening";

  if (fatigue_risk === "high") {
    micro_habit = "5-minute deep breathing before sleep";
    difficulty = "Ultra Low";
    impact = "Critical";
    timing = "Pre-sleep";
  } else if (intervention_packet.friction_level === "Low") {
    micro_habit = "Drink 1 glass of water upon waking";
    difficulty = "Low";
    impact = "High";
    timing = "Morning";
  }

  return { micro_habit, difficulty, impact, timing };
}


