import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '../../api/auth';
import { ResetPasswordRequestView } from './ResetPasswordRequestView';
import { ResetPasswordSuccessView } from './ResetPasswordSuccessView';

export function ResetPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (_data, variables) => {
      setSubmittedEmail(variables.email);
    },
  });

  if (submittedEmail) {
    return <ResetPasswordSuccessView email={submittedEmail} />;
  }

  return (
    <ResetPasswordRequestView
      loading={mutation.isPending}
      error={mutation.isError}
      onSubmit={(email) => mutation.mutate({ email: email.trim().toLowerCase() })}
    />
  );
}
