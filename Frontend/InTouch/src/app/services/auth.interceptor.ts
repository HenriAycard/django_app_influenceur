import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, catchError, filter, finalize, switchMap, take, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { TokenManagerService } from "./token-manager.service";
import { TokenResponse } from "src/app/shared/models";

// Shared single-flight refresh state. Module-level so it is shared across every
// request the way the previous root-singleton interceptor service was.
let refreshingInProgress = false;
const accessTokenSubject = new BehaviorSubject<string>("");

function addAuthorizationHeader(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    if (token) {
        return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return request;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenManager = inject(TokenManagerService);
    const authService = inject(AuthService);
    const router = inject(Router);

    const accessToken = tokenManager.getAccessToken();
    // The auth endpoints carry the refresh cookie and mint tokens themselves; a
    // 401 from one of them must never trigger another refresh (it would recurse).
    const isAuthEndpoint = req.url.includes('/auth/jwt/');

    const logoutAndRedirect = (err: unknown): Observable<HttpEvent<unknown>> => {
        authService.logout();
        router.navigateByUrl('/login');
        return throwError(() => err);
    };

    const refreshToken = (request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> => {
        if (!refreshingInProgress) {
            refreshingInProgress = true;
            accessTokenSubject.next("");

            return authService.refreshToken().pipe(
                switchMap((res: TokenResponse) => {
                    accessTokenSubject.next(res.access);
                    // repeat failed request with new token
                    return next(addAuthorizationHeader(request, res.access));
                }),
                // refresh cookie missing/expired -> end the session cleanly
                catchError((err: unknown) => logoutAndRedirect(err)),
                finalize(() => (refreshingInProgress = false))
            );
        }
        // wait while getting new token
        return accessTokenSubject.pipe(
            filter(token => token !== ""),
            take(1),
            switchMap(token => next(addAuthorizationHeader(request, token)))
        );
    };

    return next(addAuthorizationHeader(req, accessToken)).pipe(
        catchError((err: unknown) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
                // Don't try to refresh a failed auth call (login/refresh/etc.).
                if (isAuthEndpoint) {
                    return throwError(() => err);
                }
                // We had an access token (the user was logged in): try to mint a
                // new one from the httpOnly refresh cookie, then retry.
                if (accessToken) {
                    return refreshToken(req);
                }
                // otherwise logout and redirect to login page
                return logoutAndRedirect(err);
            } else if (err instanceof HttpErrorResponse && err.status === 403) {
                // 403 means the refresh token failed: logout and redirect to login
                return logoutAndRedirect(err);
            }
            // neither 401 nor 403: just rethrow
            return throwError(() => err);
        })
    );
};
