import { dashboardRepository } from '../repositories/dashboard.repository';
import { getLocalMidnightRange, getUserLocalToday } from '../time/engine';
import { calculateEnergyBalance, calculateRecoveryState, detectFatiguePattern } from '../calories/energyEngine';
import { detectBurnoutRisk } from '../recovery/engine';
import { calculateDailyScore } from '../score/engine';
import { calculateAdaptiveGoals } from '../personalization/engine';
import { ContextEngine, UserProfile, BehaviorLog, InterventionResult } from '../intelligence/brain';
import { AIRuntime } from './ai';
import { BehavioralStateStore, EnergyStats } from '../infrastructure/store';
import { safeNumber } from '../utils/safe';
import { safeSleepHours, safeSleepQuality, safeRecoveryScore } from '../utils/sleep';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// 🧠 ARCHITECTURE FREEZE: DASHBOARD PIPELINE
// Orchestrates Domain Engines and AI cleanly outside of React.
export class DashboardPipeline {
  
    public static async run(router: AppRouterInstance): Promise<void> {
    try {
      const userProfile = await this.authenticateUser(router);
      if (!userProfile) return; // Router redirect handled internally

      // 🧠 ARCHITECTURE FREEZE: Explicit string cast to satisfy strict unknown fallback
      const telemetry = await this.fetchTelemetryData(userProfile.id as string);
      const metrics = this.computeDomainMetrics(userProfile, telemetry);
      const brainOutput = await this.orchestrateIntelligence(userProfile, metrics, telemetry);

      this.commitCanonicalState(userProfile, telemetry, metrics, brainOutput);
    } catch (error) {
      console.error("[DashboardPipeline] Execution failed:", error);
      BehavioralStateStore.dispatch({ 
        type: 'StateUpdated', 
        payload: { session: { loadingState: 'error' }, runtime: { lastError: String(error) } as any }, 
        timestamp: Date.now() 
      });
    }
  }

  // ============================================================================
  // PRIVATE PIPELINE STAGES
  // ============================================================================

  private static async authenticateUser(router: AppRouterInstance): Promise<UserProfile | null> {
    const { data: { user }, error: authError } = await dashboardRepository.getUser();
    if (authError || !user) { router.push('/login'); return null; }
    
    const { data: profile } = await dashboardRepository.getProfile(user.id);
    if (!profile) { router.push('/onboarding'); return null; }
    
    return { ...profile, id: user.id, email: user.email } as UserProfile;
  }

  private static async fetchTelemetryData(userId: string) {
    const { start_utc, end_utc } = getLocalMidnightRange();
    const threeDaysAgo = new Date(); 
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 🚀 PERFORMANCE UPGRADE: Concurrent Data Fetching
    const [rawLogsRes, pastLogsRes, latestSleepRes] = await Promise.all([
      dashboardRepository.getLogs(userId, start_utc, end_utc),
      dashboardRepository.getPastLogs(userId, threeDaysAgo.toISOString(), start_utc),
      dashboardRepository.getLatestSleep(userId)
    ]);

    const logs: BehaviorLog[] = rawLogsRes.data || [];
    const pastLogs: BehaviorLog[] = pastLogsRes.data || [];
    
    let totalSteps = 0, totalWater = 0, workoutLogsCount = 0;
    let totalProtein = 0, energyIntake = 0;
    
    logs.forEach(log => {
      const val = Number(log.data?.amount) || 0;
      if (log.log_type === 'steps') totalSteps += val;
      if (log.log_type === 'water') totalWater += val;
      if (log.log_type === 'workout') workoutLogsCount += 1;
      if (log.log_type === 'food') {
         energyIntake += val;
         totalProtein += Number(log.data?.protein) || 0;
      }
    });

    return { logs, pastLogs, latestSleep: latestSleepRes.data, totalSteps, totalWater, workoutLogsCount, totalProtein, energyIntake };
  }

  private static computeDomainMetrics(profile: UserProfile, telemetry: any) {
    const energyStats: EnergyStats = calculateEnergyBalance(profile, telemetry.logs);
    
    const timelineSleep = telemetry.logs.find((l: BehaviorLog) => l.log_type === 'sleep');
    const sleepHours = safeSleepHours(timelineSleep?.data, telemetry.latestSleep);
    const computedScore = safeRecoveryScore(telemetry.latestSleep?.recovery_score, sleepHours);
    const recState = calculateRecoveryState(sleepHours, safeSleepQuality(timelineSleep?.data, telemetry.latestSleep), 'moderate', safeNumber(energyStats?.energyBalance));
    
    const recoveryData = (sleepHours > 0 || telemetry.latestSleep) ? {
      sleep_hours: sleepHours, recovery_score: computedScore, recovery_state: recState,
      fatigue_risk: detectFatiguePattern(recState, sleepHours, safeNumber(energyStats?.activityBurn), safeNumber(energyStats?.energyBalance))
    } : null;

    const recentRecScores = telemetry.pastLogs.filter((l: BehaviorLog) => l.log_type === 'sleep').slice(0, 3).map((l: BehaviorLog) => Number(l.data?.recovery_score) || 50);
    const { risk_level: burnoutRisk } = detectBurnoutRisk(computedScore, sleepHours, safeNumber(profile.streak_count), safeNumber(energyStats?.deficit), recentRecScores);
    
    const scoreConfig = { sleepHours, recoveryScore: computedScore, streakCount: profile.streak_count || 0, burnoutRisk, isV1: false };
    const { finalScore: calculatedScore, breakdown: scoreBreakdown } = calculateDailyScore(telemetry.logs, scoreConfig);

    const adaptiveGoals = calculateAdaptiveGoals(safeNumber(profile.tdee as number, 2000), 6000, recState, burnoutRisk, "stable", "stable");

    return { energyStats, recoveryData, burnoutRisk, calculatedScore, scoreBreakdown, adaptiveGoals, sleepHours, computedScore, recState };
  }

      private static async orchestrateIntelligence(profile: UserProfile, metrics: any, telemetry: any): Promise<InterventionResult | null> {
    const snapshot = ContextEngine.buildSnapshot(profile, metrics.calculatedScore, telemetry.logs, telemetry.pastLogs, metrics.recoveryData);
    const aiResult = await AIRuntime.executeSafely(snapshot, (profile.coach_tone as string) || 'supportive') as InterventionResult | null;

    // 🧠 DETERMINISTIC COACHING FALLBACK 
    if (!aiResult || aiResult.type === "rule") {
      let contextualMessage = "System is primed. Execute today's targets.";
      if (telemetry.totalWater < 1000) contextualMessage = "Hydration is critically low. Drink water immediately to protect your recovery baseline.";
      else if (telemetry.energyIntake > 0 && telemetry.totalProtein < 50) contextualMessage = "Nutrition logged, but protein is low. Prioritize protein in your next meal.";
      else if (telemetry.totalSteps < 3000) contextualMessage = "Hydration secured. Step count is low. Break the friction with a short walk.";
      else if (metrics.sleepHours > 0 && metrics.sleepHours < 5) contextualMessage = "Target momentum is good, but sleep debt is high. Prioritize early rest tonight.";
      else contextualMessage = "Excellent consistency today. Complete your remaining targets and prepare for deep rest.";

      return { message: contextualMessage, type: "rule", strategy: snapshot?.strategy || null, executionPlan: [] };
    }
    return aiResult;
  }

  private static commitCanonicalState(profile: UserProfile, telemetry: any, metrics: any, brainOutput: InterventionResult | null) {
    // 🧠 DETERMINISTIC XP PROGRESSION ENGINE
    let todayXP = Math.min(telemetry.logs.length, 3) * 5;
    const cappedSteps = Math.min(telemetry.totalSteps, 12000);
    if (cappedSteps >= 6000) todayXP += 20;
    else if (cappedSteps >= 3000) todayXP += 10;
    if (telemetry.totalWater >= 2000) todayXP += 15;
    else if (telemetry.totalWater >= 1000) todayXP += 8;
    todayXP += telemetry.workoutLogsCount * 10;
    todayXP = Math.min(todayXP, 50);

    const baseRawXp = Math.max(0, Number(profile.xp) || 0);
    const effectiveRawXp = baseRawXp + todayXP; // Add today's action XP to total
    const currentLevel = Number(profile.level) || 1;
    const currentLevelBase = (currentLevel - 1) * 250;
    const nextLevelThreshold = currentLevel * 250;
    
    const xpIntoLevel = Math.max(0, effectiveRawXp - currentLevelBase);
    const xpToNext = Math.max(0, nextLevelThreshold - effectiveRawXp);
    const progressPercent = Math.min(100, Math.floor((xpIntoLevel / 250) * 100));

    BehavioralStateStore.dispatch({ 
      type: 'StateUpdated', 
      payload: {
        session: { loadingState: 'ready' },
        user: { profile },
        score: { current: metrics.calculatedScore },
        dashboard: { scoreSummary: this.breakdownToSummary(metrics.scoreBreakdown) },
        coach: { 
          message: brainOutput?.message || "Focus on maintaining your baseline today.", 
          type: brainOutput?.type || "rule", 
          strategy: brainOutput?.strategy || null, 
          executionPlan: brainOutput?.executionPlan || [] 
        },
        analytics: { 
          xp: effectiveRawXp, 
          level: currentLevel, 
          todayXP: todayXP, 
          streak_count: Number(profile.streak_count) || 0, 
          best_streak: Number(profile.best_streak) || 0,
          progress_percent: progressPercent,
          xp_into_level: xpIntoLevel,
          xp_to_next_level: xpToNext,
          next_level_threshold: nextLevelThreshold
        },
        progress: { logsCount: telemetry.logs.length, today_logs: telemetry.logs },
        activity: { steps: telemetry.totalSteps, energy_burned: metrics.energyStats?.totalBurn || 0 },
        nutrition: { 
          energy_intake: telemetry.energyIntake || metrics.energyStats?.intakeCalories || 0, 
          energy_balance: metrics.energyStats?.energyBalance || 0, 
          energy_stats: metrics.energyStats, 
          proteinHit: telemetry.totalProtein >= (Number(profile.target_protein) || 50) 
        },
        hydration: { waterIntake: telemetry.totalWater },
        workout: { workoutLogsCount: telemetry.workoutLogsCount },
        recovery: { sleep_hours: metrics.sleepHours, recovery_score: metrics.computedScore, recovery_state: metrics.recState, fatigue_risk: metrics.recoveryData?.fatigue_risk || 'low', burnout_risk: metrics.burnoutRisk },
        targets: { goal_packet: metrics.adaptiveGoals?.goal_packet, adaptation_mode: metrics.adaptiveGoals?.adaptation_mode, capacity_packet: metrics.adaptiveGoals?.capacity_packet, capacity_budget: metrics.adaptiveGoals?.capacity_budget }
      },
      timestamp: Date.now() 
    });
  }

  private static breakdownToSummary(breakdown: any): string {
    if (!breakdown) return "";
    const parts = [];
    if (breakdown.movement_score) parts.push(`+${Math.round(breakdown.movement_score)} motion`);
    if (breakdown.physiological_score) parts.push(`+${Math.round(breakdown.physiological_score)} body`);
    if (breakdown.nutrition_score) parts.push(`+${Math.round(breakdown.nutrition_score)} fuel`);
    if (breakdown.consistency_score) parts.push(`+${Math.round(breakdown.consistency_score)} habit`);
    if (breakdown.penalty < 0) parts.push(`${breakdown.penalty} risk`);
    return parts.length > 0 ? parts.join(" • ") : "Ready to track";
  }
}
