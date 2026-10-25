import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { ColorPicker, Stack, Text, TextInput } from '@mantine/core';
import {
  EVENT_TYPE_COLORS,
  eventTypeColorForPicker,
  type CreateEventTypeInput,
} from '@migenda/shared';

import { dashboardFieldClassNames, eventTypeColorPickerClassNames } from '../../classNames/shared';

type EventTypeFieldsProps = {
  register: UseFormRegister<CreateEventTypeInput>;
  control: Control<CreateEventTypeInput>;
  errors: FieldErrors<CreateEventTypeInput>;
};

export function EventTypeFields({ register, control, errors }: EventTypeFieldsProps) {
  return (
    <>
      <TextInput
        label="Name"
        placeholder="e.g. Field trip"
        error={errors.name?.message}
        classNames={dashboardFieldClassNames}
        {...register('name')}
      />
      <Controller
        name="color"
        control={control}
        render={({ field }) => (
          <Stack gap={8}>
            <Text component="label" className={dashboardFieldClassNames.label}>
              Select color
            </Text>
            <ColorPicker
              format="hex"
              fullWidth
              size="sm"
              saturationLabel="Saturation and brightness"
              hueLabel="Hue"
              value={eventTypeColorForPicker(field.value)}
              onChange={field.onChange}
              swatches={EVENT_TYPE_COLORS.map((color) => color.hex)}
              swatchesPerRow={10}
              classNames={eventTypeColorPickerClassNames}
            />
            {errors.color?.message ? (
              <Text c="accent.7" fz={12}>
                {errors.color.message}
              </Text>
            ) : null}
          </Stack>
        )}
      />
    </>
  );
}
