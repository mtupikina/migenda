import { IsISO8601 } from 'class-validator';

export class CompleteEventDto {
  @IsISO8601()
  occurrenceStart!: string;
}
