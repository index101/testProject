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
