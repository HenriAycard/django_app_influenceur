import { Injectable } from '@angular/core';

/**
 * Holds the short-lived JWT access token in memory only.
 *
 * The access token is deliberately NOT persisted: keeping it out of
 * localStorage/sessionStorage removes the XSS exfiltration vector. The long-lived
 * refresh token is never seen by JavaScript at all — the backend stores it in an
 * httpOnly cookie. On a hard reload the in-memory access token is gone, and
 * `AuthService.restoreSession()` silently mints a new one from the refresh cookie.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {

  private accessToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(value: string | null): void {
    this.accessToken = value;
  }

  hasAccessToken(): boolean {
    return this.accessToken != null;
  }

  clear(): void {
    this.accessToken = null;
  }
}
