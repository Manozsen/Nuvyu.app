// 🧠 NUVYU AUTONOMOUS EXECUTION OPERATING SYSTEM (AEOS - PHASE 6)
// The master orchestration layer for behavioral lifecycle management and execution.

import { DomainEvent, BehavioralStateStore } from '../infrastructure/store';
import { CognitiveSnapshot, InterventionStrategy, TimeBlock } from '../intelligence/brain';

// ============================================================================
// 1. STRICT EXECUTION DOMAIN
// ============================================================================

export type WorkflowState = 'created' | 'scheduled' | 'waiting' | 'executing' | 'paused' | 'completed' | 'skipped' | 'failed' | 'expired' | 'archived';

export interface BehavioralWorkflow {
  id: string;
  targetDomain: string;
  state: WorkflowState;
  scheduledFor: number;
  expiresAt: number;
  retryCount: number;
  actionInstruction: string;
  empatheticContext: string;
}

export interface ExecutionMetrics {
  successRate: number;
  completionRate: number;
  skippedBehaviors: number;
  retryFrequency: number;
  executionConfidence: number;
  behaviorStability: number;
}

// ============================================================================
// 2. LIFECYCLE ENGINE (Event-Driven State Machine)
// ============================================================================
export class LifecycleEngine {
  static transition(workflow: BehavioralWorkflow, targetState: WorkflowState, payload?: unknown): BehavioralWorkflow {
    // Validates allowed transitions (e.g., Cannot go from 'completed' to 'executing')
    const terminalStates = ['completed', 'failed', 'expired', 'archived'];
    if (terminalStates.includes(workflow.state)) {
      console.warn(`[LifecycleEngine] Workflow ${workflow.id} is terminal. Cannot transition to ${targetState}.`);
      return workflow;
    }

    const updated = { ...workflow, state: targetState };
    
    // Publish Domain Event
    const eventMap: Record<string, DomainEvent['type']> = {
      'executing': 'ExecutionStarted',
      'paused': 'ExecutionPaused',
      'completed': 'ExecutionCompleted',
      'failed': 'ExecutionFailed',
      'expired': 'WorkflowExpired'
    };

    if (eventMap[targetState]) {
      BehavioralStateStore.dispatch({ type: eventMap[targetState], payload: { id: workflow.id, ...updated, meta: payload }, timestamp: Date.now() });
    }

    return updated;
  }
}

// ============================================================================
// 3. ADAPTIVE SCHEDULER
// ============================================================================
export class AdaptiveScheduler {
  static schedule(blocks: TimeBlock[], snapshot: CognitiveSnapshot): BehavioralWorkflow[] {
    const workflows: BehavioralWorkflow[] = [];
    const now = Date.now();
    const isExhausted = snapshot.velocity.systemicStrain > 0.7;

    blocks.forEach((block, index) => {
      // Dynamic temporal shifting based on human physiology
      let delayHours = index * 4; 
      if (isExhausted && block.flexibility === 'fluid') delayHours += 2; // Shift loads later to allow nervous system recovery

      workflows.push({
        id: `workflow_${block.window}_${now}`,
        targetDomain: block.action,
        state: 'scheduled',
        scheduledFor: now + (delayHours * 3600000),
        expiresAt: now + (24 * 3600000),
        retryCount: 0,
        actionInstruction: block.action,
        empatheticContext: '' // Hydrated by Notification Orchestrator
      });
    });

    return workflows;
  }
}

// ============================================================================
// 4. NOTIFICATION ORCHESTRATOR (Human Language Directive Enforced)
// ============================================================================
export class NotificationOrchestrator {
  private static activeNotifications: Set<string> = new Set();

  static generatePremiumCopy(strategy: InterventionStrategy): string {
    // Calm, expert, trusted companion routing. Zero generic hype.
    const copyMap: Record<string, string[]> = {
      'physiological_rest': [
        "Your central nervous system needs time to repair. I've paused today's intensity. Let's focus on deep rest tonight.",
        "System strain is elevated. Stepping back today is the mathematically correct decision for your long-term momentum.",
        "Your body is asking for recovery. Honor the baseline today with hydration and sleep."
      ],
      'micro_friction': [
        "Friction is a bit high today. Let's secure one small win to protect your baseline.",
        "Momentum is built in the margins. A single glass of water right now keeps the system moving.",
        "We've reduced today's load. Focus entirely on completing this one micro-action."
      ],
      'momentum_push': [
        "Your physiology is primed. Let's execute today's targets and compound this momentum.",
        "All systems optimal. A strong execution today secures tomorrow's baseline.",
        "You've built excellent stability. Let's maintain the standard."
      ]
    };

    const options = copyMap[strategy.type] || copyMap['momentum_push'];
    return options[Math.floor(Math.random() * options.length)];
  }

  static queue(workflow: BehavioralWorkflow, strategy: InterventionStrategy) {
    // Deduplication & Suppression
    if (this.activeNotifications.size > 2) return; // Prevent alert fatigue
    if (this.activeNotifications.has(workflow.targetDomain)) return;

    const copy = this.generatePremiumCopy(strategy);
    workflow.empatheticContext = copy;

    BehavioralStateStore.dispatch({ 
      type: 'NotificationQueued', 
      payload: { id: workflow.id, message: copy, urgency: strategy.urgency }, 
      timestamp: Date.now() 
    });

    this.activeNotifications.add(workflow.targetDomain);
  }
}

// ============================================================================
// 5. EXECUTION TRACKER & ANALYTICS
// ============================================================================
export class ExecutionTracker {
  private static history: BehavioralWorkflow[] = [];

  static log(workflow: BehavioralWorkflow) {
    this.history.push(workflow);
  }

  static generateAnalytics(): ExecutionMetrics {
    const total = this.history.length || 1;
    const completed = this.history.filter(w => w.state === 'completed').length;
    const skipped = this.history.filter(w => w.state === 'skipped').length;

    return {
      successRate: completed / total,
      completionRate: completed / total,
      skippedBehaviors: skipped,
      retryFrequency: this.history.reduce((acc, curr) => acc + current.retryCount, 0) / total,
      executionConfidence: (completed / total) > 0.8 ? 0.9 : 0.5,
      behaviorStability: completed > skipped ? 0.8 : 0.3
    };
  }
}

// ============================================================================
// 6. REFLECTION ENGINE
// ============================================================================
export class ReflectionEngine {
  static analyzeDay(metrics: ExecutionMetrics, snapshot: CognitiveSnapshot): string {
    BehavioralStateStore.dispatch({ type: 'ReflectionCompleted', payload: metrics, timestamp: Date.now() });

    // Premium, non-judgmental behavioral analysis
    if (metrics.successRate > 0.8) {
      return "Your consistency today built meaningful momentum. Your system handled the load perfectly.";
    } else if (snapshot.velocity.systemicStrain > 0.6) {
      return "Today's friction was higher than usual, likely driven by underlying systemic strain. We've adjusted tomorrow's baseline to protect your adherence. Rest well.";
    } else {
      return "Execution was fragmented today. We'll optimize tomorrow's schedule to lower behavioral friction and secure a win.";
    }
  }
}

// ============================================================================
// 7. EXECUTION COORDINATOR
// ============================================================================
export class ExecutionCoordinator {
  private static activeWorkflows: Map<string, BehavioralWorkflow> = new Map();

  static initialize(workflows: BehavioralWorkflow[], snapshot: CognitiveSnapshot) {
    workflows.forEach(workflow => {
      if (!this.activeWorkflows.has(workflow.id)) {
        this.activeWorkflows.set(workflow.id, workflow);
        LifecycleEngine.transition(workflow, 'waiting');
        NotificationOrchestrator.queue(workflow, snapshot.strategy);
      }
    });
  }

  static processAction(workflowId: string, action: 'start' | 'complete' | 'pause' | 'skip') {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    const stateMap: Record<string, WorkflowState> = {
      'start': 'executing',
      'complete': 'completed',
      'pause': 'paused',
      'skip': 'skipped'
    };

    const updated = LifecycleEngine.transition(workflow, stateMap[action]);
    this.activeWorkflows.set(workflowId, updated);
    ExecutionTracker.log(updated);
  }
}

// ============================================================================
// 8. MASTER OPERATING SYSTEM COORDINATOR
// ============================================================================
export class OperatingSystemCoordinator {
  /**
   * The master lifecycle loop of the Behavioral OS.
   * Executes: Context -> Decision -> Brain -> Scheduler -> Execution -> Store
   */
  static async executeCycle(snapshot: CognitiveSnapshot, timeBlocks: TimeBlock[]) {
    try {
      // 1. Adaptive Scheduling
      const workflows = AdaptiveScheduler.schedule(timeBlocks, snapshot);

      // 2. Execution Coordination
      ExecutionCoordinator.initialize(workflows, snapshot);

      // 3. Analytics & Reflection (Triggered if end of day)
      const hour = new Date(snapshot.timestamp).getHours();
      if (hour >= 22) {
        const metrics = ExecutionTracker.generateAnalytics();
        const insight = ReflectionEngine.analyzeDay(metrics, snapshot);
        
        BehavioralStateStore.dispatch({ 
          type: 'MemoryUpdated', 
          payload: { eodInsight: insight, metrics }, 
          timestamp: Date.now() 
        });
      }

      return workflows;
    } catch (e) {
      console.error("[OS_Coordinator] Execution cycle failed.", e);
      throw e;
    }
  }
}
