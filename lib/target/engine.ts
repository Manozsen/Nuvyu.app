export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TargetSource = 'safety_engine' | 'rule_engine' | 'ai_optimization' | 'fallback_engine';
export type TargetPriority = 'critical' | 'high' | 'medium' | 'low' | 'deferred' | 'blocked';
export type TargetCategory = 'movement' | 'hydration' | 'sleep' | 'nutrition' | 'recovery' | 'system';
export type TargetLifecycle = 'pending' | 'active' | 'completed' | 'skipped' | 'expired' | 'archived';

export interface TargetProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface CanonicalTarget {
  id: string;
  category: TargetCategory;
  priority: TargetPriority;
  lifecycle: TargetLifecycle;
  progress: TargetProgress;
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
    color: string;
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
        lifecycle: 'active',
        progress: { current: 0, target: 100, percentage: 0 },
        value: 'Mandatory Rest',
        unit: 'state',
        reason: 'Critical fatigue risk detected. High-intensity output is blocked to protect central nervous system.',
        confidence: 'high',
        source: 'safety_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Rest Required', focus: 'Nervous System Recovery', link: '/log', icon: 'activity', color: 'text-orange-400' }
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
        lifecycle: 'active',
        progress: { current: context.water, target: context.targetWater, percentage: Math.min(100, (context.water / Math.max(1, context.targetWater)) * 100) },
        value: context.targetWater - context.water,
        unit: 'ml',
        reason: 'Your body needs water to maintain metabolic baseline and systemic recovery today.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Log Water', focus: 'Hydration Priority', link: '/log', icon: 'droplets', color: 'text-blue-400' }
      };
    }
    if (context.steps < context.targetSteps) {
      return {
        id: `target_steps_${Date.now()}`,
        category: 'movement',
        priority: 'high',
        lifecycle: 'active',
        progress: { current: context.steps, target: context.targetSteps, percentage: Math.min(100, (context.steps / Math.max(1, context.targetSteps)) * 100) },
        value: context.targetSteps - context.steps,
        unit: 'steps',
        reason: 'Walking will safely bridge your active calorie deficit without central nervous system strain.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Complete Walk', focus: 'Movement Priority', link: '/log', icon: 'footprints', color: 'text-[#00FFA3]' }
      };
    }
    if (!context.proteinHit) {
      return {
        id: `target_protein_${Date.now()}`,
        category: 'nutrition',
        priority: 'high',
        lifecycle: 'active',
        progress: { current: 0, target: 100, percentage: 0 },
        value: 'Remaining',
        unit: 'g',
        reason: 'Protein is strictly required to repair nervous system strain and support hypertrophy.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        ui: { action: 'Log Protein', focus: 'Recovery Fuel', link: '/log', icon: 'flame', color: 'text-orange-400' }
      };
    }

    return {
      id: `target_sleep_${Date.now()}`,
      category: 'sleep',
      priority: 'medium',
      lifecycle: 'pending',
      progress: { current: 0, target: 8, percentage: 0 },
      value: 8,
      unit: 'hours',
      reason: 'All daily outputs met. Wind down to lock in today\'s physiological gains.',
      confidence: 'high',
      source: 'rule_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      ui: { action: 'Prioritize Sleep', focus: 'System Recovery', link: '/log', icon: 'moon', color: 'text-indigo-400' }
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
      lifecycle: 'active',
      progress: { current: 0, target: 100, percentage: 0 },
      value: 0,
      unit: 'none',
      reason: 'Operating in fallback mode to ensure system stability.',
      confidence: 'low',
      source: 'fallback_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      ui: { action: 'Log Progress', focus: 'System Offline', link: '/log', icon: 'activity', color: 'text-white' }
    };
  }
}

export class TargetIntelligenceEngine {
  private safety = new SafetyEngineStage();
  private rules = new RuleEngineStage();
  private aiOptimization = new AIOptimizationStage(new GenericAITargetProvider());
  private validator = new TargetValidator();

  public getPrimaryPriority(context: TargetEngineContext): CanonicalTarget {
    let target: CanonicalTarget | null = null;
    target = this.safety.execute(context, target);
    target = this.rules.execute(context, target);
    target = this.aiOptimization.execute(context, target);
    return this.validator.validate(target);
  }

  // 🧠 SINGLE SOURCE OF TRUTH: Full Daily Plan Generation
  public getDailyTargets(context: TargetEngineContext): CanonicalTarget[] {
    const expiresAt = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
    
    // 1. Generate Raw Candidates deterministically
    const rawTargets: CanonicalTarget[] = [
      {
        id: `target_steps_${Date.now()}`, category: 'movement', priority: 'high',
        lifecycle: context.steps >= context.targetSteps ? 'completed' : 'active',
        progress: { current: context.steps, target: context.targetSteps, percentage: Math.min(100, (context.steps / Math.max(1, context.targetSteps)) * 100) },
        value: context.targetSteps, unit: 'steps', reason: 'Maintains cardiovascular baseline and metabolic health.',
        confidence: 'high', source: 'rule_engine', expiresAt,
        ui: { action: 'Complete Walk', focus: 'Walk', link: '/log', icon: 'footprints', color: 'text-[#00FFA3]' }
      },
      {
        id: `target_water_${Date.now()}`, category: 'hydration', priority: 'critical',
        lifecycle: context.water >= context.targetWater ? 'completed' : 'active',
        progress: { current: context.water, target: context.targetWater, percentage: Math.min(100, (context.water / Math.max(1, context.targetWater)) * 100) },
        value: context.targetWater, unit: 'ml', reason: 'Essential for cellular recovery and nervous system repair.',
        confidence: 'high', source: 'rule_engine', expiresAt,
        ui: { action: 'Log Water', focus: 'Stay Hydrated', link: '/log', icon: 'droplets', color: 'text-blue-400' }
      },
      {
        id: `target_protein_${Date.now()}`, category: 'nutrition', priority: 'high',
        lifecycle: context.proteinHit ? 'completed' : 'active',
        progress: { current: context.proteinHit ? 100 : 0, target: 100, percentage: context.proteinHit ? 100 : 0 },
        value: 'Goal', unit: 'hit', reason: 'Critical for muscular adaptation following daily strain.',
        confidence: 'high', source: 'rule_engine', expiresAt,
        ui: { action: 'Log Protein', focus: 'Protein Baseline', link: '/log', icon: 'flame', color: 'text-orange-400' }
      },
      {
        id: `target_sleep_${Date.now()}`, category: 'sleep', priority: 'high',
        lifecycle: 'pending', // Sleep is pending until night
        progress: { current: 0, target: 8, percentage: 0 },
        value: 8, unit: 'hours', reason: 'Deep rest secures the physiological adaptations earned today.',
        confidence: 'high', source: 'rule_engine', expiresAt,
        ui: { action: 'Prioritize Sleep', focus: 'Deep Rest', link: '/log', icon: 'moon', color: 'text-indigo-400' }
      }
    ];

    // 2. Validate, AI-Optimize, and Apply Safety Modifiers to collection
    const validatedTargets = rawTargets.map(t => this.validator.validate(this.aiOptimization.execute(context, t) || t));

    // 3. Dynamic Ordering Logic
    // Active targets first -> High Priority first -> Pending -> Completed at bottom
    return validatedTargets.sort((a, b) => {
      const lifecycleWeight = { active: 1, pending: 2, completed: 3, skipped: 4, expired: 5, archived: 6 };
      if (lifecycleWeight[a.lifecycle] !== lifecycleWeight[b.lifecycle]) {
        return lifecycleWeight[a.lifecycle] - lifecycleWeight[b.lifecycle];
      }
      const priorityWeight = { critical: 1, high: 2, medium: 3, low: 4, deferred: 5, blocked: 6 };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });
  }
}

// Singleton instantiation prevents lifecycle re-initializations
export const targetIntelligenceEngine = new TargetIntelligenceEngine();
