// jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

function mapMessage(info: JsonWebTokenError): string {
  if (info.message.includes('malformed')) {
    return `token ผิด format`
  }

  if (info.message.includes('expired')) {
    return `token หมดอายุ`
  }

  return info.message
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log('err', err)
      console.log('info', info)
      throw new UnauthorizedException(mapMessage(info));
    }
    return user;
  }

}