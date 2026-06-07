import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, LoginParam, RefreshTokenParam, TokenResponse, UserParam } from 'src/app/shared/models';
import * as Constant from '../../config/constant';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class ApiAuthService extends ApiService {
  
  urlBase: string = Constant.domainConfig.virtual_host + "auth/";

  login(params: LoginParam) : Observable<TokenResponse> {
    return this.http.post<any>(this.urlBase + "jwt/create/", params);
  }

  refreshToken(param: RefreshTokenParam) : Observable<TokenResponse> {
    return this.http.post<any>(this.urlBase + "jwt/refresh/", param);
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
