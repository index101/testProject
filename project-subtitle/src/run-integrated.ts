/**
 * Integrated execution: Signal chain → Video output
 * Produces 2 videos: low priority (slow pacing) vs high priority (fast pacing)
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IntegratedService } from './integration/integrated.service';
import * as path from 'path';

const createSignal = (overrides: Partial<{ priorityLevel: number; signalType: string }>) => ({
  id: crypto.randomUUID(),
  signalType: overrides.signalType ?? 'urgency_signal',
  signalCategory: 'routing',
  signalSource: 'country_relationship_layer',
  signalValue: 'medium',
  priorityLevel: overrides.priorityLevel ?? 2,
  timestamp: new Date().toISOString(),
  version: 1,
  isActive: true,
});

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const integrated = app.get(IntegratedService);
  const outputDir = path.join(process.cwd(), 'output');

  console.log('=== Integrated Pipeline: Signal → Video ===\n');

  // Video 1: Low priority (slow pacing, low intensity)
  console.log('1. Running with LOW priority (1)...');
  const lowResult = await integrated.run(
    outputDir,
    createSignal({ priorityLevel: 1 }),
    'video-low-priority.mp4',
  );
  console.log('   Video:', lowResult.videoPath);
  console.log('   Params:', JSON.stringify(lowResult.videoParams, null, 2));

  // Video 2: High priority (fast pacing, high intensity)
  console.log('\n2. Running with HIGH priority (5)...');
  const highResult = await integrated.run(
    outputDir,
    createSignal({ priorityLevel: 5 }),
    'video-high-priority.mp4',
  );
  console.log('   Video:', highResult.videoPath);
  console.log('   Params:', JSON.stringify(highResult.videoParams, null, 2));

  console.log('\n=== Integration complete ===');
  console.log('Compare video-low-priority.mp4 vs video-high-priority.mp4');
  console.log('Backend signal logic visibly affects: pacing, font size, routing label, intensity');
  console.log('Technical note:', highResult.technicalNotePath);

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
