import { Component,OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApiserviceService } from './services/apiservice.service'
import { Router } from '@angular/router';
import { NavDataServiceService } from './services/nav-data-service.service';
import { UserManagerProviderService } from './services/user-manager-provider.service';
import { UtilsProviderService } from './services/utils-provider';
import { AuthenticationService } from './services/authentication.service';
import { Observable } from 'rxjs';
import { User } from './services/entities';
import { filter, share } from 'rxjs/operators';

import {delay} from 'rxjs/operators';
import { Preferences } from '@capacitor/preferences';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent  implements OnInit{
  user$: Observable<User>;
  //user: User;

  constructor(
    private platform: Platform,
    public apiService: ApiserviceService,
    public router: Router,
    public navDataService: NavDataServiceService,
    public userManager: UserManagerProviderService,
    public utilsProvider: UtilsProviderService,
    public authService: AuthenticationService)
    { }
 

  ngOnInit() {
    this.authService.fetchCurrentUser().subscribe({
      next: (response: Array<User>) => {
        if (response.length === 1) {
          if (response[0].is_influencer) {
            this.router.navigateByUrl('influenceur');
          } else {
            this.router.navigateByUrl('/brand');
          }
        } else {
          this.router.navigateByUrl('/login');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.router.navigateByUrl('/login');
      }
    })
  }
/*
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  authenticate() {
    console.log("--------- need to authenticate ---------")
    this.router.navigateByUrl("/register")
  }
 */
}