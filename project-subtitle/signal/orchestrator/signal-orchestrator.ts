/**
 * Signal Orchestrator — Full execution chain
 * Input → Registry → Classification → Priority → Weighting → Routing →
 * Conflict Resolution → Expiration → Silence Filter → Escalation → Integrity Check → Final Output
 */
import { SignalInput } from '../models/signal-input.model';
import { SignalOutput } from '../models/signal-output.model';
import { SignalRegistryService } from '../modules/signal-registry/signal-registry.service';
import { SignalClassificationService } from '../modules/signal-classification/signal-classification.service';
import { SignalPriorityEngineService } from '../modules/signal-priority-engine/signal-priority-engine.service';
import { SignalWeightingService } from '../modules/signal-weighting/signal-weighting.service';
import { SignalRoutingService } from '../modules/signal-routing/signal-routing.service';
import { SignalConflictResolverService } from '../modules/signal-conflict-resolver/signal-conflict-resolver.service';
import { SignalExpirationService } from '../modules/signal-expiration/signal-expiration.service';
import { SignalSilenceFilterService } from '../modules/signal-silence-filter/signal-silence-filter.service';
import { SignalEscalationService } from '../modules/signal-escalation/signal-escalation.service';
import { SignalIntegrityCheckerService } from '../modules/signal-integrity-checker/signal-integrity-checker.service';

export interface PipelineResult {
  input: SignalInput;
  outputs: Record<string, SignalOutput>;
  finalOutput: SignalOutput;
  chainOrder: string[];
}

const CHAIN_ORDER = [
  'SignalRegistry',
  'SignalClassification',
  'SignalPriorityEngine',
  'SignalWeighting',
  'SignalRouting',
  'SignalConflictResolver',
  'SignalExpiration',
  'SignalSilenceFilter',
  'SignalEscalation',
  'SignalIntegrityChecker',
] as const;

export class SignalOrchestrator {
  private readonly registry = new SignalRegistryService();
  private readonly classification = new SignalClassificationService();
  private readonly priorityEngine = new SignalPriorityEngineService();
  private readonly weighting = new SignalWeightingService();
  private readonly routing = new SignalRoutingService();
  private readonly conflictResolver = new SignalConflictResolverService();
  private readonly expiration = new SignalExpirationService();
  private readonly silenceFilter = new SignalSilenceFilterService();
  private readonly escalation = new SignalEscalationService();
  private readonly integrityChecker = new SignalIntegrityCheckerService();

  run(signal: SignalInput): PipelineResult {
    const outputs: Record<string, SignalOutput> = {};
    let runningSignal: SignalInput = { ...signal };

    const registryOut = this.registry.process(runningSignal);
    outputs['SignalRegistry'] = registryOut;

    const classificationOut = this.classification.process(runningSignal);
    outputs['SignalClassification'] = classificationOut;

    const priorityOut = this.priorityEngine.process(runningSignal);
    outputs['SignalPriorityEngine'] = priorityOut;
    runningSignal = { ...runningSignal, priorityLevel: priorityOut.priorityLevel };

    const weightingOut = this.weighting.process(runningSignal);
    outputs['SignalWeighting'] = weightingOut;

    const routingOut = this.routing.process(runningSignal);
    outputs['SignalRouting'] = routingOut;

    const conflictOut = this.conflictResolver.process(runningSignal);
    outputs['SignalConflictResolver'] = conflictOut;

    const expirationOut = this.expiration.process(runningSignal);
    outputs['SignalExpiration'] = expirationOut;

    const silenceOut = this.silenceFilter.process(runningSignal);
    outputs['SignalSilenceFilter'] = silenceOut;

    const escalationOut = this.escalation.process(runningSignal);
    outputs['SignalEscalation'] = escalationOut;

    const integrityOut = this.integrityChecker.process(runningSignal);
    outputs['SignalIntegrityChecker'] = integrityOut;

    return {
      input: signal,
      outputs,
      finalOutput: integrityOut,
      chainOrder: [...CHAIN_ORDER],
    };
  }
}
