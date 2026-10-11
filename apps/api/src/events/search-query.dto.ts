import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { SEARCH_QUERY_MAX } from '@migenda/shared';

export class SearchQueryDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value : ''))
  @IsOptional()
  @IsString()
  @MaxLength(SEARCH_QUERY_MAX)
  q?: string;

  @IsISO8601()
  from!: string;
}
