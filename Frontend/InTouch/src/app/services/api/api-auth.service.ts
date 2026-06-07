import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, LoginParam, TokenResponse, UserParam } from 'src/app/shared/models';
import * as Constant from '../../config/constant';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class ApiAuthService extends ApiService {

  urlBase: string = Constant.domainConfig.virtual_host + "auth/";

  // `withCredentials` lets the browser store/return the httpOnly refresh cookie
  // the backend sets on these endpoints.
  login(params: LoginParam) : Observable<TokenResponse> {
    return this.http.post<any>(this.urlBase + "jwt/create/", params, { withCredentials: true });
  }

  // No body: the refresh token is read from the httpOnly cookie by the backend.
  refreshToken() : Observable<TokenResponse> {
    return this.http.post<any>(this.urlBase + "jwt/refresh/", {}, { withCredentials: true });
  }

  // SSO bridge: hand a fragment-delivered refresh token to the backend so it can
  // store it as the httpOnly cookie and return a fresh access token.
  exchangeRefreshForCookie(refresh: string) : Observable<TokenResponse> {
    return this.http.post<any>(this.urlBase + "jwt/cookie/", { refresh }, { withCredentials: true });
  }

  logout() : Observable<any> {
    return this.http.post<any>(this.urlBase + "jwt/logout/", {}, { withCredentials: true });
  }

  findUser() : Observable<User> {
    return this.http.get<User>(this.urlBase + "users/me/");
  }

  createUser(params: UserParam) : Observable<any> {
    return this.http.post<any>(this.urlBase + "users/", params);
  }

  update(id: string, params: Partial<User>): Observable<User> {
    const url = `${Constant.domainConfig.virtual_host}${Constant.domainConfig.apiPrefix}/user/${id}`;
    return this.http.patch<User>(url, params, this.options)
  }

  updateAvatar(id: string, formData: FormData): Observable<HttpEvent<User>> {
    const url = `${Constant.domainConfig.virtual_host}${Constant.domainConfig.apiPrefix}/user/${id}`;
    return this.http.patch<User>(url, formData, { reportProgress: true, observe: 'events'})
  }
  
}
