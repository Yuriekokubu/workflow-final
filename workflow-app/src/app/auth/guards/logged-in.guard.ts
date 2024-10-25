import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const loggedInGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const loggedInUser = authService.loggedInUser;

  console.log(loggedInGuard.name, loggedInUser);

  if (loggedInUser) {
    if (state.url.includes('login')) {
      router.navigate(['/budget/item-entry']);
      return false;
    }
    return true;
  } else {
    if (state.url.includes('login')) {
      return true;
    }
    router.navigate(['auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
