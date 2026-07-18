export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TargetSource = 'safety_engine' | 'rule_engine' | 'ai_optimization' | 'fallback_engine';
export type TargetPriority = 'critical' | 'high' | 'medium' | 'low' | 'deferred' | 'blocked';
export type TargetCategory = 'movement' | 'hydration' | 'sleep' | 'nutrition' | 'recovery' | 'system';

export interface CanonicalTarget {
  id: string;
  category: TargetCategory;
  priority: TargetPriority;
  value: number | string;
  unit: string;
  reason: string;
  confidence: ConfidenceLevel;
  source: TargetSource;
  expiresAt: string;
  ui: {
    action: string;
    focus: string;
    link: string;
    icon: string;
  };
}

export interface TargetEngineContext {
  water: number;
  steps: number;
  proteinHit: boolean;
  targetWater: number;
  targetSteps: number;
  fatigueRisk: string;
  recoveryState: string;
}

export interface PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null;
}

export interface AIOptimizerProvider {
  optimize(context: TargetEngineContext, target: CanonicalTarget): CanonicalTarget;
}

// 🧠 AI OPTIMIZATION ABSTRACTION
// Pluggable provider architecture supporting Gemini, GPT, Claude, etc.
export class GenericAITargetProvider implements AIOptimizerProvider {
  optimize(context: TargetEngineContext, target: CanonicalTarget): CanonicalTarget {
    // Immutable AI Governance Rule: Gemini NEVER decides targets.
    // It may only explain or personalize the target string outputs.
    return target; 
  }
}

class SafetyEngineStage implements PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (context.fatigueRisk === 'high' || context.fatigueRisk === 'critical_warning') {
      return {
        id: `target_safety_${Date.now()}`,
        category: 'recovery',
        priority: 'blocked',
        value: 'Mandatory Rest',
        unit: 'state',
        reason: 'Critical fatigue risk detected. High-intensity output is blocked to protect central nervous system.',
        confidence: 'high',
        source: 'safety_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Rest Required', focus: 'Nervous System Recovery', link: '/log', icon: 'activity' }
      };
    }
    return currentTarget;
  }
}

class RuleEngineStage implements PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    // Immutable Pipeline Rule: Rule Engine NEVER overrides Safety Engine
    if (currentTarget?.source === 'safety_engine') return currentTarget; 

    if (context.water < context.targetWater) {
      return {
        id: `target_water_${Date.now()}`,
        category: 'hydration',
        priority: 'high',
        value: context.targetWater - context.water,
        unit: 'ml',
        reason: 'Your body needs water to maintain metabolic baseline and systemic recovery today.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Log Water', focus: 'Hydration Priority', link: '/log', icon: 'droplets' }
      };
    }
    if (context.steps < context.targetSteps) {
      return {
        id: `target_steps_${Date.now()}`,
        category: 'movement',
        priority: 'high',
        value: context.targetSteps - context.steps,
        unit: 'steps',
        reason: 'Walking will safely bridge your active calorie deficit without central nervous system strain.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Complete Walk', focus: 'Movement Priority', link: '/log', icon: 'footprints' }
      };
    }
    if (!context.proteinHit) {
      return {
        id: `target_protein_${Date.now()}`,
        category: 'nutrition',
        priority: 'high',
        value: 'Remaining',
        unit: 'g',
        reason: 'Protein is strictly required to repair nervous system strain and support hypertrophy.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Log Protein', focus: 'Recovery Fuel', link: '/log', icon: 'flame' }
      };
    }

    return {
      id: `target_sleep_${Date.now()}`,
      category: 'sleep',
      priority: 'medium',
      value: 8,
      unit: 'hours',
      reason: 'All daily outputs met. Wind down to lock in today\'s physiological gains.',
      confidence: 'high',
      source: 'rule_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      ui: { action: 'Prioritize Sleep', focus: 'System Recovery', link: '/log', icon: 'moon' }
    };
  }
}

class AIOptimizationStage implements PipelineStage {
  constructor(private provider: AIOptimizerProvider) {}
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (!currentTarget) return null;
    if (currentTarget.source === 'safety_engine') return currentTarget; // Immutable architecture override
    return this.provider.optimize(context, currentTarget);
  }
}

class TargetValidator {
  validate(target: CanonicalTarget | null): CanonicalTarget {
    if (!target || !target.id || !target.reason || !target.ui) {
      return this.getFallbackTarget();
    }
    return target;
  }
  
  private getFallbackTarget(): CanonicalTarget {
    return {
      id: `target_fallback_${Date.now()}`,
      category: 'system',
      priority: 'low',
      value: 0,
      unit: 'none',
      reason: 'Operating in fallback mode to ensure system stability.',
      confidence: 'low',
      source: 'fallback_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      ui: { action: 'Log Progress', focus: 'System Offline', link: '/log', icon: 'activity' }
    };
  }
}

export class TargetIntelligenceEngine {
  private safety = new SafetyEngineStage();
  private rules = new RuleEngineStage();
  private aiOptimization = new AIOptimizationStage(new GenericAITargetProvider());
  private validator = new TargetValidator();

  public getDailyTarget(context: TargetEngineContext): CanonicalTarget {
    let target: CanonicalTarget | null = null;
    
    // 🧠 IMMUTABLE EXECUTION PIPELINE
    // Safety -> Rule Engine -> AI Optimization -> Validator -> Published Target
    target = this.safety.execute(context, target);
    target = this.rules.execute(context, target);
    target = this.aiOptimization.execute(context, target);
    
    return this.validator.validate(target);
  }
}

// Singleton instantiation prevents lifecycle re-initializations
export const targetIntelligenceEngine = new TargetIntelligenceEngine();
