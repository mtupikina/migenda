import { IsISO8601 } from 'class-validator';

export class MoveEventDto {
  @IsISO8601()
  occurrenceStart!: string;

  @IsISO8601()
  start!: string;
}
