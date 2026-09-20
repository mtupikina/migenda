import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { env } from './env';

@Module({
  imports: [
    MongooseModule.forRoot(env.mongodbUri),
    AuthModule,
  ],
})
export class AppModule {}
