// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const loggedInUser = authService.loggedInUser;

  if (loggedInUser) {
    const token = req.url.includes('auth/refresh')
      ? loggedInUser.tokens.refresh_token
      : loggedInUser.tokens.access_token;

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req).pipe(
    catchError((error) => {
      if (
        !req.url.includes('auth/login') &&
        !req.url.includes('auth/refresh') &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        const refresh_token = loggedInUser?.tokens.refresh_token;

        if (!refresh_token) {
          authService.logout();
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap((newTokens) => {
            // got { access_token } then update access_token
            authService.setTokens({ access_token: newTokens.access_token, refresh_token });

            // clone req with new access_token
            req = req.clone({
              setHeaders: { Authorization: `Bearer ${newTokens.access_token}` }
            });

            // call api with new req & new access_token
            return next(req);
          }),
          catchError((error) => {
            // logout when refresh_token is invalid
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
