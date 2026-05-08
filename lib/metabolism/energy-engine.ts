// 🧠 CENTRAL ENERGY & METABOLISM INTELLIGENCE ENGINE

export function calculateProgressiveBMR(bmr: number) {
  const now = new Date();
  const hour = now.getHours();
  
  // Divide daily BMR into 6 blocks of 4 hours
  // 12am-4am (0-3), 4am-8am (4-7), 8am-12pm (8-11), 12pm-4pm (12-15), 4pm-8pm (16-19), 8pm-12am (20-23)
  const currentBlock = Math.floor(hour / 4) + 1; 
  const completed_blocks = currentBlock - 1;
  const bmrPerBlock = bmr / 6;
  
  // Burn is completed blocks + partial current block
  const minutesIntoCurrentBlock = (hour % 4) * 60 + now.getMinutes();
  const currentBlockProgress = minutesIntoCurrentBlock / (4 * 60);
  
  const current_bmr_burn = Math.round((completed_blocks * bmrPerBlock) + (bmrPerBlock * currentBlockProgress));
  const remaining_bmr = bmr - current_bmr_burn;

  return {
    current_bmr_burn,
    completed_blocks,
    remaining_bmr,
    daily_bmr: bmr
  };
}

export function calculateActivityBurn(logs: any[]) {
  let steps_burn = 0;
  let workout_burn = 0;
  let activity_burn = 0;
  const activity_breakdown: any[] = [];

  (logs || []).forEach(log => {
    if (log.log_type === 'steps') {
      const burn = Math.round((Number(log.data?.amount) || 0) * 0.04);
      steps_burn += burn;
      if (burn > 0) activity_breakdown.push({ name: 'Walking', type: 'steps', burn });
    } else if (log.log_type === 'workout') {
      const duration = Number(log.data?.duration) || 30;
      const burn = duration * 5; // Default estimation baseline
      workout_burn += burn;
      activity_breakdown.push({ name: log.data?.exercise || 'Workout', type: 'workout', burn });
    } else if (log.log_type === 'activity') {
      const burn = Number(log.data?.estimated_calories) || 0;
      activity_burn += burn;
      activity_breakdown.push({ name: log.data?.activity_name || 'Activity', type: 'custom', burn });
    }
  });

  return {
    steps_burn,
    workout_burn,
    activity_burn,
    total_active_burn: steps_burn + workout_burn + activity_burn,
    activity_breakdown
  };
}

export function calculateIntake(logs: any[]) {
  let total_intake = 0;
  const meal_timeline: any[] = [];

  (logs || []).forEach(log => {
    if (log.log_type === 'food') {
      const text = log.data?.text || '';
      // Safe heuristic parser until full AI vision is integrated
      const extractedCals = text.match(/(\d+)\s*(kcal|calories)/i);
      const calories = extractedCals ? parseInt(extractedCals[1], 10) : 350; 

      total_intake += calories;

      const date = new Date(log.created_at);
      meal_timeline.push({
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        food: text,
        calories
      });
    }
  });

  return {
    total_intake,
    meal_timeline,
    meal_breakdown: meal_timeline.length
  };
}

export function calculateTotalBurn(bmr: number, logs: any[]) {
  const progressiveBMR = calculateProgressiveBMR(bmr);
  const activityData = calculateActivityBurn(logs);

  return {
    bmr_burn: progressiveBMR.current_bmr_burn,
    active_burn: activityData.total_active_burn,
    total_burn: progressiveBMR.current_bmr_burn + activityData.total_active_burn,
    activity_breakdown: activityData.activity_breakdown
  };
}

export function calculateEnergyBalance(profile: any, logs: any[]) {
  const bmr = profile?.bmr || 1500;
  let targetCalories = profile?.target_calories || profile?.tdee || 2000;

  // Strict Target Sync Check
  const goal = (profile?.primary_target || profile?.goal || '').toLowerCase();
  if (goal.includes('fat') || goal.includes('lean') || goal.includes('six_pack')) {
    targetCalories = Math.round(targetCalories * 0.85);
  } else if (goal.includes('muscle') || goal.includes('gain')) {
    targetCalories = Math.round(targetCalories * 1.1);
  }

  const energyOut = calculateTotalBurn(bmr, logs);
  const energyIn = calculateIntake(logs);

  const netBalance = energyIn.total_intake - energyOut.total_burn;
  let status = "maintenance";

  if (netBalance <= -200) status = "deficit";
  else if (netBalance >= 200) status = "surplus";

  return {
    burned: energyOut,
    consumed: energyIn,
    target: targetCalories,
    deficit_or_surplus: netBalance,
    status
  };
}
