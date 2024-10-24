// logged-in.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const loggedInGuard: CanActivateFn = (route, state) => {

  const loggedInUser = inject(AuthService).loggedInUser;

  console.log(loggedInGuard.name, loggedInUser)

  if (loggedInUser) {
    return true;
  }

  inject(Router).navigate(['auth/login'], { queryParams: { returnUrl: state.url }});

  return false;
};
