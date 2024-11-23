import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { BehaviorSubject, Observable, catchError, filter, finalize, switchMap, take, throwError } from "rxjs";
import { TokenManagerService } from "./token-manager.service";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

    private tokenManager = inject(TokenManagerService)
    private authService = inject(AuthService)
    private router = inject(Router)

    private refreshingInProgress: boolean = false;
    private accessTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth token from the service
        const accessToken = this.tokenManager.getAccessToken()

        return next.handle(this.addAuthorizationHeader(req, accessToken)).pipe(
            catchError(err => {
                // in case of 401 http error
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    // get refresh tokens
                    console.log("[TokenInterceptor] - intercept - ERROR 401")
                    const refreshToken = this.tokenManager.getRefreshToken();

                    // if there are tokens then send refresh token request
                    if (refreshToken && accessToken) {
                        console.log("[TokenInterceptor] - intercept - call refreshToken")
                        return this.refreshToken(req, next);
                    }

                    // otherwise logout and redirect to login page
                    return this.logoutAndRedirect(err);
                } else if (err instanceof HttpErrorResponse && err.status === 403) {
                    // in case of 403 http error (refresh token failed)
                  // logout and redirect to login page
                  return this.logoutAndRedirect(err);
                }

                // if error has status neither 401 nor 403 then just return this error
                return throwError(err);
            })
        )
    }

    private addAuthorizationHeader(request: HttpRequest<any>, token: string|null): HttpRequest<any> {
        if (token) {
            return request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return request;
    }

    private logoutAndRedirect(err: any): Observable<HttpEvent<any>> {
        this.authService.logout();
        this.router.navigateByUrl('/login');
    
        return throwError(err);
    }

    private refreshToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.refreshingInProgress) {
          this.refreshingInProgress = true;
          this.accessTokenSubject.next("");
    
          return this.authService.refreshToken().pipe(
            switchMap((res: any) => {
              this.accessTokenSubject.next(res.access);
              // repeat failed request with new token
              return next.handle(this.addAuthorizationHeader(request, res.access));
            }),
            finalize(() => (this.refreshingInProgress = false))
          );
        } else {
          // wait while getting new token
          return this.accessTokenSubject.pipe(
            filter(token => token !== ""),
            take(1),
            switchMap(token => {
              // repeat failed request with new token
              return next.handle(this.addAuthorizationHeader(request, token!));
            }));
        }
      }

}