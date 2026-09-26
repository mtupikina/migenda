import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordReset, PasswordResetSchema } from './password-reset.schema';
import { Session, SessionSchema } from './session.schema';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
