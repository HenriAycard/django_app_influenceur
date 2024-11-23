import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, LoginParam, RefreshTokenParam, TokenResponse, UserParam } from 'src/app/models/users';
import * as Constant from '../../config/constant';


@Injectable({
  providedIn: 'root'
})
export class ApiAuthService {

  constructor(public http: HttpClient) { }
  
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
  
}
