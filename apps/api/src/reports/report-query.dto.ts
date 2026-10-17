import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsMongoId, Max, Min } from 'class-validator';

import { REPORT_PAGE_SIZE_MAX } from '@migenda/shared';

export class ReportQueryDto {
  @IsMongoId()
  typeId!: string;

  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(REPORT_PAGE_SIZE_MAX)
  limit!: number;
}
