import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, Subject, of } from 'rxjs';
import { ApiserviceService } from './apiservice.service';
import { UserManagerProviderService } from './user-manager-provider.service';


interface User {
  logentry:string;
  password:string;
  last_login:any;
  is_superuser:any;
  id:any;
  email:string;
  first_name:string;
  last_name:string;
  date_joined:any;
  is_influenceur:any;
  is_active:any;
  is_staff:any;
  avatar:any;
  groups:any;
  user_permissions:any;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export interface django_pagination {
  count: number;
  next: any;
  previous: any;
  results: Array<Object>
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Init with null to filter out the first value in a guard!
  user$ = new BehaviorSubject<User | unknown>(null);

  constructor(
    private http: HttpClient,
    private localStorageService: UserManagerProviderService,
    private apiService: ApiserviceService) { }

refreshToken(): Observable<{access: string; refresh: string}> {
  console.log("[AuthenticationService] - refreshToken()")
  const refreshToken = this.localStorageService.getItem('refresh');
  console.log("[AuthenticationService] - refreshToken=" + refreshToken)
  console.log("[AuthenticationService] - URL=" + this.apiService.getRefreshTokenUrl)

  return this.http.post<{access: string; refresh: string}>(
      this.apiService.getRefreshTokenUrl,
    {
      refreshToken
    }).pipe(
      tap(response => {
        console.log(response)
        this.setToken('access', response.access);
        this.setToken('refresh', response.refresh);
      })
  );
}

private setToken(key: string, token: string): void {
    this.localStorageService.setItem(key, token);
}

logout(): void {
    this.localStorageService.removeItem('access');
    this.localStorageService.removeItem('refresh');
    this.user$.next(null);
}

login(form: {email: string; password: string}): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(this.apiService.getLoginUrl, form)
    .pipe(
      tap((response: any) => {
        this.setToken('access', response.access);
        this.setToken('refresh', response.refresh);
      })
    );
}

getCurrentUser(): Observable<any> {
  console.log("start")
  return this.user$.pipe(
    switchMap((user: any) => {
      // check if we already have user data
      console.log(user)
      if (user) {
        return of(user);
      }

      const token = this.localStorageService.getItem('access');
      console.log(token)
      // if there is token then fetch the current user
      if (token) {
        return this.fetchCurrentUser();
      }
      console.log("null")
      return of(null);
    })
  );
}

fetchCurrentUser(): Observable<django_pagination> {
  return this.http.get<django_pagination>(this.apiService.getUserUrl)
    .pipe(
      tap((datas: django_pagination) => {
        this.user$.next(datas.results[0]);
      })
    );
}

 /*
  loadToken() {
    this.apiService.getLocalData(TOKEN_KEY).then((value:any)=>{
      if (value){
        console.log('set token: ', value);
        this.token = value["access"];
        this.apiService.getLocalData(REFRESH_TOKEN_KEY).then((value:any)=>{
          this.refresh=value["refresh"]
          this.isAuthenticated.next(true);
        })       
      }
      else{
        console.log("=PAS DE TOKEN PAS LOGGE")
        this.isAuthenticated.next(false);
      }
    })
   
  }

  login(params: any){
    return new Promise(async resolve => {
    this.apiService.login(params).subscribe((resultat: any)=>{
       if (resultat) {
          let accessToken = resultat["access"]
          let refreshToken = resultat["refresh"]
          this.apiService.setLocalData("access",{"access":accessToken})
          this.apiService.setLocalData("refresh",{"refresh":refreshToken})
          this.token = accessToken;
          this.refresh=refreshToken
          this.isAuthenticated.next(true);
         
         resolve(true)
        }
      else{
        resolve(false)
      }
      })
    })
  }
 
  logout(): Promise<void> {
    this.isAuthenticated.next(false);
    return new Promise(async resolve => {
       this.apiService.removeLocalData(TOKEN_KEY).then(()=>{
          this.apiService.removeLocalData(REFRESH_TOKEN_KEY).then(()=>{
            resolve()
          }
        )
       });
    })
  }

  refreshToken(){
    //return this.
  }*/
}
