import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { M1Service } from './milestones/m1/m1.service';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const m1 = app.get(M1Service);

  const outputDir = path.join(process.cwd(), 'output');
  console.log('M1: Running pipeline...');
  const delivery = await m1.run(outputDir);

  console.log('\nM1 DELIVERY COMPLETE');
  console.log('-------------------');
  console.log('Video:', delivery.videoPath);
  console.log('SRT:', delivery.srtPath);
  console.log('Technical note:', delivery.technicalNotePath);
  console.log('\nFiles created:', delivery.filesCreated.length);

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
