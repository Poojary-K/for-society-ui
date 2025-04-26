import { Component, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../services/auth/auth.service';
import { ThemeService } from '../services/theme/theme.service';


@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [MatSidenavModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit, OnDestroy {
  @ViewChild('sidebar') sidebar!: MatSidenav;

  isMobile = false;
  sidenavMode: 'side' | 'over' | 'push' = 'side';
  sidenavOpened = true;
  isDarkMode = false;
  isBrowser: boolean;
  currentView = 'Home';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }

    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;

        // Add or remove dark-mode class on body for toastr styling
        if (this.isBrowser) {
          if (isDark) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
        }
      });

    // Initialize with current value
    this.isDarkMode = this.themeService.isDarkMode();

    // Initialize body class for toastr
    if (this.isBrowser && this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    // Listen to route changes to update the current view
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const urlParts = event.urlAfterRedirects.split('/');
      const lastPart = urlParts[urlParts.length - 1];

      // Set currentView based on the route
      if (lastPart === 'home' || lastPart === 'main') {
        this.currentView = 'Home';
      } else if (lastPart === 'donations') {
        this.currentView = 'Donations';
      } else if (lastPart === 'contributions') {
        this.currentView = 'Contributions';
      } else if (lastPart === 'donation-entry') {
        this.currentView = 'Donation Entry';
      } else {
        this.currentView = this.capitalizeFirstLetter(lastPart);
      }
    });

    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isMobile = result.matches;

        if (this.isMobile) {
          this.sidenavMode = 'push';
          this.sidenavOpened = false;
        } else {
          this.sidenavMode = 'side';
          this.sidenavOpened = true;
        }

        // Apply changes if sidenav is already initialized
        if (this.sidebar) {
          this.sidebar.mode = this.sidenavMode;
          if (this.sidenavOpened) {
            this.sidebar.open();
          } else {
            this.sidebar.close();
          }
        }
      });
  }

  // Helper method to capitalize first letter of a string
  private capitalizeFirstLetter(text: string): string {
    if (!text) return 'Dashboard';
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, ' ');
  }

  loadComponent(componentName: string) {
    this.router.navigate(['/main', componentName]);

    if (this.isMobile) {
      this.sidebar.close();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebar.toggle();
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}
