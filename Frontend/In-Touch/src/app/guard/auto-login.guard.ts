import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { UserManagerProviderService } from './../services/user-manager-provider.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard  {

  constructor(
    private authService: AuthenticationService, 
    private router: Router) { }

  canLoad(): Observable<boolean> {
		return new Observable((observer: Observer<boolean>) => {
      this.authService.isAuthenticated.pipe(
			//filter((val) => val !== null), // Filter out initial Behaviour subject value
			take(1), // Otherwise the Observable doesn't complete!
			map((isAuthenticated) => {
				console.log('Found previous token, automatic login');
				if (isAuthenticated === true) {
					// Directly open inside area
          this.router.navigate(['/tabs'], { replaceUrl: true });
					//this.router.navigateByUrl('/tabs', { replaceUrl: true });
				} else {
					// Simply allow access to the login
					observer.next(true)
				}
			})
		);
    })
	}
  
  
  /*
  canLoad(): Observable<boolean> {    
    return new Observable((observer: Observer<boolean>) => {
      this.authService.user$.pipe(
        filter(val => val !== null), // Filter out initial Behaviour subject value
        take(1), // Otherwise the Observable doesn't complete!
        map(isAuthenticated => {
          console.log('Found previous token ?, automatic login '+isAuthenticated);
          if (isAuthenticated) {
            //Load user 
            this.userManager.getItem("user").then((user: any)=>{
              console.log("Log user",user)
              
              // Directly open inside area       
            this.router.navigateByUrl('/tabs', { replaceUrl: true });
            })
          }
          //} else {          
            // Simply allow access to the login
            return true;
          //}
        })
      );
    })
  }*/
}
