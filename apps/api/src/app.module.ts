import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/migenda')],
  controllers: [AuthController],
})
export class AppModule {}
