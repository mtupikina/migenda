import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Text, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteMemberSchema, type InviteMemberInput } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { inviteMember } from '../../api/team';
import { dashboardFieldClassNames } from '../../classNames/shared';

export function InviteMemberForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: async () => {
      reset({ email: '' });
      await queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
  const invitedEmail = mutation.isSuccess ? mutation.variables.email : null;

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Group align="flex-end" gap={12} wrap="nowrap">
        <TextInput
          label="Add a member by email"
          placeholder="teammate@company.com"
          error={errors.email?.message}
          classNames={dashboardFieldClassNames}
          className="flex-1"
          {...register('email')}
        />
        <Button type="submit" loading={mutation.isPending}>
          Add member
        </Button>
      </Group>
      {mutation.error instanceof ScheduleRequestError ? (
        <Text c="accent.7" fz={14} mt={8}>
          {mutation.error.message}
        </Text>
      ) : null}
      {invitedEmail ? (
        <Text fz={14} mt={8} className="opacity-65">
          Invite sent to {invitedEmail}. They can accept it on their Team page.
        </Text>
      ) : null}
    </form>
  );
}
