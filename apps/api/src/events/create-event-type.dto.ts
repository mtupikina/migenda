import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

import { EVENT_TYPE_COLORS } from '@migenda/shared';

const colorValues = EVENT_TYPE_COLORS.map((color) => color.value);

export class CreateEventTypeDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsIn(colorValues)
  color!: string;
}
