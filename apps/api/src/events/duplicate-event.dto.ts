import { IsISO8601 } from 'class-validator';

export class DuplicateEventDto {
  @IsISO8601()
  occurrenceStart!: string;

  @IsISO8601()
  occurrenceEnd!: string;
}
