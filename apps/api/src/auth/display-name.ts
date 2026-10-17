import { userFullName } from '@migenda/shared';

type Nameable = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
};

export function displayName(user: Nameable): string {
  const name = userFullName({ firstName: user.firstName ?? '', lastName: user.lastName ?? '' });
  if (name) {
    return name;
  }
  return user.email;
}
