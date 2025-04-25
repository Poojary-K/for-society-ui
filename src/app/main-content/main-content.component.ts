import { Component, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../services/auth.service';


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

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }

    // Only check localStorage in browser environment
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
      }
    }

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
    this.isDarkMode = !this.isDarkMode;
    // Only save to localStorage in browser environment
    if (this.isBrowser) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }
}
