
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { Observable, Subject } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  /*
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }*/
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alertCtrl: AlertController) { }

    canLoad(): Observable<boolean> {    
      return this.authService.isAuthenticated.pipe(
        //filter(val => val !== null), // Filter out initial Behaviour subject value
        take(1), // Otherwise the Observable doesn't complete!
        map(isAuthenticated => {
          if (isAuthenticated) {  
         
            return true;
          } else {          
            this.router.navigate(['/login']);
            return false;
          }
        })
      );
    }

    /*
    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
      return new Observable<boolean>(observer => {

        this.authService.user$.pipe(
          take(1),
          map((user) => {
            console.log('Can activate: ', user);
            if (!user) {
              this.authService.isAuthenticated().subscribe(
                (response: boolean) => {
                  if (response) {
                    observer.next(true);
                  } else {
                    this.alertCtrl
                      .create({
                        header: 'Unauthorized',
                        message: 'You are not allowed to access that page.',
                        buttons: ['OK'],
                      })
                      .then((alert) => alert.present());

                    this.router.navigateByUrl('/login');
                    observer.next(false);
                  }
                }
              );
            } else {
              observer.next(true);
            }
          })
        );
      });
    }
    */

    /*
    canLoad(): Observable<boolean> {

      return this.authService.isAuthenticated().pipe(
        filter((val: any) => val !== null), // Filter out initial Behaviour subject value
        take(1), // Otherwise the Observable doesn't complete!
        map((isAuthenticated) => {
          if (isAuthenticated) {
            return true;
          } else {
            this.router.navigateByUrl('/login');
            return false;
          }
        })
      )
    }*/
  
}
