import { createBrowserClient } from '@supabase/ssr';

// Helper to reliably get the Supabase client
const getSupabase = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 🧠 PHASE 12 MODULE 2: MICRO CHALLENGE ENGINE
export function calculateChallengeProgress(challengeData: any, currentDateStr: string, missedDaysHistory: number) {
  if (!challengeData || !challengeData.start_date || !challengeData.end_date) {
    return {
      challenge_id: 'none',
      challenge_name: 'No Active Challenge',
      challenge_type: 'none',
      start_date: '',
      end_date: '',
      completion_percentage: 0,
      missed_days: 0,
      success_probability: 'Moderate',
      status: 'pending'
    };
  }

  const startMs = new Date(challengeData.start_date).getTime();
  const endMs = new Date(challengeData.end_date).getTime();
  const currentMs = new Date(currentDateStr).getTime();

  const total_days = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const days_elapsed = Math.max(0, Math.ceil((currentMs - startMs) / (1000 * 60 * 60 * 24)));

  let status = 'active';
  if (currentMs > endMs) status = 'completed';
  if (currentMs < startMs) status = 'pending';

  const raw_completion = (days_elapsed / total_days) * 100;
  const completion_percentage = Math.max(0, Math.min(100, Math.round(raw_completion)));

  const miss_ratio = missedDaysHistory / total_days;
  let success_probability = 'High';
  if (miss_ratio > 0.25 || status === 'failed') success_probability = 'Low';
  else if (miss_ratio > 0.10) success_probability = 'Moderate';

  return {
    challenge_id: challengeData.id || 'active_challenge',
    challenge_name: challengeData.name || 'Custom Challenge',
    challenge_type: challengeData.type || 'behavioral',
    start_date: challengeData.start_date,
    end_date: challengeData.end_date,
    completion_percentage,
    missed_days: missedDaysHistory,
    success_probability,
    status
  };
}

// 🧠 PHASE 12 MODULE 5: LIGHTWEIGHT NUTRITION ADHERENCE ENGINE
export function calculateNutritionAdherence(
  proteinLogged: number, targetProtein: number,
  waterLogged: number, targetWater: number,
  sugarConsumedToday: boolean, yesterdaySugarStreak: number
) {
  const protein_target_hit = proteinLogged >= targetProtein;
  const water_target_hit = waterLogged >= targetWater;
  
  const sugar_avoidance_streak = sugarConsumedToday ? 0 : yesterdaySugarStreak + 1;

  let adherence_score = 0;
  if (protein_target_hit) adherence_score += 40;
  if (water_target_hit) adherence_score += 30;
  if (!sugarConsumedToday) adherence_score += 30;

  return {
    protein_target_hit,
    water_target_hit,
    sugar_avoidance_streak,
    adherence_score
  };
}

// 🧠 PHASE 12.4A: COMMITMENT ENGINE
export function calculateCommitmentIntegrity(
  contractItems: string[], 
  metrics: { steps: number, water: number, sleep: number }, 
  historicalIntegrity: number
) {
  if (!contractItems || contractItems.length === 0) {
    return {
      non_negotiables: [],
      completed_items: [],
      missed_items: [],
      commitment_score: 0,
      commitment_integrity_score: historicalIntegrity || 50,
      contract_completion_rate: 0,
      status: 'pending' as 'active' | 'completed' | 'failed' | 'pending'
    };
  }

  const completed_items: string[] = [];
  const missed_items: string[] = [];

  // Dynamic evaluation of behavioral strings
  contractItems.forEach(item => {
    let passed = false;
    const lowerItem = item.toLowerCase();
    
    // Naive parsing for core metrics (Will be expanded when custom goals are fully supported)
    if (lowerItem.includes('step')) {
      const target = parseInt(item.replace(/[^0-9]/g, '')) || 6000;
      passed = metrics.steps >= target;
    } else if (lowerItem.includes('water')) {
      const target = parseInt(item.replace(/[^0-9]/g, '')) || 2000;
      passed = metrics.water >= target;
    } else if (lowerItem.includes('sleep')) {
      const target = parseFloat(item.replace(/[^0-9.]/g, '')) || 7;
      passed = metrics.sleep >= target;
    } else {
      // Custom non-negotiables assume passed if explicitly logged (handled outside this pure function for now)
      passed = false; 
    }

    if (passed) completed_items.push(item);
    else missed_items.push(item);
  });

  const contract_completion_rate = Math.round((completed_items.length / contractItems.length) * 100);
  const commitment_score = completed_items.length * 5; // +5 raw points per kept promise

  // Psychological Momentum (Integrity Score)
  let commitment_integrity_score = historicalIntegrity || 50;
  if (contract_completion_rate === 100) commitment_integrity_score += 5;
  else if (contract_completion_rate < 50) commitment_integrity_score -= 10;
  
  commitment_integrity_score = Math.max(0, Math.min(100, commitment_integrity_score));

  let status: 'active' | 'completed' | 'failed' | 'pending' = 'active';
  if (contract_completion_rate === 100) status = 'completed';
  else if (contract_completion_rate < 50 && contractItems.length > 0) status = 'failed';

  return {
    non_negotiables: contractItems,
    completed_items,
    missed_items,
    commitment_score,
    commitment_integrity_score,
    contract_completion_rate,
    status
  };
}

// 1. getRewardMessage (ｧ ADAPTIVE HABIT EVOLUTION)
export function getRewardMessage(streak: number, adaptation_mode: string = "maintain") {
  if (adaptation_mode === "recovery_focus") {
    if (streak >= 7) return "Healing up nicely 🌿";
    return "Taking it easy to recover 🔋";
  }
  if (adaptation_mode === "habit_rebuilding") {
    return "Building back momentum 🧱";
  }
  if (streak >= 30) return "Elite consistency 🚀";
  if (streak >= 14) return "Habit lock ho rahi hai";
  if (streak >= 7) return "Discipline strong 💪";
  if (streak >= 3) return "Momentum build ho raha hai";
  if (streak === 1) return "Good start 🔥";
  return "Log activity to start a streak!";
}

// 2. getTodayHabit
export async function getTodayHabit(arg1: any, arg2?: string) {
  let supabase, userId;
  
  if (typeof arg1 === 'string') {
    // New Signature: getTodayHabit(userId)
    userId = arg1;
    supabase = getSupabase();
  } else {
    // Old Signature: getTodayHabit(supabase, userId)
    supabase = arg1 || getSupabase();
    userId = arg2;
  }

  if (!userId) return null;

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const { data } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .single();
      
    return data;
  } catch (error) {
    return null; // Return safe default
  }
}

// 3. updateHabit
export async function updateHabit(arg1: any, arg2?: any, arg3?: any, arg4?: boolean) {
  let supabase, userId, metrics, explicitDidLogToday;
  
  if (typeof arg1 === 'string') {
    // New Signature: updateHabit(userId)
    userId = arg1;
    supabase = getSupabase();
  } else {
    // Old Signature: updateHabit(supabase, userId, metrics, didLogToday)
    supabase = arg1 || getSupabase();
    userId = arg2;
    metrics = arg3 || {};
    explicitDidLogToday = arg4;
  }

  if (!userId) return { streak_count: 0, best_streak: 0, reward_message: "" };

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    // 1. Verify if user logged today (if not explicitly provided)
    let didLogToday = explicitDidLogToday;
    if (didLogToday === undefined) {
      const { count } = await supabase
        .from('daily_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${todayStr}T00:00:00Z`);
      didLogToday = (count && count > 0) ? true : false;
    }

    // 2. Fetch history
    const { data: yesterdayHabit } = await supabase.from('user_habits').select('*').eq('user_id', userId).eq('date', yesterdayStr).single();
    const { data: todayHabit } = await supabase.from('user_habits').select('*').eq('user_id', userId).eq('date', todayStr).single();
    const { data: bestHabit } = await supabase.from('user_habits').select('best_streak').eq('user_id', userId).order('best_streak', { ascending: false }).limit(1).single();

    let max_historical_streak = bestHabit?.best_streak || 0;
    let streak_count = 0;
    let best_streak = max_historical_streak;

    // 3. Calculate Streak
    if (todayHabit && todayHabit.did_log) {
        // Streak is already securely calculated for today
        streak_count = todayHabit.streak_count || 0;
        best_streak = todayHabit.best_streak || 0;
    } else {
        if (didLogToday) {
            if (yesterdayHabit && yesterdayHabit.did_log) {
                streak_count = (yesterdayHabit.streak_count || 0) + 1;
            } else {
                streak_count = 1;
            }
            best_streak = Math.max(streak_count, max_historical_streak);
        } else {
            // Unchanged if they haven't logged today yet
            streak_count = yesterdayHabit?.did_log ? (yesterdayHabit.streak_count || 0) : 0;
        }
    }

    const message = getRewardMessage(streak_count, metrics?.adaptation_mode);

    // 🧠 PHASE 12: EXECUTE NUTRITION & CHALLENGE ENGINES
    const sugar_consumed = metrics?.sugar_consumed_today || false;
    const yesterday_sugar_streak = yesterdayHabit?.sugar_avoidance_streak || 0; // Requires DB schema addition later
    const protein_logged = metrics?.protein_logged || 0;
    const target_protein = metrics?.target_protein || 50;
    const target_water = metrics?.target_water || 3000;
    
    const nutrition_packet = calculateNutritionAdherence(
      protein_logged, target_protein, 
      metrics?.water_today || metrics?.water || 0, target_water, 
      sugar_consumed, yesterday_sugar_streak
    );

    const challenge_data = metrics?.active_challenge || null;
    const missed_days = metrics?.challenge_missed_days || 0;
    const challenge_packet = calculateChallengeProgress(challenge_data, todayStr, missed_days);

    // 🧠 PHASE 12.4A: EXECUTE COMMITMENT ENGINE
    const active_contract = metrics?.commitment_contract || []; // Expected array of strings
    const historical_integrity = yesterdayHabit?.commitment_integrity_score || 50; // 🧠 FIX: Aligned property name with strict packet interface
    const commitment_packet = calculateCommitmentIntegrity(
      active_contract, 
      { steps: metrics?.steps_today || 0, water: metrics?.water_today || 0, sleep: metrics?.sleep_hours || 0 },
      historical_integrity
    );

    // 4. Upsert secure record
    // Note: To persist sugar_avoidance_streak, the column must be added to user_habits table in the future.
    await supabase.from('user_habits').upsert({
        user_id: userId,
        date: todayStr,
        did_log: didLogToday || (todayHabit?.did_log || false),
        steps: metrics?.steps_today || metrics?.steps || 0,
        water: metrics?.water_today || metrics?.water || 0,
        score: metrics?.current_score || metrics?.score || 0,
        streak_count,
        best_streak
    }, { onConflict: 'user_id, date' });

      return { 
      streak_count, 
      best_streak, 
      reward_message: message,
      challenge_packet,
      nutrition_adherence_packet: nutrition_packet,
      commitment_packet // 🧠 Phase 12.4A Core Output
    };

  } catch (error) {
    console.error("updateHabit error:", error);
    // Never throw an error to protect dashboard loading
    return { streak_count: 0, best_streak: 0, reward_message: "" };
  }
}
