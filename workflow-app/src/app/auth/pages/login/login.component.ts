// login.component.ts
import { JsonPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [JsonPipe, ReactiveFormsModule, AlertModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  @Input() code = '';  // Keep the Input if code might be passed externally

  // router and route
  route = inject(ActivatedRoute);
  router = inject(Router);

  /// auth.service
  authService = inject(AuthService);

  // init form
  fb = inject(NonNullableFormBuilder);
  username = this.fb.control('a1001');
  password = this.fb.control('tae');

  fg = this.fb.group({
    username: this.username,
    password: this.password
  });

  // error handling
  error?: any;

  ngOnInit() {
    // Check for OAuth2 authorization code in the URL query parameters
    this.route.queryParams.subscribe(params => {
      const codeFromUrl = params['code'];  // OAuth2 code from query string

      if (codeFromUrl) {
        this.authService.loginOauth2(codeFromUrl).subscribe({
          next: () => this.router.navigate(['/']),
          error: (error) => this.error = error  // Display error if OAuth2 login fails
        });
      }
    });
  }

  // Standard form login with username and password
  onLogin() {
    this.authService.login(this.fg.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/budget/item-entry';
        this.router.navigate([returnUrl]);
      },
      error: (error) => this.error = error  // Handle form login errors
    });
  }
}
