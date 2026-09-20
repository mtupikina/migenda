import { CookieOptions, Response } from 'express';

import { env } from '../env';
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MS, SESSION_COOKIE } from './auth.constants';

function baseCookie(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
  };
}

export function setSessionCookie(res: Response, sid: string, maxAge?: number) {
  res.cookie(SESSION_COOKIE, sid, {
    ...baseCookie(),
    ...(maxAge ? { maxAge } : {}),
  });
}

export function setOAuthStateCookie(res: Response, state: string) {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    ...baseCookie(),
    maxAge: OAUTH_STATE_MS,
  });
}

export function clearOAuthStateCookie(res: Response) {
  res.clearCookie(OAUTH_STATE_COOKIE, baseCookie());
}
