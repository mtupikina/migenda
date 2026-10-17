import { userFullName, type User } from '@migenda/shared';

type Named = Pick<User, 'firstName' | 'lastName'>;

/** One or two capital letters to show inside an avatar. */
export function avatarInitials(person: Named): string {
  const first = person.firstName.trim().charAt(0);
  const last = person.lastName.trim().charAt(0);
  const initials = `${first}${last}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }
  return userFullName(person).charAt(0).toUpperCase() || '?';
}
