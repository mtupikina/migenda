import { TEAM_NAME_MAX } from '@migenda/shared';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RenameTeamDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(TEAM_NAME_MAX)
  name!: string;
}
