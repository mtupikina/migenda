export type OAuthProvider = 'google' | 'github';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  /** Single string from the provider; split into firstName / lastName when creating a user. */
  displayName: string;
};
