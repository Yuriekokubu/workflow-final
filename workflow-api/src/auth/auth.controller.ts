import { Controller, Get, Post, Request, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoggedInDto } from './dto/logged-in.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { PerfLoggerInterceptor } from 'src/interceptors/perf-logger.interceptor';
import { Oauth2AuthGuard } from './guards/oauth2-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(PerfLoggerInterceptor)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() request: { user: LoggedInDto }) {
    return this.authService.login(request.user);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refreshToken(@Request() request: { user: LoggedInDto }) {
    return this.authService.refreshToken(request.user);
  }

  @Get('login-oauth2-redirect-url')
  loginOauth2RedirectUrl(): { redirectUrl: string } {
    return { redirectUrl: this.authService.getOauth2RedirectUrl() };
  }

  @Post('login-oauth2')
  async loginKeycloak(@Body('code') code: string) {
    // Exchange authorization code for tokens (Keycloak)
    const tokens = await this.authService.exchangeCodeForTokens(code);
    
    // Validate user by Keycloak access token
    const user = await this.authService.validateUserByAccessToken(tokens.access_token);
    
    // If user is valid, issue your own access and refresh tokens (local JWTs)
    if (user) {
      const localTokens = this.authService.login(user);  // Create local JWT tokens
      return localTokens;  // Return your application's tokens
    } else {
      throw new Error('User validation failed');
    }
  }
}
