import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../auth/user.schema';
import { Membership, MembershipSchema } from './membership.schema';
import { Team, TeamSchema } from './team.schema';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
