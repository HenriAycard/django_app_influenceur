import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { UserManagerProviderService } from './user-manager-provider.service'

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptor implements HttpInterceptor{

  private refreshingInProgress: boolean = false;
  private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(private authService: AuthenticationService,
              private userManager:UserManagerProviderService,
              private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("[TokenInterceptor] - intercept - Handle Intercept error")
    const accessToken = this.userManager.getItem('access');
    console.log("[TokenInterceptor] - intercept - accessToken=" + accessToken)

    return next.handle(this.addAuthorizationHeader(req, accessToken)).pipe(
      catchError(err => {
        // in case of 401 http error
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // get refresh tokens
          console.log("[TokenInterceptor] - intercept - ERROR 401")
          const refreshToken = this.userManager.getItem('refresh');
          console.log("[TokenInterceptor] - intercept - refreshToken=" + refreshToken)

          // if there are tokens then send refresh token request
          if (refreshToken && accessToken) {
            console.log("[TokenInterceptor] - intercept - call refreshToken")
            return this.refreshToken(req, next);
          }

          // otherwise logout and redirect to login page
          return this.logoutAndRedirect(err);
        }

        // in case of 403 http error (refresh token failed)
        if (err instanceof HttpErrorResponse && err.status === 403) {
          // logout and redirect to login page
          return this.logoutAndRedirect(err);
        }
        // if error has status neither 401 nor 403 then just return this error
        return throwError(err);
      })
    );
  }

  private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    if (token) {
      return request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
    }

    return request;
  }

  private logoutAndRedirect(err: any): Observable<HttpEvent<any>> {
    this.authService.logout();
    this.router.navigateByUrl('/login');

    return throwError(err);
  }

  private refreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(this.accessTokenSubject)
    console.log(this.refreshingInProgress)
    if (!this.refreshingInProgress) {
      this.refreshingInProgress = true;
      this.accessTokenSubject.next("");

      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          console.log("[TokenInterceptor] - refreshToken - res=")
          console.log(res)
          this.refreshingInProgress = false;
          this.accessTokenSubject.next(res.access);
          // repeat failed request with new token
          return next.handle(this.addAuthorizationHeader(request, res.access));
        })
      );
    } else {
      // wait while getting new token
      return this.accessTokenSubject.pipe(
        //filter(token => token !== ""),
        //take(1),
        switchMap(token => {
          console.log("[TokenInterceptor] - refreshToken - token=")
          console.log(token)
          // repeat failed request with new token
          return next.handle(this.addAuthorizationHeader(request, token!));
        }));
    }
  }
}
