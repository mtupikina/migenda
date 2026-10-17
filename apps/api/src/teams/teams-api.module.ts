import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/user.schema';
import { Invite, InviteSchema } from './invite.schema';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { Team, TeamSchema } from './team.schema';
import { TeamsController } from './teams.controller';
import { TeamsModule } from './teams.module';

/** HTTP endpoints for teams. Separate from TeamsModule because AuthModule imports that one. */
@Module({
  imports: [
    AuthModule,
    TeamsModule,
    MongooseModule.forFeature([
      { name: Invite.name, schema: InviteSchema },
      { name: Team.name, schema: TeamSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TeamsController, InvitesController],
  providers: [InvitesService],
})
export class TeamsApiModule {}
