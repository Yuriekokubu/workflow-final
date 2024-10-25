import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';  // You might need to install the library
import { Observable, tap } from 'rxjs';
import { ENV_CONFIG } from '../env.config';
import { LoggedInUser, Tokens, UserProfile } from './models/logged-in-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private envConfig = inject(ENV_CONFIG);
  readonly URL = `${this.envConfig.apiUrl}/auth/login`;
  readonly TOKENS = 'TOKENS';

  httpClient = inject(HttpClient);
  router = inject(Router);

  loggedInUser: LoggedInUser | null = null;

  constructor() {
    const tokensInStorage = sessionStorage.getItem(this.TOKENS);
    if (tokensInStorage) {
      this.setTokens(JSON.parse(tokensInStorage) as Tokens);
    }
  }

  login(credential: { username: string; password: string }): Observable<Tokens> {
    return this.httpClient
      .post<Tokens>(this.URL, credential)
      .pipe(
        tap((newToken) => {
          newToken.loginMethod = 'local';  // Add login method
          this.setTokens(newToken);
        })
      );
  }

  refreshToken(): Observable<{ access_token: string }> {
    return this.httpClient.post<{ access_token: string }>(
      `${this.envConfig.apiUrl}/auth/refresh`,
      null
    );
  }

  setTokens(newToken: Tokens) {
    const userProfile = jwtDecode<UserProfile>(newToken.access_token);

    // Save tokens, including id_token and login method, in sessionStorage
    this.loggedInUser = { tokens: newToken, userProfile };

    // Save the entire token object to session storage (including id_token and login method)
    sessionStorage.setItem(this.TOKENS, JSON.stringify(newToken));
  }

  logout(): void {
    const tokensInStorage = sessionStorage.getItem(this.TOKENS);

    // Parse tokens from sessionStorage if they exist
    if (tokensInStorage) {
      const tokens: Tokens = JSON.parse(tokensInStorage);
      const loginMethod = tokens.loginMethod;

      // If the user logged in via Keycloak, perform Keycloak logout
      if (loginMethod === 'keycloak') {
        const idToken = this.getKeycloakIdToken();
        if (idToken) {
          this.postKeycloakLogout(idToken).subscribe({
            next: () => {
              console.log('Logged out from Keycloak successfully.');
              this.clearSession();
            },
            error: (error) => {
              console.error('Error during Keycloak logout:', error);
              this.clearSession();  // Ensure local logout happens even if Keycloak logout fails
            }
          });
        } else {
          console.warn('Unable to get Keycloak ID Token. Performing local logout.');
          this.clearSession();
        }
      } else {
        // Perform local logout
        this.clearSession();
      }
    } else {
      // If no tokens are found, perform local logout
      this.clearSession();
    }
  }

  clearSession(): void {
    this.loggedInUser = null;
    sessionStorage.removeItem(this.TOKENS);
    localStorage.removeItem('keycloakTokens');  // Optionally clear Keycloak tokens from localStorage
    this.router.navigate(['/auth/login']);
  }

  getKeycloakIdToken(): string | null {
    const keycloakTokensString = localStorage.getItem('keycloakTokens');
    const keycloakTokens = keycloakTokensString ? JSON.parse(keycloakTokensString) : null;
    return keycloakTokens ? keycloakTokens.id_token : null;
  }

  postKeycloakLogout(idToken: string) {
    const keycloakLogoutUrl = `http://localhost:8080/realms/budget-workflow/protocol/openid-connect/logout`;
    const postLogoutRedirectUri = 'http://localhost:4200/auth/login';

    // Set up the body params
    const params = new HttpParams()
      .set('id_token_hint', idToken)
      .set('post_logout_redirect_uri', postLogoutRedirectUri);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    // Send the POST request to Keycloak's logout endpoint
    return this.httpClient.post(keycloakLogoutUrl, params.toString(), { headers });
  }


  getKeycloakLogoutUrl(): string {
    const keycloakTokensString = localStorage.getItem('keycloakTokens');
    const id_token = keycloakTokensString ? JSON.parse(keycloakTokensString).id_token : null;

    if (!id_token) {
      console.warn('ID Token is missing in keycloakTokens.');
      return '';  // Return an empty string or handle accordingly
    }

    const keycloakLogoutUrl = `http://localhost:8080/realms/budget-workflow/protocol/openid-connect/logout`;
    const postLogoutRedirectUri = encodeURIComponent('http://localhost:4200/auth/login'); // Redirect after logout

    return `${keycloakLogoutUrl}?id_token_hint=${id_token}&post_logout_redirect_uri=${postLogoutRedirectUri}`;
  }



  // OAuth2 login
  getLoginOauth2RedirectUrl() {
    return this.httpClient.get<{ redirectUrl: string }>(
      `${this.envConfig.apiUrl}/auth/login-oauth2-redirect-url`
    );
  }

  loginOauth2(code: string): Observable<{ keycloakTokens: Tokens; localTokens: Tokens; }> {
    return this.httpClient
      .post<{ keycloakTokens: Tokens, localTokens: Tokens }>(`${this.envConfig.apiUrl}/auth/login-oauth2`, { code })
      .pipe(
        tap(({ keycloakTokens, localTokens }) => {
          // Check if the id_token is present in both Keycloak and local tokens
          if (!keycloakTokens.id_token) {
            console.warn('ID Token is missing in Keycloak tokens');
          }

          if (!localTokens.id_token) {
            console.warn('ID Token is missing in local tokens');
          }

          // Add loginMethod 'local' to localTokens
          localTokens.loginMethod = 'keycloak';

          // Save tokens
          this.setKeycloakTokens(keycloakTokens);  // Save Keycloak tokens to localStorage
          this.setTokens(localTokens);             // Save local tokens (with loginMethod) to sessionStorage
        })
      );
  }


  setKeycloakTokens(keycloakTokens: Tokens) {
    const keycloakUserProfile = jwtDecode<UserProfile>(keycloakTokens.access_token);

    // Check if the id_token is present and log it for debugging
    if (keycloakTokens.id_token) {
      console.log('ID Token available in Keycloak tokens:', keycloakTokens.id_token);
    } else {
      console.warn('ID Token is missing in Keycloak tokens!');
    }

    // Save the entire keycloak token object to localStorage (including id_token)
    localStorage.setItem('keycloakTokens', JSON.stringify(keycloakTokens));

    // Optional: Save the keycloak user profile if you need to use it later
    localStorage.setItem('keycloakUserProfile', JSON.stringify(keycloakUserProfile));
  }

}
