// oauth2.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { LoggedInDto } from '../dto/logged-in.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: configService.get('OAUTH2_AUTH_URL'),
      tokenURL: configService.get('OAUTH2_TOKEN_URL'),
      clientID: configService.get('OAUTH2_CLIENT_ID'),
      clientSecret: configService.get('OAUTH2_CLIENT_SECRET'),
      callbackURL: configService.get('OAUTH2_CALLBACK_URL'),
      scope: configService.get('OAUTH2_SCOPE'),
    });
  }

  // validate
  async validate(
    accessToken: string,
    refreshToken: string
  ): Promise<LoggedInDto> {
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    return this.authService.validateUserByAccessToken(accessToken);
  }
}
