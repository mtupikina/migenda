import { Transform } from 'class-transformer';
import {
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { isEventTypeColor } from '@migenda/shared';

@ValidatorConstraint({ name: 'eventTypeColor', async: false })
class EventTypeColorRule implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'string' && isEventTypeColor(value);
  }

  defaultMessage() {
    return 'Choose a color';
  }
}

export class CreateEventTypeDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name!: string;

  @IsString()
  @Validate(EventTypeColorRule)
  color!: string;
}
