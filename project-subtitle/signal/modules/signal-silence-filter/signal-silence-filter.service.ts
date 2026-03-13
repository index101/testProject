/**
 * SignalSilenceFilter — Module 8
 * Pattern: input model → service logic → output object
 */
import { SignalInput } from '../../models/signal-input.model';
import { SignalOutput } from '../../models/signal-output.model';

export class SignalSilenceFilterService {
  process(signal: SignalInput): SignalOutput {
    const silenced = !signal.isActive || signal.signalValue === 'silent';
    const status = silenced ? 'SILENCED' : 'PASSED';
    return {
      id: crypto.randomUUID(),
      inputSignalId: signal.id,
      processedBy: 'SignalSilenceFilter',
      status,
      result: silenced ? 'Signal filtered' : 'Signal passed filter',
      priorityLevel: signal.priorityLevel,
      metadata: ['silence_filter_baseline', status],
      processedAt: new Date().toISOString(),
    };
  }
}
