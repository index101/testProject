/**
 * SignalOutput — shared output model for all signal modules
 * Output formatting separated from service logic
 */
export interface SignalOutput {
  id: string;
  inputSignalId: string;
  processedBy: string;
  status: string;
  result: string;
  priorityLevel: number;
  metadata: string[];
  processedAt: string;
}
