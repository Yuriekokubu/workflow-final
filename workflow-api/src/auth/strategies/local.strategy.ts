import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoggedInDto } from '../dto/logged-in.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

  constructor(private authService: AuthService) {
      super()
  }

  // validate
  async validate(username: string, password: string): Promise<LoggedInDto> {
    const loggedIn = await this.authService.validateUser(username, password)
    if (!loggedIn) {
        throw new UnauthorizedException(`username: ${username}`);
    }
    return loggedIn
  }
}