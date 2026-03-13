/**
 * SignalInput — shared input model for all signal modules
 * Input definitions separated from service logic
 */
export interface SignalInput {
  id: string;
  signalType: string;
  signalCategory: string;
  signalSource: string;
  signalValue: string;
  priorityLevel: number;
  timestamp: string;
  version: number;
  isActive: boolean;
}
