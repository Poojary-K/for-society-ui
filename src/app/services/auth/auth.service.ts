import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);

  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  public isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Check if user was previously logged in - only in browser environment
    if (this.isBrowser) {
      const storedLoginState = localStorage.getItem('isLoggedIn');
      const storedAdminState = localStorage.getItem('isAdmin');

      if (storedLoginState === 'true') {
        this.isLoggedInSubject.next(true);
      }

      if (storedAdminState === 'true') {
        this.isAdminSubject.next(true);
      }
    }
  }

  login(): void {
    // In a real app, this would validate credentials
    this.isLoggedInSubject.next(true);
    if (this.isBrowser) {
      localStorage.setItem('isLoggedIn', 'true');
    }
  }

  logout(): void {
    this.isLoggedInSubject.next(false);
    this.isAdminSubject.next(false);
    if (this.isBrowser) {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.setItem('isAdmin', 'false');
    }
  }

  guestLogin(): void {
    // Guest login doesn't set localStorage but updates the current state
    this.isLoggedInSubject.next(true);
  }

  setAdmin(isAdmin: boolean): void {
    this.isAdminSubject.next(isAdmin);
    if (this.isBrowser) {
      localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    }
  }

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
