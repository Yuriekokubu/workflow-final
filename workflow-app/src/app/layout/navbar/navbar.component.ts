import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Role } from '../../auth/models/logged-in-user';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  authService = inject(AuthService);

  // Define the menus
  menus = [
    { path: 'budget/item-entry', title: 'List' },
    { path: 'budget/item-add', title: 'Add' }
  ];

  // Conditionally add 'Approval' menu for ADMIN role
  getMenus() {
    const loggedInUser = this.authService.loggedInUser;
    if (loggedInUser && loggedInUser.userProfile.role === Role.ADMIN) {
      // Add 'Approval' menu for admin
      return [...this.menus, { path: 'budget/item-approval', title: 'Approval' }];
    }
    return this.menus;
  }

  onLogout(): void {
    this.authService.logout();
  }

  onKeycloakLogin(): void {
    this.authService.getLoginOauth2RedirectUrl().subscribe((res) => {
      window.location.replace(res.redirectUrl);
    });
  }
}
