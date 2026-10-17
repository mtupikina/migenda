import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { TeamsController } from './teams.controller';
import { TeamsModule } from './teams.module';

/** HTTP endpoints for teams. Separate from TeamsModule because AuthModule imports that one. */
@Module({
  imports: [AuthModule, TeamsModule],
  controllers: [TeamsController],
})
export class TeamsApiModule {}
