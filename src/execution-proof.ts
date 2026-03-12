/**
 * Execution Proof — Step 9
 * Working proof for at least 3 modules: SignalRegistry, SignalPriorityEngine, SignalRouting
 * Expected result: working proof that the family is executable, not only declared
 */
import { sampleSignal } from './sample-signal';
import { SignalRegistryService } from './modules/signal-registry/signal-registry.service';
import { SignalPriorityEngineService } from './modules/signal-priority-engine/signal-priority-engine.service';
import { SignalRoutingService } from './modules/signal-routing/signal-routing.service';

function runExecutionProof(): void {
  console.log('=== Signal Intelligence Family — Execution Proof ===\n');
  console.log('Input (SignalInput):');
  console.log(JSON.stringify(sampleSignal, null, 2));
  console.log('\n--- Module 1: SignalRegistry ---');
  const registryService = new SignalRegistryService();
  const registryResult = registryService.process(sampleSignal);
  console.log('Output (SignalOutput):');
  console.log(JSON.stringify(registryResult, null, 2));
  console.log('\n--- Module 3: SignalPriorityEngine ---');
  const priorityService = new SignalPriorityEngineService();
  const priorityResult = priorityService.process(sampleSignal);
  console.log('Output (SignalOutput):');
  console.log(JSON.stringify(priorityResult, null, 2));
  console.log('\n--- Module 5: SignalRouting ---');
  const routingService = new SignalRoutingService();
  const routingResult = routingService.process(sampleSignal);
  console.log('Output (SignalOutput):');
  console.log(JSON.stringify(routingResult, null, 2));
  console.log('\n=== Execution proof complete ===');
}

runExecutionProof();
