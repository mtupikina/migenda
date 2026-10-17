import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;

  /** `me` (default), `all`, or the id of a member of the active team. */
  @IsOptional()
  @IsString()
  assignee?: string;
}
