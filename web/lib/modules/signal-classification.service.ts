import { SignalInput } from '../models/signal-input.model';
import { SignalOutput } from '../models/signal-output.model';

export class SignalClassificationService {
  process(signal: SignalInput): SignalOutput {
    const classification = `${signal.signalType}:${signal.signalCategory}`;
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalClassification',
      status: 'CLASSIFIED',
      result: classification,
      priorityLevel: signal.priorityLevel,
      metadata: ['classification_baseline', signal.signalCategory],
      processedAt: new Date().toISOString(),
    };
  }
}
