import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize from localStorage if in browser environment
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkModeSubject.next(savedTheme === 'dark');
    }
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    const newValue = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newValue);

    if (this.isBrowser) {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
    }
  }

  /**
   * Set dark mode explicitly
   */
  setDarkMode(isDark: boolean): void {
    this.isDarkModeSubject.next(isDark);

    if (this.isBrowser) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  /**
   * Get current dark mode value
   */
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
