import { IsISO8601, IsOptional, MaxLength } from 'class-validator';

export class CreateTimeBlockDto {
  @IsISO8601()
  start!: string;

  @IsISO8601()
  end!: string;

  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
