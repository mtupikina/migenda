export type LandingVisitor = 'pending' | 'guest' | 'member';

export function landingVisitor(session: { isPending: boolean; isSuccess: boolean }): LandingVisitor {
  if (session.isPending) {
    return 'pending';
  }
  if (session.isSuccess) {
    return 'member';
  }
  return 'guest';
}
