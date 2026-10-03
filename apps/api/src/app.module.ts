import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { env } from './env';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    MongooseModule.forRoot(env.mongodbUri),
    AuthModule,
    EventsModule,
  ],
})
export class AppModule {}
