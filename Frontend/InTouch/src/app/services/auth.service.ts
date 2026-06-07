import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { LoginParam, TokenResponse, User, UserParam } from 'src/app/shared/models';
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
    if (this.tokenManager.isTokenSave()){
      this.fetchCurrentUser()
    } else {
      console.log("The user is not authenticated - Disconnected")
      this.isAuthenticated.next(false);
    }
  }

  /**
   * Resolves the authentication state from a persisted token BEFORE the router
   * runs its first navigation. Wired through `provideAppInitializer` so route
   * guards never see a half-initialized `isAuthenticated` on a hard refresh.
   * Always resolves (never rejects) so app bootstrap is not blocked on errors.
   */
  restoreSession(): Promise<void> {
    if (!this.tokenManager.isTokenSave()) {
      this.isAuthenticated.next(false);
      return Promise.resolve();
    }

    return firstValueFrom(
      this.apiAuth.findUser().pipe(
        tap((response: User) => {
          this.user$.next(createUser(response));
          this.isAuthenticated.next(true);
        }),
        map(() => void 0),
        catchError(() => {
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
        this.tokenManager.setAccessToken(response.access)
        this.tokenManager.setRefreshToken(response.refresh)

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

  logout() {
    this.tokenManager.clear()
    this.isAuthenticated.next(false)
    this.user$.next(null)
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if(refreshToken) {
      return this.apiAuth.refreshToken({
        refresh: refreshToken
      }).pipe(
        tap(response => {
          this.tokenManager.clear()
          this.tokenManager.setAccessToken(response.access)
          this.tokenManager.setRefreshToken(response.refresh)
        })
      )
    }
    return EMPTY
  }

  registerUser(params: UserParam): Observable<any> {
    return this.apiAuth.createUser(params);
  }

  isAuth() {
    return this.tokenManager.isTokenSave() && this.isAuthenticated.getValue() === true
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

function createUser(values: any) : User {
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

