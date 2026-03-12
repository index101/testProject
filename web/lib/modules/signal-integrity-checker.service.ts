import { SignalInput } from '../models/signal-input.model';
import { SignalOutput } from '../models/signal-output.model';

export class SignalIntegrityCheckerService {
  process(signal: SignalInput): SignalOutput {
    const hasId = !!signal.id;
    const hasType = !!signal.signalType;
    const hasTimestamp = !!signal.timestamp;
    const valid = hasId && hasType && hasTimestamp;
    const status = valid ? 'INTEGRITY_OK' : 'INTEGRITY_FAILED';
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalIntegrityChecker',
      status,
      result: valid ? 'Integrity verified' : 'Integrity check failed',
      priorityLevel: signal.priorityLevel,
      metadata: ['integrity_checker_baseline', status],
      processedAt: new Date().toISOString(),
    };
  }
}
