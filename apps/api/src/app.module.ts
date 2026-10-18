import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { env } from './env';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { ReportsModule } from './reports/reports.module';
import { TeamsApiModule } from './teams/teams-api.module';

@Module({
  imports: [
    MongooseModule.forRoot(env.mongodbUri),
    AuthModule,
    EventsModule,
    HealthModule,
    ReportsModule,
    TeamsApiModule,
  ],
})
export class AppModule {}
