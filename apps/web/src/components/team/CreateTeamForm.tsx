import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Text, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeamSchema, type CreateTeamInput } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { invalidateTeam } from '../../api/invalidateTeam';
import { createTeam } from '../../api/team';
import { dashboardFieldClassNames } from '../../classNames/shared';

export function CreateTeamForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: '' },
  });
  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: async () => {
      reset({ name: '' });
      await invalidateTeam(queryClient);
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Group align="flex-end" gap={12} wrap="nowrap">
        <TextInput
          label="Create a new team"
          placeholder="Team name"
          error={errors.name?.message}
          classNames={dashboardFieldClassNames}
          className="flex-1"
          {...register('name')}
        />
        <Button type="submit" variant="default" loading={mutation.isPending}>
          Create team
        </Button>
      </Group>
      <Text fz={14} mt={8} className="opacity-65">
        You will be its owner, and the app switches to it right away.
      </Text>
      {mutation.error instanceof ScheduleRequestError ? (
        <Text c="accent.7" fz={14} mt={8}>
          {mutation.error.message}
        </Text>
      ) : null}
    </form>
  );
}
