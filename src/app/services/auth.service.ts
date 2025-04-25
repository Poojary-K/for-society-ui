import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Check if user was previously logged in - only in browser environment
    if (this.isBrowser) {
      const storedLoginState = localStorage.getItem('isLoggedIn');
      if (storedLoginState === 'true') {
        this.isLoggedInSubject.next(true);
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
    if (this.isBrowser) {
      localStorage.setItem('isLoggedIn', 'false');
    }
  }

  guestLogin(): void {
    // Guest login doesn't set localStorage but updates the current state
    this.isLoggedInSubject.next(true);
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
