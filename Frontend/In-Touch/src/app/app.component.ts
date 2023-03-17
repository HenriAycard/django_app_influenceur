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
    this.authService.getCurrentUser().subscribe(
      (response: User | null) => {
        console.log(response)
        if(response === null || typeof response === 'undefined') {
          this.router.navigate(['/login']);
        } else {
          if (response.is_influenceur) {
            this.router.navigate(['/influenceur']);
          } else {
            this.router.navigate(['/brand']);
          }
          
        }
      }
    )
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