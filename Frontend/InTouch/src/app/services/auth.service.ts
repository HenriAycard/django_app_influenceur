import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { LoginParam, TokenResponse, User, RegisterRequest } from 'src/app/shared/models';
import { TokenManagerService } from './token-manager.service';
import { ApiAuthService } from './api/api-auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { company, influencer, Role, unknow, UserRole } from 'src/app/shared/models';
import { GetTokenResult } from '@capacitor-firebase/messaging';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  protected isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected user$ = new BehaviorSubject<User|null>(null);

  private tokenManager = inject(TokenManagerService)
  private apiAuth = inject(ApiAuthService)
  private toastService = inject(ToastService)

  constructor(
    private router:Router) { }

  get user(): User | null { return this.user$.getValue(); }
  get userAsObservale(): Observable<User|null> { return this.user$.asObservable(); }

  initialize() {
    if (this.tokenManager.hasAccessToken()){
      this.fetchCurrentUser()
    } else {
      console.log("The user is not authenticated - Disconnected")
      this.isAuthenticated.next(false);
    }
  }

  /**
   * Resolves the authentication state BEFORE the router runs its first
   * navigation. Wired through `provideAppInitializer` so route guards never see
   * a half-initialized `isAuthenticated` on a hard refresh.
   *
   * The access token only lives in memory, so after a reload we have none. We
   * silently mint a fresh one from the httpOnly refresh cookie: if that succeeds
   * the session is restored; any failure (no/expired cookie) resolves as
   * unauthenticated. Always resolves (never rejects) so bootstrap is not blocked.
   */
  restoreSession(): Promise<void> {
    return firstValueFrom(
      this.refreshToken().pipe(
        switchMap(() => this.apiAuth.findUser()),
        tap((response: User) => {
          this.user$.next(createUser(response));
          this.isAuthenticated.next(true);
        }),
        map(() => void 0),
        catchError(() => {
          this.tokenManager.clear();
          this.user$.next(null);
          this.isAuthenticated.next(false);
          return of(void 0);
        })
      )
    );
  }

  redirection() {
    if (this.user) {
      if (this.user.isInfluencer) {
        console.log("Redirect the user to /influencer")
        this.router.navigate(['/influencer'])
      } else {
        console.log("Redirect the user to /brand")
        this.router.navigate(['/brand'])
      }
    } else {
      console.log("The user is not found, redirect the user to /login")
      this.router.navigate(['/login'])
    }
  }

  fetchCurrentUser() {
    console.log("Retrieve the current user")
    this.apiAuth.findUser().subscribe({
      next: (response: User) => {
        let tmpUser: User = createUser(response)
        this.user$.next(tmpUser);
        this.isAuthenticated.next(true);
        console.log("The user is authenticated - Connect")
      },
      error: (erreur: HttpErrorResponse) => {
        this.user$.next(null)
        this.isAuthenticated.next(false);
        console.error(erreur)
        console.log("The user is not authenticated - Disconnected")
      },
      complete : () => this.redirection()
    });
  }

  login(params: LoginParam) {
    this.apiAuth.login(params).subscribe({
      next: (response: TokenResponse) => {
        console.log("The token is correctly settle")
        // Access token kept in memory; the refresh token was set as an httpOnly cookie.
        this.tokenManager.setAccessToken(response.access)

        this.fetchCurrentUser()
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
        const message = error.status === 401
          ? 'Invalid email or password. Please try again.'
          : 'Unable to sign in right now. Please try again later.'
        this.toastService.toastDanger('Login failed', message)
      }
    })
  }

  /**
   * SSO entry: the portal hands us a refresh token in the URL fragment. We send
   * it to the backend, which validates it, stores it as the httpOnly cookie, and
   * returns a fresh access token — so the refresh token leaves JS-reachable
   * storage immediately. Then load the user and redirect by role.
   */
  loginWithSsoRefresh(refresh: string) {
    this.apiAuth.exchangeRefreshForCookie(refresh).subscribe({
      next: (response: TokenResponse) => {
        this.tokenManager.setAccessToken(response.access)
        this.fetchCurrentUser()
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
        this.toastService.toastDanger('Sign-in failed', 'This sign-in link is invalid or expired.')
        this.router.navigateByUrl('/login')
      }
    })
  }

  logout() {
    // Best-effort: clear the server-side refresh cookie. Local state is dropped
    // regardless of the call's outcome.
    this.apiAuth.logout().subscribe({ error: () => {} })
    this.tokenManager.clear()
    this.isAuthenticated.next(false)
    this.user$.next(null)
  }

  refreshToken(): Observable<TokenResponse> {
    // The refresh token is read from the httpOnly cookie by the backend; we only
    // receive (and store in memory) the new access token.
    return this.apiAuth.refreshToken().pipe(
      tap(response => this.tokenManager.setAccessToken(response.access))
    )
  }

  registerUser(params: RegisterRequest): Observable<any> {
    return this.apiAuth.register(params);
  }

  isAuth() {
    return this.tokenManager.hasAccessToken() && this.isAuthenticated.getValue() === true
  }

  getCurrentUserProfile(): UserRole {
    if (!this.isAuth() || !this.user) {
      return unknow;
    }
  
    if (this.user.isInfluencer) {
      return influencer;
    }
  
    if (this.user.isCompany) {
      return company;
    }

    return unknow;
  }
}

function createUser(values: User) : User {
  return {
      id: values.id,
      firstname: values.firstname,
      lastname: values.lastname,
      username: values.username,
      instagram: values.instagram,
      tiktok: values.tiktok,
      youtube: values.youtube,
      isInfluencer: values.isInfluencer,
      isCompany: values.isCompany,
      avatar: null
  }
}

