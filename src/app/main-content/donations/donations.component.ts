import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DonationEntryComponent } from '../../donation-entry/donation-entry.component';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeService } from '../../services/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [
    CommonModule,
    DonationEntryComponent
  ],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss'
})
export class DonationsComponent implements OnInit, OnDestroy {
  isAdmin = false;
  isDarkMode = false;
  isBrowser: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    const themeSub = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Initialize with current value
    this.isDarkMode = this.themeService.isDarkMode();

    // Subscribe to admin status changes
    const adminSub = this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    // Initialize with current value
    this.isAdmin = this.authService.isAdmin();

    this.subscriptions.push(adminSub, themeSub);
  }

  // Toggle admin status for testing
  toggleAdmin(): void {
    this.authService.setAdmin(!this.isAdmin);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
