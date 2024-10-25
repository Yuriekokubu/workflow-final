import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoggedInDto } from './dto/logged-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v7 as uuidv7 } from 'uuid';
import axios from 'axios';

@Injectable()
export class AuthService {

  private logger = new Logger();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  /**
   * Regular username/password validation (non-OAuth2 flow)
   */
  async validateUser(username: string, password: string): Promise<LoggedInDto> {
    // find user by username
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      this.logger.debug(`user not found: username=${username}`, AuthService.name);
      return null;
    }

    // found & compare password
    if (await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } else {
      this.logger.debug(`wrong password: username=${username}`, AuthService.name);
      return null;
    }
  }

  /**
   * Login using local JWT generation
   */
  login(loggedInDto: LoggedInDto) {
    // payload = loggedInDto + other payload
    const payload: LoggedInDto = { ...loggedInDto, sub: loggedInDto.id };
    const access_token = this.jwtService.sign(payload);

    // sign refresh_token
    const refreshTokenSecret = this.configService.get('REFRESH_JWT_SECRET');
    const refreshTokenExpiresIn = this.configService.get('REFRESH_JWT_EXPIRES_IN');

    // sign with options for refresh token
    const refresh_token = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiresIn
    });

    // return access_token & refresh_token
    return { access_token, refresh_token };
  }

  /**
   * Handle token refresh
   */
  refreshToken(loggedInDto: LoggedInDto) {
    // sign new access_token (refresh it!)
    const payload: LoggedInDto = { ...loggedInDto, sub: loggedInDto.id };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  /**
   * Generate OAuth2 Redirect URL (Keycloak login)
   */
  getOauth2RedirectUrl(): string {
    const auth_url = this.configService.get('OAUTH2_AUTH_URL_CLIENT');
    const client_id = this.configService.get('OAUTH2_CLIENT_ID');
    const redirect_uri = encodeURIComponent(this.configService.get('OAUTH2_CALLBACK_URL'));
    const scope = encodeURIComponent(this.configService.get('OAUTH2_SCOPE'));
    const response_type = this.configService.get('OAUTH2_RESPONSE_TYPE');
    const state = uuidv7();
    return `${auth_url}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}&state=${state}`;
  }

  /**
   * Exchange authorization code for tokens (Keycloak)
   */

  async exchangeCodeForTokens(code: string): Promise<any> {
    const tokenUrl = this.configService.get('OAUTH2_TOKEN_URL');
    const client_id = this.configService.get('OAUTH2_CLIENT_ID');
    const client_secret = this.configService.get('OAUTH2_CLIENT_SECRET');
    const redirect_uri = this.configService.get('OAUTH2_CALLBACK_URL');

    // Log the values being used in the request
    this.logger.log(`Attempting to exchange authorization code. Details:
      tokenUrl: ${tokenUrl},
      client_id: ${client_id},
      redirect_uri: ${redirect_uri},
      code: ${code}`);

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);
    params.append('client_id', client_id);
    params.append('client_secret', client_secret);

    try {
      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Log the successful response data
      this.logger.log('Authorization code exchanged successfully. Response data:');
      this.logger.log(JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      // Log the most important parts of the error without circular structure
      this.logger.error('Error exchanging authorization code for tokens:', error.message);

      // Check if the error contains a response (which it should in case of 400)
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`No response received from token endpoint.`);
      }

      throw new Error('Failed to exchange authorization code.');
    }
  }


  /**
   * Validate user by decoding the Keycloak access token
   */
  async validateUserByAccessToken(accessToken: string): Promise<LoggedInDto> {
    const decodedToken: { preferred_username: string } = this.jwtService.decode(accessToken) as any;

    if (!decodedToken || !decodedToken.preferred_username) {
      throw new Error('Invalid access token');
    }

    // Find the user in your local database
    const user = await this.usersService.findOneByUsername(decodedToken.preferred_username);
    if (!user) {
      this.logger.debug(`user not found: username=${decodedToken.preferred_username}`, AuthService.name);
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
