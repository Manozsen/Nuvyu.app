import { createBrowserClient } from '@supabase/ssr';

// Helper to reliably get the Supabase client
const getSupabase = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// 1. getRewardMessage
export function getRewardMessage(streak: number) {
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

    const message = getRewardMessage(streak_count);

    // 4. Upsert secure record
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

    return { streak_count, best_streak, reward_message: message };

  } catch (error) {
    console.error("updateHabit error:", error);
    // Never throw an error to protect dashboard loading
    return { streak_count: 0, best_streak: 0, reward_message: "" };
  }
}
