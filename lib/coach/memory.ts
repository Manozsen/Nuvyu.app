import { createBrowserClient } from '@supabase/ssr';

// Helper to reliably get the Supabase client
const getSupabase = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 1. saveCoachMemory
// Designed to support both object-based args { userId, steps... } and backward-compatible positional args
export async function saveCoachMemory(
  arg1: any,
  arg2?: string,
  arg3?: any,
  arg4?: string,
  arg5?: string,
  arg6?: string
) {
  let supabase, userId, steps, water, score, behavior, message, source;
  
  if (typeof arg1 === 'object' && arg1 !== null && arg1.userId) {
    // New Object Signature: saveCoachMemory({ userId, steps... })
    userId = arg1.userId;
    steps = arg1.steps || 0;
    water = arg1.water || 0;
    score = arg1.score || 0;
    behavior = arg1.behavior;
    message = arg1.message;
    source = arg1.source;
    supabase = arg1.supabase || getSupabase();
  } else {
    // Old Positional Signature: saveCoachMemory(supabase, userId, metrics, behavior, message, source)
    supabase = arg1 || getSupabase();
    userId = arg2;
    steps = arg3?.steps_today || arg3?.steps || 0;
    water = arg3?.water_today || arg3?.water || 0;
    score = arg3?.current_score || arg3?.score || 0;
    behavior = arg4;
    message = arg5;
    source = arg6;
  }

  if (!userId) return;

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    await supabase.from('coach_memory').upsert({
      user_id: userId,
      date: todayStr,
      behavior_type: behavior,
      steps,
      water,
      score,
      message,
      source
    }, { onConflict: 'user_id, date' });
  } catch (error) {
    console.error("saveCoachMemory error:", error);
    // Fail silently to protect core logic flow
  }
}

// 2. getRecentMemory
export async function getRecentMemory(arg1: any, arg2?: string) {
  let supabase, userId;
  
  if (typeof arg1 === 'string') {
    // New Signature: getRecentMemory(userId)
    userId = arg1;
    supabase = getSupabase();
  } else {
    // Old Signature: getRecentMemory(supabase, userId)
    supabase = arg1 || getSupabase();
    userId = arg2;
  }

  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('coach_memory')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("getRecentMemory error:", error);
    return []; // Return safe default
  }
}

// 3. detectUserPattern
export function detectUserPattern(memory: any[]) {
  if (!memory || memory.length < 3) return null;
  
  let lowStepsCount = 0;
  let lowWaterCount = 0;

  // Check the last 3 days
  for (let i = 0; i < 3; i++) {
    if (memory[i].steps < 3000) lowStepsCount++;
    if (memory[i].water < 1000) lowWaterCount++;
  }

  if (lowStepsCount >= 3) return "repeating_low_steps";
  if (lowWaterCount >= 3) return "hydration_issue";

// 5. extractLongTermMemory (LONG-TERM BEHAVIOR MEMORY v3)
export function extractLongTermMemory(memory: any[]) {
  if (!memory || memory.length === 0) return { memory_status: "insufficient_data" };
  
  let repeated_failures = 0;
  let recovery_history: string[] = [];
  let hydration_history: number[] = [];

  memory.forEach(m => {
    if (m.score < 40) repeated_failures++;
    if (m.recovery_state) recovery_history.push(m.recovery_state);
    if (m.water) hydration_history.push(m.water);
  });

  const avg_water = hydration_history.reduce((a, b) => a + b, 0) / (hydration_history.length || 1);
  const burnout_cycles = repeated_failures >= 2;

  return {
    repeated_failure_count: repeated_failures,
    long_term_hydration_avg: Math.round(avg_water),
    frequent_recovery_state: recovery_history[0] || "unknown",
    burnout_cycles_detected: burnout_cycles,
    memory_status: "active"
  };
}

// 4. calculateConsistency
export function calculateConsistency(memory: any[]) {
  if (!memory || memory.length === 0) return "low";
  
  // Based on number of days with logs (score/activity > 0)
  const daysWithLogs = memory.filter(m => m.score > 0 || m.steps > 0 || m.water > 0).length;
  
  if (daysWithLogs >= 4) return "high";
  if (daysWithLogs >= 2) return "medium";
  return "low";
}
