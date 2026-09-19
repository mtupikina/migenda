import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() req: Request) {
    const sid = req.cookies?.sid;
    if (!sid) {
      throw new UnauthorizedException();
    }
    throw new UnauthorizedException();
  }
}
