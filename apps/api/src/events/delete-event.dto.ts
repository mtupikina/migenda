import { IsIn, IsISO8601 } from 'class-validator';

export class DeleteEventDto {
  @IsISO8601()
  occurrenceStart!: string;

  @IsIn(['one', 'following', 'series'])
  scope!: 'one' | 'following' | 'series';
}
