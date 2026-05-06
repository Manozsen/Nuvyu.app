export const getRewardMessage = (streak: number, broken: boolean, previousStreak: number) => {
  if (broken && previousStreak > 0) return `You lost your ${previousStreak} day streak. Aaj se restart karo.`;
  if (streak === 1) return "Good start 🔥";
  if (streak === 3) return "Momentum ban raha hai ⚡";
  if (streak === 7) return "Strong discipline 💪";
  if (streak === 14) return "Habit lock ho rahi hai 🎯";
  if (streak === 30) return "Elite level consistency 🚀";
  if (streak > 1) return `${streak} day streak! Keep going.`;
  return "Log activity to start a streak!";
};

export const updateHabit = async (supabase: any, userId: string, metrics: any, didLogToday: boolean) => {
  try {
    const today = new Date();
    
    // Strict local date parsing to avoid UTC shift
    const getLocalDateStr = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    const todayStr = getLocalDateStr(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    // Fetch yesterday
    const { data: yesterdayHabit } = await supabase.from('user_habits').select('*').eq('user_id', userId).eq('date', yesterdayStr).single();
    
    // Fetch today
    const { data: todayHabit } = await supabase.from('user_habits').select('*').eq('user_id', userId).eq('date', todayStr).single();

    // Fetch absolute best
    const { data: bestHabit } = await supabase.from('user_habits').select('best_streak').eq('user_id', userId).order('best_streak', { ascending: false }).limit(1).single();
    let max_historical_streak = bestHabit?.best_streak || 0;

    let streak_count = 0;
    let best_streak = max_historical_streak;
    let streak_broken = false;
    let previous_streak = 0;

    // Logic for Streak
    if (todayHabit && todayHabit.did_log) {
        // Already secured today
        streak_count = todayHabit.streak_count;
        best_streak = todayHabit.best_streak;
    } else {
        if (didLogToday) {
            if (yesterdayHabit && yesterdayHabit.did_log) {
                // Streak Continues
                streak_count = (yesterdayHabit.streak_count || 0) + 1;
            } else {
                // Streak Breaks / Restarts
                streak_count = 1;
                // Find what the last lost streak was
                const { data: lastLog } = await supabase.from('user_habits').select('streak_count').eq('user_id', userId).eq('did_log', true).lt('date', todayStr).order('date', { ascending: false }).limit(1).single();
                if (lastLog && lastLog.streak_count > 0) {
                    streak_broken = true;
                    previous_streak = lastLog.streak_count;
                }
            }
            best_streak = Math.max(streak_count, max_historical_streak);
        } else {
            // Dashboard load, not logged yet today
            streak_count = yesterdayHabit?.did_log ? yesterdayHabit.streak_count : 0;
        }
    }

    const message = getRewardMessage(streak_count, streak_broken, previous_streak);

    await supabase.from('user_habits').upsert({
        user_id: userId,
        date: todayStr,
        did_log: didLogToday || (todayHabit?.did_log || false),
        steps: metrics.steps_today || 0,
        water: metrics.water_today || 0,
        score: metrics.current_score || 0,
        streak_count,
        best_streak
    }, { onConflict: 'user_id, date' });

    return { streak_count, best_streak, reward_message: message };

  } catch (error) {
    // Fail safe: System continues unharmed
    return { streak_count: 0, best_streak: 0, reward_message: "" };
  }
};
