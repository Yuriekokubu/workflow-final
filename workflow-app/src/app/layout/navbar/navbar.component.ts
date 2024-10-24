// navbar.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  // add
  authService = inject(AuthService);
  
  menus = [
    { path: 'budget/item-entry', title: 'List' },
    { path: 'budget/item-approval', title: 'Approval' },
    { path: 'budget/item-add', title: 'Add' }

  ]

  // add
  onLogout(): void {
    this.authService.logout();
  }

  onKeycloakLogin() {
    this.authService.getLoginOauth2RedirectUrl()
      .subscribe((v) => window.location.replace(v.redirectUrl))
  }
}
