import { SignalInput } from '../models/signal-input.model';
import { SignalOutput } from '../models/signal-output.model';

export class SignalWeightingService {
  process(signal: SignalInput): SignalOutput {
    const weight = signal.priorityLevel * 0.2;
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalWeighting',
      status: 'WEIGHTED',
      result: `Weight applied: ${weight.toFixed(2)}`,
      priorityLevel: signal.priorityLevel,
      metadata: ['weighting_baseline', `weight_${weight.toFixed(2)}`],
      processedAt: new Date().toISOString(),
    };
  }
}
