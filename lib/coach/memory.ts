export const getRecentMemory = async (supabase: any, userId: string) => {
  try {
    const { data } = await supabase
      .from('coach_memory')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);
    return data || [];
  } catch (error) {
    return []; // Silently fail to protect core flow
  }
};

export const saveCoachMemory = async (supabase: any, userId: string, metrics: any, behavior: string, message: string, source: string) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    await supabase.from('coach_memory').upsert({
      user_id: userId,
      date: todayStr,
      behavior_type: behavior,
      steps: metrics.today_steps,
      water: metrics.today_water,
      score: metrics.current_score,
      message: message,
      source: source
    }, { onConflict: 'user_id, date' });
  } catch (error) {
    // Fail silently. Memory writing should never block the user experience.
  }
};

export const detectUserPattern = (memory: any[]) => {
  if (!memory || memory.length < 2) return null;
  
  let lowStepsCount = 0;
  let lowWaterCount = 0;
  let improvingCount = 0;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i].steps < 3000) lowStepsCount++;
    if (memory[i].water < 1000) lowWaterCount++;
    // Check if score is improving compared to the previous day (i+1 since ordered by date DESC)
    if (i < memory.length - 1 && memory[i].score > memory[i+1].score) improvingCount++;
  }

  return {
    repeating_low_steps: lowStepsCount >= 2,
    hydration_issue: lowWaterCount >= 2,
    improving_trend: improvingCount >= 2,
    inconsistent_behavior: memory.length >= 3 && improvingCount === 1 && lowStepsCount === 1
  };
};

export const calculateConsistency = (memory: any[]) => {
  if (!memory || memory.length === 0) return 'low';
  const avgScore = memory.reduce((acc, curr) => acc + curr.score, 0) / memory.length;
  if (avgScore >= 75) return 'high';
  if (avgScore >= 40) return 'medium';
  return 'low';
};
