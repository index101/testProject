import { Module } from '@nestjs/common';
import { M1Module } from './milestones/m1/m1.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [M1Module, IntegrationModule],
})
export class AppModule {}
