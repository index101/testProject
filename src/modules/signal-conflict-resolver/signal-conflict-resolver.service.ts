/**
 * SignalConflictResolver — Module 6
 * Pattern: input model → service logic → output object
 */
import { SignalInput } from '../../models/signal-input.model';
import { SignalOutput } from '../../models/signal-output.model';

export class SignalConflictResolverService {
  process(signal: SignalInput): SignalOutput {
    const resolved = signal.isActive ? 'CONFLICT_RESOLVED' : 'CONFLICT_DEACTIVATED';
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalConflictResolver',
      status: resolved,
      result: `Signal ${signal.id} conflict resolved`,
      priorityLevel: signal.priorityLevel,
      metadata: ['conflict_resolver_baseline', resolved],
      processedAt: new Date().toISOString(),
    };
  }
}
