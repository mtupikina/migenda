import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Text, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renameTeamSchema, type RenameTeamInput, type Team } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { renameTeam } from '../../api/team';
import { dashboardFieldClassNames } from '../../classNames/shared';

type TeamNameFormProps = {
  team: Team;
};

export function TeamNameForm({ team }: TeamNameFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RenameTeamInput>({
    resolver: zodResolver(renameTeamSchema),
    defaultValues: { name: team.name },
  });
  const mutation = useMutation({
    mutationFn: renameTeam,
    onSuccess: (updated) => {
      queryClient.setQueryData(['team'], updated);
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
      reset({ name: updated.name });
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Group align="flex-end" gap={12} wrap="nowrap">
        <TextInput
          label="Team name"
          error={errors.name?.message}
          classNames={dashboardFieldClassNames}
          className="flex-1"
          {...register('name')}
        />
        <Button type="submit" variant="default" disabled={!isDirty} loading={mutation.isPending}>
          Save name
        </Button>
      </Group>
      {mutation.error instanceof ScheduleRequestError ? (
        <Text c="accent.7" fz={14} mt={8}>
          {mutation.error.message}
        </Text>
      ) : null}
    </form>
  );
}
