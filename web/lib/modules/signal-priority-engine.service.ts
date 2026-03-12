import { SignalInput } from '../models/signal-input.model';
import { SignalOutput } from '../models/signal-output.model';

export class SignalPriorityEngineService {
  process(signal: SignalInput): SignalOutput {
    const adjustedPriority = Math.min(Math.max(signal.priorityLevel, 1), 5);
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalPriorityEngine',
      status: 'PRIORITY_SET',
      result: `Priority normalized to ${adjustedPriority}`,
      priorityLevel: adjustedPriority,
      metadata: ['priority_engine_baseline', `level_${adjustedPriority}`],
      processedAt: new Date().toISOString(),
    };
  }
}
