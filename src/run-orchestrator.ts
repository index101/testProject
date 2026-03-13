/**
 * Execution Proof — Full module chain
 * SignalInput → Registry → Classification → Priority → ... → SignalOutput
 */
import { sampleSignal } from './sample-signal';
import { SignalOrchestrator } from './orchestrator/signal-orchestrator';

function run(): void {
  console.log('=== Signal Pipeline — Full Chain Execution ===\n');

  const orchestrator = new SignalOrchestrator();
  const result = orchestrator.run(sampleSignal);

  console.log('INPUT (SignalInput):');
  console.log(JSON.stringify(result.input, null, 2));
  console.log('\n--- CHAIN EXECUTION ---\n');

  for (const name of result.chainOrder) {
    const out = result.outputs[name];
    console.log(`${name}:`);
    console.log(`  status: ${out.status}`);
    console.log(`  result: ${out.result}`);
    console.log(`  priorityLevel: ${out.priorityLevel}`);
    console.log('');
  }

  console.log('--- FINAL OUTPUT (SignalOutput) ---');
  console.log(JSON.stringify(result.finalOutput, null, 2));
  console.log('\n=== Chain execution complete ===');
}

run();
