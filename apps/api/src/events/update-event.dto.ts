import { IsISO8601, IsOptional } from 'class-validator';

import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends CreateEventDto {
  @IsOptional()
  @IsISO8601()
  occurrenceStart?: string;
}
