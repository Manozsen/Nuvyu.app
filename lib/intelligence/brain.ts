// 🧠 NUVYU AUTONOMOUS INTELLIGENCE PLATFORM (PHASE 5 - ENTERPRISE REFINEMENT)
// A probabilistic, strictly-typed, and model-agnostic Behavioral Operating System.

// ============================================================================
// COGNITIVE DOMAIN MODELS (The Stripe Standard)
// ============================================================================

export type MotivationDriver = 'aesthetic' | 'longevity' | 'performance' | 'mental_clarity' | 'discipline';
export type CognitiveLoad = 'optimal' | 'accumulating' | 'overloaded' | 'depleted';
export type InterventionType = 'physiological_rest' | 'micro_friction' | 'momentum_push' | 'identity_anchor';

export interface IdentityArchetype {
  primaryDriver: MotivationDriver;
  frictionTolerance: number; // 0.0 to 1.0
  resilienceScore: number;   // 0.0 to 1.0
  adaptabilityIndex: number; // 0.0 to 1.0
}

export interface BehavioralVelocity {
  momentum: number;          // 0.0 to 1.0
  systemicStrain: number;    // 0.0 to 1.0
  cognitiveLoad: CognitiveLoad;
  adherenceDecayRate: number;// 0.0 to 1.0
}

export interface RiskVector {
  domain: 'burnout' | 'streak_loss' | 'injury' | 'apathy';
  probability: number;       // 0.0 to 1.0
  severity: number;          // 0.0 to 1.0
  timeToImpactHours: number;
}

export interface InterventionStrategy {
  type: InterventionType;
  urgency: 'routine' | 'elevated' | 'critical';
  targetDomain: string;
  frictionBarrier: 'low' | 'moderate' | 'high';
}

export interface TimeBlock {
  window: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  action: string;
  flexibility: 'rigid' | 'fluid';
}

export interface CognitiveSnapshot {
  timestamp: number;
  identity: IdentityArchetype;
  velocity: BehavioralVelocity;
  risks: RiskVector[];
  strategy: InterventionStrategy;
}

// ============================================================================
// DEPENDENCY INVERSION: AI PROVIDER
// ============================================================================

export interface IAIProvider {
  generateIntervention(prompt: string, snapshot: CognitiveSnapshot): Promise<string>;
}

export class GeminiOSProvider implements IAIProvider {
  async generateIntervention(prompt: string, snapshot: CognitiveSnapshot): Promise<string> {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Compress snapshot to prevent context dilution
      body: JSON.stringify({ prompt, context: { velocity: snapshot.velocity, strategy: snapshot.strategy } })
    });
    if (!res.ok) throw new Error("AI Integration Failed");
    const data = await res.json();
    return data.nudge;
  }
}

// ============================================================================
// 1. IDENTITY ENGINE
// ============================================================================
export class IdentityEngine {
  static synthesize(profile: any): IdentityArchetype {
    // Translates flat profile data into a multidimensional psychological profile
    const experienceMap: Record<string, number> = { beginner: 0.3, intermediate: 0.6, advanced: 0.9 };
    const baseFriction = experienceMap[profile?.consistency_type || 'beginner'] || 0.3;
    
    return {
      primaryDriver: (profile?.motivation_reason as MotivationDriver) || 'longevity',
      frictionTolerance: baseFriction,
      resilienceScore: profile?.streak_count > 10 ? 0.8 : 0.4,
      adaptabilityIndex: 0.5 // Baseline; mutates over time via MemoryEngine
    };
  }
}

// ============================================================================
// 2. BEHAVIOR ENGINE (The Whoop Standard)
// ============================================================================
export class BehaviorEngine {
  static calculateVelocity(recentScores: number[], logsCount: number, recoveryScore: number): BehavioralVelocity {
    // Calculates the true mathematical vector of user adherence
    const consistency = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length / 100 : 0.5;
    
    const systemicStrain = Math.max(0, 1 - (recoveryScore / 100));
    
    let cognitiveLoad: CognitiveLoad = 'optimal';
    if (logsCount > 8 && systemicStrain > 0.6) cognitiveLoad = 'overloaded';
    else if (logsCount > 5 || systemicStrain > 0.4) cognitiveLoad = 'accumulating';
    else if (consistency < 0.3) cognitiveLoad = 'depleted';

    return {
      momentum: consistency,
      systemicStrain,
      cognitiveLoad,
      adherenceDecayRate: consistency < 0.4 && systemicStrain > 0.7 ? 0.8 : 0.2
    };
  }
}

// ============================================================================
// 3. PREDICTION ENGINE
// ============================================================================
export class PredictionEngine {
  static forecastRisks(velocity: BehavioralVelocity): RiskVector[] {
    const risks: RiskVector[] = [];

    // Burnout Prediction Vector
    if (velocity.systemicStrain > 0.75) {
      risks.push({
        domain: 'burnout',
        probability: velocity.systemicStrain * 0.9,
        severity: 0.95,
        timeToImpactHours: velocity.cognitiveLoad === 'overloaded' ? 12 : 48
      });
    }

    // Apathy/Streak Loss Prediction Vector
    if (velocity.adherenceDecayRate > 0.6 && velocity.momentum < 0.5) {
      risks.push({
        domain: 'apathy',
        probability: velocity.adherenceDecayRate,
        severity: 0.8,
        timeToImpactHours: 24
      });
    }

    return risks.sort((a, b) => (b.probability * b.severity) - (a.probability * a.severity));
  }
}

// ============================================================================
// 4. DECISION ENGINE (Matrix Evaluation)
// ============================================================================
export class DecisionEngine {
  static triage(velocity: BehavioralVelocity, risks: RiskVector[]): InterventionStrategy {
    const highestRisk = risks[0]; // Pre-sorted by severity * probability
    
    // Priority 1: Prevent Systemic Burnout
    if (highestRisk && highestRisk.domain === 'burnout' && highestRisk.probability > 0.7) {
      return { type: 'physiological_rest', urgency: 'critical', targetDomain: 'sleep', frictionBarrier: 'low' };
    }
    
    // Priority 2: Prevent Habit Collapse
    if (highestRisk && highestRisk.domain === 'apathy' && highestRisk.probability > 0.6) {
      return { type: 'micro_friction', urgency: 'elevated', targetDomain: 'hydration', frictionBarrier: 'low' };
    }
    
    // Priority 3: Optimization
    return { type: 'momentum_push', urgency: 'routine', targetDomain: 'movement', frictionBarrier: 'moderate' };
  }
}

// ============================================================================
// 5. INTERVENTION ENGINE
// ============================================================================
export class InterventionEngine {
  static formulate(strategy: InterventionStrategy, identity: IdentityArchetype) {
    // Maps cognitive strategy to concrete OS operations
    const interventionMap = {
      'physiological_rest': 'Override active targets. Enforce minimum hydration and early sleep schedule.',
      'micro_friction': 'Reduce target thresholds by 50%. Guarantee an adherence win today.',
      'momentum_push': 'Standard progressive overload. Maintain caloric and output baselines.',
      'identity_anchor': `Anchor motivation to ${identity.primaryDriver}. Remind user of long-term trajectory.`
    };
    return interventionMap[strategy.type] || interventionMap['momentum_push'];
  }
}

// ============================================================================
// 6. MEMORY INTELLIGENCE
// ============================================================================
export class MemoryIntelligence {
  static extractRelevance(pastLogs: any[]): string {
    // Concept: Future iteration will map to embeddings. 
    // Current: Extracts highest frequency failure vectors.
    const failures = pastLogs.filter(l => l.data?.amount === 0).length;
    return failures > 3 ? 'Historical pattern of mid-week friction detected.' : 'Historical baseline stable.';
  }
}

// ============================================================================
// 7. CONTEXT ENGINE
// ============================================================================
export class ContextEngine {
  static buildSnapshot(profile: any, score: number, todayLogs: any[], pastLogs: any[], recoveryData: any): CognitiveSnapshot {
    const identity = IdentityEngine.synthesize(profile);
    const velocity = BehaviorEngine.calculateVelocity([score], todayLogs.length, recoveryData?.recovery_score || 50);
    const risks = PredictionEngine.forecastRisks(velocity);
    const strategy = DecisionEngine.triage(velocity, risks);
    
    return {
      timestamp: Date.now(),
      identity,
      velocity,
      risks,
      strategy
    };
  }
}

// ============================================================================
// 8. EXECUTION PLANNER
// ============================================================================
export class ExecutionPlanner {
  static generateTimeline(strategy: InterventionStrategy): TimeBlock[] {
    const isRest = strategy.type === 'physiological_rest';
    return [
      { window: 'morning', action: isRest ? 'Hydration & Light Sunlight' : 'Primary Movement & Protein', flexibility: 'rigid' },
      { window: 'midday', action: 'Metabolic Baseline Maintenance', flexibility: 'fluid' },
      { window: 'evening', action: isRest ? 'Strict CNS Wind Down' : 'Mobility & Recovery', flexibility: 'rigid' }
    ];
  }
}

// ============================================================================
// 9. AI SAFETY LAYER (Chain of Thought Validation)
// ============================================================================
export class AISafetyLayer {
  static validateBounds(rawOutput: string, strategy: InterventionStrategy): string {
    if (!rawOutput) return this.getFallback(strategy);
    
    const lower = rawOutput.toLowerCase();
    const unsafeKeywords = ['diagnose', 'disease', 'cure', 'calories', 'prescribe', 'injury', 'medical', 'doctor'];
    
    if (unsafeKeywords.some(word => lower.includes(word))) {
      console.warn("[AISafetyLayer] Rejected output due to medical bounds violation.");
      return this.getFallback(strategy);
    }
    
    // Cognitive bounds validation: Ensure AI doesn't demand high output during rest
    if (strategy.type === 'physiological_rest' && (lower.includes('push hard') || lower.includes('max effort'))) {
       return this.getFallback(strategy);
    }
    
    return rawOutput.trim();
  }

  private static getFallback(strategy: InterventionStrategy): string {
    const fallbacks = {
      'physiological_rest': "System strain detected. Your only priority today is recovery and deep rest.",
      'micro_friction': "Momentum is fragile. Just focus on one small win today. Drink a glass of water.",
      'momentum_push': "System is primed. Execute today's targets to build compounding momentum.",
      'identity_anchor': "Align today's actions with your long-term goals. Consistency is the strategy."
    };
    return fallbacks[strategy.type];
  }
}

// ============================================================================
// 10. COACH BRAIN (The Autonomous Orchestrator)
// ============================================================================
export class CoachBrain {
  private aiProvider: IAIProvider;

  constructor(aiProvider: IAIProvider = new GeminiOSProvider()) {
    this.aiProvider = aiProvider; // Dependency Injection
  }

  async executePipeline(snapshot: CognitiveSnapshot, fallbackTone: string = 'supportive') {
    const intervention = InterventionEngine.formulate(snapshot.strategy, snapshot.identity);
    const executionPlan = ExecutionPlanner.generateTimeline(snapshot.strategy);
    
    // 🧠 PROMPT BUILDER
    const prompt = `System Rule: You are the voice of an Autonomous Behavioral OS. 
    State: User momentum is ${(snapshot.velocity.momentum * 100).toFixed(0)}%. 
    Strain: ${(snapshot.velocity.systemicStrain * 100).toFixed(0)}%.
    OS Strategy: ${intervention}
    Task: Write 2 sentences. Tone: ${fallbackTone}. Translate the OS Strategy into empathetic human instruction. Do not list numbers.`;

    try {
      const rawAIOutput = await this.aiProvider.generateIntervention(prompt, snapshot);
      const safeMessage = AISafetyLayer.validateBounds(rawAIOutput, snapshot.strategy);
      
      return { message: safeMessage, type: "ai", strategy: snapshot.strategy, executionPlan };
    } catch (e) {
      console.warn("[CoachBrain] Provider Failed, returning deterministic fallback.");
      return { 
        message: AISafetyLayer.validateBounds('', snapshot.strategy), // Forced fallback
        type: "rule", 
        strategy: snapshot.strategy, 
        executionPlan 
      };
    }
  }
}

// Singleton for easy import in legacy UI while maintaining injection capabilities
export const coachBrain = new CoachBrain();
