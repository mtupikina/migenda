import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { SESSION_COOKIE } from './auth.constants';

export function optionalSessionId(req: Request): string | undefined {
  return req.cookies?.[SESSION_COOKIE] as string | undefined;
}

export function sessionId(req: Request): string {
  const sid = optionalSessionId(req);
  if (!sid) {
    throw new UnauthorizedException();
  }
  return sid;
}
