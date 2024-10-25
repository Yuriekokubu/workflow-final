import { Controller, Get, Post, Request, UseGuards, UseInterceptors, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoggedInDto } from './dto/logged-in.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { PerfLoggerInterceptor } from 'src/interceptors/perf-logger.interceptor';
import { Oauth2AuthGuard } from './guards/oauth2-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
    try {
      // Log the received authorization code
      console.log(`Received authorization code: ${code}`);

      // Exchange authorization code for Keycloak tokens
      const tokens = await this.authService.exchangeCodeForTokens(code);
      console.log('Keycloak tokens received:', tokens);

      // Validate the user by access token
      const user = await this.authService.validateUserByAccessToken(tokens.access_token);
      console.log('User validated by Keycloak access token:', user);

      // If user is valid, generate local JWT tokens
      if (user) {
        const localTokens = this.authService.login(user);  // Create local JWT tokens
        console.log('Local JWT tokens generated:', localTokens);

        // Log the full return object before returning it
        const response = {
          keycloakTokens: tokens,        // Original Keycloak tokens
          localTokens: localTokens       // Your application's local JWT tokens
        };
        console.log('Returning response:', JSON.stringify(response, null, 2));

        // Return both Keycloak tokens and local JWT tokens
        return response;
      } else {
        console.error('User validation failed');
        throw new Error('User validation failed');
      }
    } catch (error) {
      console.error('Error during OAuth2 login process:', error.message);
      throw new Error('Login failed: ' + error.message);
    }
  }


}
