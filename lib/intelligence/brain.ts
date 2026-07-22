// 🧠 NUVYU AUTONOMOUS INTELLIGENCE PLATFORM (PHASE 5)
// Independent cognitive subsystem for behavioral understanding, prediction, and intervention.

// 1. IDENTITY ENGINE
export class IdentityEngine {
  static extractIdentity(profile: any) {
    return {
      coreIdentity: profile?.desired_identity || 'improver',
      values: ['consistency', 'longevity'],
      behaviorStyle: profile?.personality_style || 'methodical',
      experienceLevel: profile?.consistency_type || 'beginner',
      confidenceScore: 50, // Evolves over time
      motivationType: profile?.motivation_reason || 'health'
    };
  }
}

// 2. BEHAVIOR ENGINE
export class BehaviorEngine {
  static modelBehavior(logs: any[], recentScores: number[]) {
    const consistencyScore = recentScores.reduce((a, b) => a + b, 0) / (recentScores.length || 1);
    return {
      momentum: consistencyScore > 75 ? 'high' : consistencyScore > 40 ? 'stable' : 'fragile',
      decisionFatigue: logs.length > 5 ? 'elevated' : 'optimal',
      routineStability: 'forming',
      behavioralRisk: consistencyScore < 40 ? 'high_flight_risk' : 'low'
    };
  }
}

// 3. BEHAVIOR PREDICTION ENGINE
export class PredictionEngine {
  static predictFailures(behavior: any, recovery: any) {
    return {
      workoutFailureRisk: recovery?.recovery_state === 'poor' ? 'critical' : 'low',
      sleepFailureRisk: behavior.decisionFatigue === 'elevated' ? 'moderate' : 'low',
      streakLossRisk: behavior.momentum === 'fragile' ? 'high' : 'low',
      burnoutTrajectory: behavior.momentum === 'high' && recovery?.fatigue_risk === 'high' ? 'imminent' : 'stable'
    };
  }
}

// 4. DECISION ENGINE
export class DecisionEngine {
  static triage(identity: any, behavior: any, predictions: any) {
    if (predictions.burnoutTrajectory === 'imminent' || predictions.workoutFailureRisk === 'critical') {
      return { action: 'intervene', focus: 'recovery', priority: 'critical', ignore: ['workout', 'caloric_deficit'] };
    }
    if (predictions.streakLossRisk === 'high') {
      return { action: 'protect', focus: 'micro_habit', priority: 'high', ignore: ['intensity'] };
    }
    return { action: 'progress', focus: 'momentum_push', priority: 'standard', ignore: [] };
  }
}

// 5. INTERVENTION ENGINE
export class InterventionEngine {
  static generate(decision: any) {
    if (decision.focus === 'recovery') return { type: 'rest', action: 'Mandatory Nervous System Recovery', scope: 'immediate' };
    if (decision.focus === 'micro_habit') return { type: 'hydration', action: 'Drink 1 Glass of Water', scope: 'immediate' };
    return { type: 'execution', action: 'Complete Standard Targets', scope: 'daily' };
  }
}

// 6. MEMORY INTELLIGENCE
export class MemoryIntelligence {
  static categorize(pastLogs: any[]) {
    return {
      permanent: { goal: 'long_term_health' },
      behavioral: pastLogs.filter(l => l.log_type === 'steps' || l.log_type === 'water'),
      failures: pastLogs.filter(l => l.data?.amount === 0), // Simplified representation
      achievements: pastLogs.filter(l => l.data?.streak > 5)
    };
  }
}

// 7. CONTEXT ENGINE
export class ContextEngine {
  static build(profile: any, score: number, todayLogs: any[], pastLogs: any[], recoveryData: any) {
    const identity = IdentityEngine.extractIdentity(profile);
    const behavior = BehaviorEngine.modelBehavior(todayLogs, [score]);
    const predictions = PredictionEngine.predictFailures(behavior, recoveryData);
    const decision = DecisionEngine.triage(identity, behavior, predictions);
    const memory = MemoryIntelligence.categorize(pastLogs);
    
    return { identity, behavior, predictions, decision, memory, timeOfDay: new Date().getHours() };
  }
}

// 8. EXECUTION PLANNER
export class ExecutionPlanner {
  static generatePlan(decision: any, targets: any[]) {
    // Translates targets into a chronological execution timeline
    return {
      morning: 'Hydration & Light Movement',
      afternoon: 'Deep Focus & Nutrition',
      evening: decision.focus === 'recovery' ? 'Strict Wind Down' : 'Mobility & Sleep'
    };
  }
}

// 9. AI SAFETY LAYER
export class AISafetyLayer {
  static validate(rawOutput: string) {
    if (!rawOutput) return "Focus on maintaining your daily baseline.";
    const lower = rawOutput.toLowerCase();
    
    // Strict clinical boundary enforcement
    const unsafeKeywords = ['diagnose', 'disease', 'cure', 'calories', 'prescribe', 'injury'];
    for (const word of unsafeKeywords) {
      if (lower.includes(word)) return "Prioritize your physiological recovery today.";
    }
    return rawOutput.trim();
  }
}

// 10. COACH BRAIN (The Orchestrator)
export class CoachBrain {
  static async executePipeline(userId: string, context: any, fallbackTone: string = 'supportive') {
    const intervention = InterventionEngine.generate(context.decision);
    const executionPlan = ExecutionPlanner.generatePlan(context.decision, []);
    
    // 🧠 PROMPT BUILDER
    const prompt = `System: Autonomous Behavioral OS. Tone: ${fallbackTone}. 
      Identity: ${context.identity.behaviorStyle}. Risk: ${context.predictions.streakLossRisk}. 
      Intervention: ${intervention.action}.
      Generate a 2-line personalized behavioral directive ensuring psychological adherence. No medical claims.`;

    try {
      // 🧠 AI INVOCATION (Abstracted from UI)
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId })
      });
      
      if (!res.ok) throw new Error("AI unreachable");
      const data = await res.json();
      
      // 🧠 SAFETY & FORMATTER
      const safeMessage = AISafetyLayer.validate(data.nudge);
      return { message: safeMessage, type: "ai", intervention, executionPlan };
      
    } catch (e) {
      // Offline / Timeout Fallback
      return { 
        message: `System Priority: ${intervention.action}. Let's maintain consistency.`, 
        type: "rule", 
        intervention, 
        executionPlan 
      };
    }
  }
}
