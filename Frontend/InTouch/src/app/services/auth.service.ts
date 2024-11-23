import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, tap, throwError } from 'rxjs';
import { LoginParam, TokenResponse, User, UserParam } from '../models/users';
import { TokenManagerService } from './token-manager.service';
import { ApiAuthService } from './api/api-auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  protected isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  protected user$ = new BehaviorSubject<User|null>(null);

  private tokenManager = inject(TokenManagerService)
  private apiAuth = inject(ApiAuthService)

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

  redirection() {
    if (this.user) {
      if (this.user.is_influencer) {
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

}

function createUser(values: any) : User {
  return {
      id: values.id,
      first_name: values.first_name,
      last_name: values.last_name,
      username: values.username,
      instagram: values.instagram,
      tiktok: values.tiktok,
      youtube: values.youtube,
      is_influencer: values.is_influencer 
  }
}

