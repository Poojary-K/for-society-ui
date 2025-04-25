import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  continueAsGuest(): void {
    this.authService.guestLogin();
    this.router.navigate(['/main']);
  }

  login(): void {
    // Will be implemented later
    this.authService.login();
    this.router.navigate(['/main']);
  }

  signup(): void {
    // Will be implemented later
    this.router.navigate(['/signup']);
  }
}
