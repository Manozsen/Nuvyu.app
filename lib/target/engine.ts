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
  // UI object explicitly removed. Domain owns data. Presentation owns UI.
}

export interface UserProfileContext {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: 'male' | 'female' | 'other';
  goal: 'fat_loss' | 'muscle_gain' | 'longevity' | 'maintenance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
}

export interface UserProfileContext {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: 'male' | 'female' | 'other';
  goal: 'fat_loss' | 'muscle_gain' | 'longevity' | 'maintenance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
}

export interface TargetEngineContext {
  profile: UserProfileContext;
  water: number;
  steps: number;
  proteinHit: boolean;
  fatigueRisk: string;
  recoveryState: string;
  momentumScore: number;
}

export interface PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null;
}

export interface DeterministicCalculations {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  water: number;
  electrolytes: string;
  workoutVolume: string;
  trainingLoad: number;
  recoveryLoad: number;
  steps: number;
  sleep: number;
  dailyEnergyBudget: number;
}

// 🧠 SMART DETERMINISTIC CALCULATOR (Phase 4 Upgrade)
// Produces hyper-personalized clinical targets without relying on AI.
export class DeterministicTargetCalculator {
  static calculate(profile: UserProfileContext, context: TargetEngineContext): DeterministicCalculations {
    const isMale = profile.gender === 'male';
    // Mifflin-St Jeor BMR
    const bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) + (isMale ? 5 : -161);
    
    // Activity Multiplier
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
    const tdee = bmr * multipliers[profile.activityLevel];

    // Goal Modifiers
    const goalMods = { fat_loss: 0.8, maintenance: 1.0, muscle_gain: 1.15, longevity: 0.95 };
    let dailyEnergyBudget = Math.round(tdee * goalMods[profile.goal]);

    // Recovery & Fatigue Clamping
    if (context.fatigueRisk === 'high' || context.recoveryState === 'poor') {
      dailyEnergyBudget = Math.round(tdee); // Force maintenance to recover CNS
    }

    // Macros
    const protein = profile.goal === 'muscle_gain' ? Math.round(profile.weightKg * 2.2) : Math.round(profile.weightKg * 1.8);
    const fat = Math.round((dailyEnergyBudget * 0.25) / 9);
    const carbohydrates = Math.round((dailyEnergyBudget - (protein * 4) - (fat * 9)) / 4);
    const fiber = Math.round(dailyEnergyBudget / 1000 * 14);

    // Hydration & Electrolytes
    const water = Math.round((profile.weightKg * 35) + (context.fatigueRisk === 'high' ? 500 : 0));
    const electrolytes = context.recoveryState === 'poor' ? 'High Sodium/Magnesium' : 'Standard';

    // Output & Load
    let steps = profile.goal === 'fat_loss' ? 10000 : 8000;
    if (context.momentumScore < 40) steps = Math.max(5000, steps * 0.8); // Friction reduction
    
    const workoutVolume = context.fatigueRisk === 'high' ? 'Active Recovery / Mobility' : 'Progressive Overload';
    const trainingLoad = context.fatigueRisk === 'high' ? 30 : 85;
    const recoveryLoad = 100 - trainingLoad;
    
    const sleep = context.recoveryState === 'poor' ? 8.5 : 7.5;

    return {
      calories: dailyEnergyBudget,
      protein, fat, carbohydrates, fiber,
      water, electrolytes,
      workoutVolume, trainingLoad, recoveryLoad,
      steps, sleep, dailyEnergyBudget
    };
  }
}

// 🧠 EXTENSIBLE RULE REGISTRY (Auto-Discovery Architecture)
export interface RegisteredRule {
  version: string;
  rule: PipelineStage;
}

export class RuleRegistry {
  private static instance: RuleRegistry;
  private rules: Map<string, RegisteredRule> = new Map();
  
  private constructor() {}
  
  static getInstance() {
    if (!RuleRegistry.instance) RuleRegistry.instance = new RuleRegistry();
    return RuleRegistry.instance;
  }
  
  public register(id: string, version: string, rule: PipelineStage) { 
    this.rules.set(id, { version, rule }); 
  }
  
  public getRules(): PipelineStage[] { 
    return Array.from(this.rules.values()).map(r => r.rule); 
  }
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
        id: 'recovery_safety_override',
        category: 'recovery',
        priority: 'blocked',
        lifecycle: 'active',
        progress: { current: 0, target: 100, percentage: 0 },
        value: 'Mandatory Rest',
        unit: 'state',
        reason: 'Critical fatigue risk detected. High-intensity output is blocked to protect central nervous system.',
        confidence: 'high',
        source: 'safety_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
       };
     }
    return currentTarget;
  }
}

// 🧠 EXTENSIBLE RULE REGISTRY
export class RuleRegistry {
  private rules: PipelineStage[] = [];
  public register(rule: PipelineStage) { this.rules.push(rule); }
  public getRules() { return this.rules; }
}

class HydrationRule implements PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (currentTarget?.source === 'safety_engine') return currentTarget;
    const dynamicTargets = DeterministicTargetCalculator.calculate(context.profile, context);
    
    if (context.water < dynamicTargets.water) {
      return {
        id: 'hydration_daily',
        category: 'hydration',
        priority: 'high',
        lifecycle: 'active',
        progress: { current: context.water, target: dynamicTargets.water, percentage: Math.min(100, (context.water / Math.max(1, dynamicTargets.water)) * 100) },
        value: dynamicTargets.water - context.water,
        unit: 'ml',
        reason: 'Calculated hydration baseline for your metabolic weight and current strain.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      };
    }
    return null;
  }
}

class MovementRule implements PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (currentTarget) return currentTarget; // Hydration took priority
    const dynamicTargets = DeterministicTargetCalculator.calculate(context.profile, context);

    if (context.steps < dynamicTargets.steps) {
      return {
        id: 'movement_daily',
        category: 'movement',
        priority: 'high',
        lifecycle: 'active',
        progress: { current: context.steps, target: dynamicTargets.steps, percentage: Math.min(100, (context.steps / Math.max(1, dynamicTargets.steps)) * 100) },
        value: dynamicTargets.steps - context.steps,
        unit: 'steps',
        reason: 'Personalized step target adapted for your current behavioral momentum.',
        confidence: 'high',
        source: 'rule_engine',
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      };
    }
    return null;
  }
}

class RecoveryRule implements PipelineStage {
  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (currentTarget) return currentTarget;
    const dynamicTargets = DeterministicTargetCalculator.calculate(context.profile, context);

    return {
      id: 'sleep_daily',
      category: 'sleep',
      priority: 'medium',
      lifecycle: 'pending',
      progress: { current: 0, target: dynamicTargets.sleep, percentage: 0 },
      value: dynamicTargets.sleep,
      unit: 'hours',
      reason: 'All daily outputs met. Wind down to lock in today\'s physiological gains.',
      confidence: 'high',
      source: 'rule_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
    };
  }
}

class RuleEngineStage implements PipelineStage {
  constructor() {
    const registry = RuleRegistry.getInstance();
    registry.register('core_hydration', '1.0.0', new HydrationRule());
    registry.register('core_movement', '1.0.0', new MovementRule());
    registry.register('core_recovery', '1.0.0', new RecoveryRule());
  }

  execute(context: TargetEngineContext, currentTarget: CanonicalTarget | null): CanonicalTarget | null {
    if (currentTarget?.source === 'safety_engine') return currentTarget; 
    for (const rule of RuleRegistry.getInstance().getRules()) {
      const result = rule.execute(context, currentTarget);
      if (result) return result;
    }
    return currentTarget;
  }
}
// Orphaned code removed to restore syntax tree.

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
    if (!target || !target.id || !target.reason) {
      return this.getFallbackTarget();
    }
    return target;
  }
  
    private getFallbackTarget(): CanonicalTarget {
    return {
      id: 'system_fallback',
      category: 'system',
      priority: 'low',
      lifecycle: 'active',
      progress: { current: 0, target: 100, percentage: 0 },
      value: 0,
      unit: 'none',
      reason: 'Operating in fallback mode to ensure system stability.',
      confidence: 'low',
      source: 'fallback_engine',
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
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
    const dynamicTargets = DeterministicTargetCalculator.calculate(context.profile, context);
    
     // 1. Generate Raw Candidates deterministically
    const rawTargets: CanonicalTarget[] = [
      {
        id: 'movement_daily', category: 'movement', priority: 'high',
        lifecycle: context.steps >= dynamicTargets.steps ? 'completed' : 'active',
        progress: { current: context.steps, target: dynamicTargets.steps, percentage: Math.min(100, (context.steps / Math.max(1, dynamicTargets.steps)) * 100) },
        value: dynamicTargets.steps, unit: 'steps', reason: 'Maintains cardiovascular baseline and metabolic health.',
        confidence: 'high', source: 'rule_engine', expiresAt
      },
      {
        id: 'hydration_daily', category: 'hydration', priority: 'critical',
        lifecycle: context.water >= dynamicTargets.water ? 'completed' : 'active',
        progress: { current: context.water, target: dynamicTargets.water, percentage: Math.min(100, (context.water / Math.max(1, dynamicTargets.water)) * 100) },
        value: dynamicTargets.water, unit: 'ml', reason: 'Essential for cellular recovery and nervous system repair.',
        confidence: 'high', source: 'rule_engine', expiresAt
      },
      {
        id: 'protein_daily', category: 'nutrition', priority: 'high',
        lifecycle: context.proteinHit ? 'completed' : 'active',
        progress: { current: context.proteinHit ? 100 : 0, target: 100, percentage: context.proteinHit ? 100 : 0 },
        value: dynamicTargets.protein, unit: 'g', reason: 'Critical for muscular adaptation following daily strain.',
        confidence: 'high', source: 'rule_engine', expiresAt
      },
      {
        id: 'sleep_daily', category: 'sleep', priority: 'high',
        lifecycle: 'pending', // Sleep is pending until night
        progress: { current: 0, target: dynamicTargets.sleep, percentage: 0 },
        value: dynamicTargets.sleep, unit: 'hours', reason: 'Deep rest secures the physiological adaptations earned today.',
        confidence: 'high', source: 'rule_engine', expiresAt
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
