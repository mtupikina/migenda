import { env } from '../env';
import type { OAuthProvider, OAuthProfile } from './oauth.types';

export class OAuthError extends Error {
  constructor(
    readonly code: 'unavailable' | 'denied' | 'failed' | 'missing_email',
    message: string,
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

export function oauthCallbackUrl(provider: OAuthProvider) {
  return `${env.webOrigin}/auth/${provider}/callback`;
}

export function isOAuthConfigured(provider: OAuthProvider) {
  if (provider === 'google') {
    return Boolean(env.googleClientId && env.googleClientSecret);
  }
  return Boolean(env.githubClientId && env.githubClientSecret);
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string) {
  if (!isOAuthConfigured(provider)) {
    throw new OAuthError('unavailable', `${provider} login is not configured`);
  }

  const redirectUri = oauthCallbackUrl(provider);

  if (provider === 'google') {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', env.googleClientId ?? '');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'select_account');
    return url.toString();
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.githubClientId ?? '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'user:email');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function fetchOAuthProfile(
  provider: OAuthProvider,
  code: string,
): Promise<OAuthProfile> {
  if (!isOAuthConfigured(provider)) {
    throw new OAuthError('unavailable', `${provider} login is not configured`);
  }

  if (provider === 'google') {
    return fetchGoogleProfile(code);
  }
  return fetchGithubProfile(code);
}

async function fetchGoogleProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId ?? '',
      client_secret: env.googleClientSecret ?? '',
      redirect_uri: oauthCallbackUrl('google'),
      grant_type: 'authorization_code',
    }),
  });
  const tokenBody = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) {
    throw new OAuthError('failed', 'Google token exchange failed');
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });
  const profile = (await profileResponse.json()) as {
    id?: string;
    email?: string;
    name?: string;
  };
  if (!profileResponse.ok || !profile.id) {
    throw new OAuthError('failed', 'Google profile fetch failed');
  }
  if (!profile.email) {
    throw new OAuthError('missing_email', 'Google did not return an email');
  }

  return {
    provider: 'google',
    providerId: profile.id,
    email: profile.email,
    name: profile.name?.trim() || profile.email,
  };
}

async function fetchGithubProfile(code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: oauthCallbackUrl('github'),
    }),
  });
  const tokenBody = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) {
    throw new OAuthError('failed', 'GitHub token exchange failed');
  }

  const headers = {
    Authorization: `Bearer ${tokenBody.access_token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MiGenda',
  };

  const profileResponse = await fetch('https://api.github.com/user', { headers });
  const profile = (await profileResponse.json()) as {
    id?: number;
    login?: string;
    name?: string;
    email?: string | null;
  };
  if (!profileResponse.ok || profile.id == null) {
    throw new OAuthError('failed', 'GitHub profile fetch failed');
  }

  let email = profile.email?.trim() ?? '';
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', { headers });
    const emails = (await emailsResponse.json()) as Array<{
      email?: string;
      primary?: boolean;
      verified?: boolean;
    }>;
    const primary = Array.isArray(emails)
      ? emails.find((item) => item.primary && item.verified) ?? emails.find((item) => item.verified)
      : undefined;
    email = primary?.email?.trim() ?? '';
  }

  if (!email) {
    throw new OAuthError('missing_email', 'GitHub did not return an email');
  }

  return {
    provider: 'github',
    providerId: String(profile.id),
    email,
    name: profile.name?.trim() || profile.login || email,
  };
}
