import { IsString, MinLength } from 'class-validator';

export class SetActiveTeamDto {
  @IsString()
  @MinLength(1)
  teamId!: string;
}
