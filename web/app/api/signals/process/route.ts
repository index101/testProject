import { NextRequest, NextResponse } from 'next/server';
import { SignalInput } from '@/lib/models/signal-input.model';
import {
  SignalRegistryService,
  SignalClassificationService,
  SignalPriorityEngineService,
  SignalWeightingService,
  SignalRoutingService,
  SignalConflictResolverService,
  SignalExpirationService,
  SignalSilenceFilterService,
  SignalEscalationService,
  SignalIntegrityCheckerService,
} from '@/lib/modules';

const MODULES: Record<string, (signal: SignalInput) => ReturnType<SignalRegistryService['process']>> = {
  SignalRegistry: (s) => new SignalRegistryService().process(s),
  SignalClassification: (s) => new SignalClassificationService().process(s),
  SignalPriorityEngine: (s) => new SignalPriorityEngineService().process(s),
  SignalWeighting: (s) => new SignalWeightingService().process(s),
  SignalRouting: (s) => new SignalRoutingService().process(s),
  SignalConflictResolver: (s) => new SignalConflictResolverService().process(s),
  SignalExpiration: (s) => new SignalExpirationService().process(s),
  SignalSilenceFilter: (s) => new SignalSilenceFilterService().process(s),
  SignalEscalation: (s) => new SignalEscalationService().process(s),
  SignalIntegrityChecker: (s) => new SignalIntegrityCheckerService().process(s),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signal, modules: requestedModules } = body as {
      signal: SignalInput;
      modules?: string[];
    };

    if (!signal) {
      return NextResponse.json(
        { error: 'Missing signal in request body' },
        { status: 400 }
      );
    }

    const modulesToRun = requestedModules?.length
      ? requestedModules.filter((m: string) => m in MODULES)
      : Object.keys(MODULES);

    const results: Record<string, unknown> = {};
    for (const name of modulesToRun) {
      const processor = MODULES[name];
      if (processor) {
        results[name] = processor(signal);
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Signal process error:', error);
    return NextResponse.json(
      { error: 'Failed to process signal' },
      { status: 500 }
    );
  }
}
