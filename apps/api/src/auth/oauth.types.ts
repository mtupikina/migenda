export type OAuthProvider = 'google' | 'github';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
};
