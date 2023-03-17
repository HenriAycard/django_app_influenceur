import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, Subject, of } from 'rxjs';
import { ApiserviceService } from './apiservice.service';
import { UserManagerProviderService } from './user-manager-provider.service';
import { User } from './entities';


interface LoginResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Init with null to filter out the first value in a guard!
  user$ = new BehaviorSubject<User|null>(null);
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private localStorageService: UserManagerProviderService,
    private apiService: ApiserviceService) { 
      this.loadToken()
    }

  loadToken() {
    const accessToken = this.localStorageService.getItem('access');
    const refreshToken = this.localStorageService.getItem('refresh');
    if(accessToken && refreshToken) {
      console.log("[loadToken] - Connect OK !")
      this.isAuthenticated.next(true);
    } else {
      console.log("[loadToken] - Disconnect KO !")
      this.isAuthenticated.next(false);
    }
  }

  hasPermission(arg0: string) {
    if(arg0 === 'login'){
      return true;
    } else {
      return false;
    }
  }

refreshToken(): Observable<{access: string; refresh: string}> {
  console.log("[AuthenticationService] - refreshToken()")
  const refreshToken = this.localStorageService.getItem('refresh');
  console.log("[AuthenticationService] - refreshToken=" + refreshToken)
  console.log("[AuthenticationService] - URL=" + this.apiService.getRefreshTokenUrl)

  return this.http.post<{access: string; refresh: string}>(
      this.apiService.getRefreshTokenUrl,
    {
      refresh: refreshToken
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
    console.log("[AuthenticationService] - logout()")
    this.localStorageService.removeItem('access');
    this.localStorageService.removeItem('refresh');
    this.isAuthenticated.next(false);
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
/*
isAuthenticated(): Observable<boolean>{
  var subject = new Subject<boolean>()
  this.getCurrentUser().subscribe(
    (response: any) => {
      console.log(response)
      if(response === null || typeof response === 'undefined') {
        subject.next(false);
      } else {
        subject.next(true);
      }
    }
  )
  return subject.asObservable();
}
*/

getCurrentUser(): Observable<User> {
  console.log("start")
  return this.user$.pipe(
    switchMap((user: any) => {
      // check if we already have user data
      console.log(user)
      if (user) {
        this.isAuthenticated.next(true);
        return of(user);
      }

      const token = this.localStorageService.getItem('access');
      console.log(token)
      // if there is token then fetch the current user
      if (token) {
        this.isAuthenticated.next(true);
        this.fetchCurrentUser().subscribe({
          next: (response: Array<User>) => {
            this.user$.next(response[0] as User);
            return of(response[0])
          },
          error: (err: HttpErrorResponse) => {
            console.log(err)
            return of(null)
          }
        })
      }
      console.log("null")
      this.isAuthenticated.next(false);
      return of(null);
    })
  );
}

fetchCurrentUser(): Observable<User[]>{
  return this.http.get<Array<User>>(this.apiService.getUserUrl)
}
  

/*
fetchCurrentUser(): any {
  await this.getUser()
}*/
  
  /*return this.http.get<django_pagination>(this.apiService.getUserUrl)
  
    .pipe(
      tap((datas: django_pagination) => {
        this.user$.next(datas.results[0] as User);
      })
    );
}
*/
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
