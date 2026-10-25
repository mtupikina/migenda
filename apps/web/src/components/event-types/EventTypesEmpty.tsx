import { Button, Stack, Text } from '@mantine/core';
import { Tags } from 'lucide-react';

import { dashboardPanelClassName } from '../../classNames/shared';

type EventTypesEmptyProps = {
  onAdd: () => void;
};

export function EventTypesEmpty({ onAdd }: EventTypesEmptyProps) {
  return (
    <div
      className={`${dashboardPanelClassName} flex flex-col items-center justify-center gap-4 px-8 py-16 text-center`}
    >
      <Tags aria-hidden size={72} strokeWidth={1.5} className="opacity-35" />
      <Stack gap={8} maw="42ch">
        <Text className="text-[20px] font-extrabold leading-tight">No types yet</Text>
        <Text className="text-[14px] opacity-65">
          Add a type here, or create one when you add your first event.
        </Text>
      </Stack>
      <Button onClick={onAdd}>Add type</Button>
    </div>
  );
}
