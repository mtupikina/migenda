import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateEventDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  title!: string;

  @IsString()
  @MinLength(1)
  typeId!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value : ''))
  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsISO8601()
  start!: string;

  @IsISO8601()
  end!: string;

  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays!: number[];

  @ValidateIf((dto: CreateEventDto) => dto.until !== null)
  @IsOptional()
  @IsISO8601({ strict: true })
  until!: string | null;

  @IsString()
  @MinLength(1)
  timeZone!: string;

  @IsString()
  @MinLength(1)
  assigneeId!: string;
}
