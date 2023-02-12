import { Component } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  isInfluencer : boolean = true;
  title = "Authenticated"

  constructor(
    public userManager:UserManagerProviderService,
    private authService: AuthenticationService) {
      
      this.authService.fetchCurrentUser().subscribe({
        next: (value: any) => {
          console.log("[TabsPage] - constructor - data")
        this.authService.user$.next(value.results[0])
        this.isInfluencer = value.results[0].is_influenceur

      },
      error(err) {
        console.log(err)
      },
    })
        

      //Get info 
      /*
      this.apiService.getAllUser().subscribe((data: any)=>{
        console.log("[TabsPage] - constructor - data")
        console.log(data)
        if (!data.results[0].is_influenceur){
          this.isCompany = true;
        }
      })
      this.apiService.getUserMe().subscribe((data: any)=>{
        console.log(data)
      })
      */
    }

}
