/**
 * Sample Signal — starter reference for execution proof
 * Input definitions separated from service logic
 */
import { SignalInput } from './models/signal-input.model';

export const sampleSignal: SignalInput = {
  id: crypto.randomUUID(),
  signalType: 'urgency_signal',
  signalCategory: 'routing',
  signalSource: 'country_relationship_layer',
  signalValue: 'medium',
  priorityLevel: 2,
  timestamp: new Date().toISOString(),
  version: 1,
  isActive: true,
};
