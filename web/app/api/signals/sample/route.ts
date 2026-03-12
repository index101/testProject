import { NextResponse } from 'next/server';
import { SignalInput } from '@/lib/models/signal-input.model';

export async function GET() {
  const sampleSignal: SignalInput = {
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
  return NextResponse.json(sampleSignal);
}
