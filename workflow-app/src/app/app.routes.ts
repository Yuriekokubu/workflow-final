// app.routes.ts
import { Routes } from '@angular/router';
import { loggedInGuard } from './auth/guards/logged-in.guard';

export const routes: Routes = [
  {
    path: 'budget',
    loadChildren: () => import('./budget/budget.routes'),
    canActivate: [loggedInGuard] // add
  }, 
  { path: 'auth', loadChildren: () => import('./auth/auth.routes') }
];
