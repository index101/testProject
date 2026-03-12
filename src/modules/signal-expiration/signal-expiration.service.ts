/**
 * SignalExpiration — Module 7
 * Pattern: input model → service logic → output object
 */
import { SignalInput } from '../../models/signal-input.model';
import { SignalOutput } from '../../models/signal-output.model';

export class SignalExpirationService {
  process(signal: SignalInput): SignalOutput {
    const signalDate = new Date(signal.timestamp);
    const now = new Date();
    const expired = now.getTime() - signalDate.getTime() > 86400000;
    const status = expired ? 'EXPIRED' : 'VALID';
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalExpiration',
      status,
      result: expired ? 'Signal expired' : 'Signal valid',
      priorityLevel: signal.priorityLevel,
      metadata: ['expiration_baseline', status],
      processedAt: new Date().toISOString(),
    };
  }
}
