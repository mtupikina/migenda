import { Transform } from 'class-transformer';
import { IsISO8601, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventNoteDto {
  @IsISO8601()
  occurrenceStart!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text!: string;
}
