import { Component } from '@angular/core';
import { IonSearchbar } from '@ionic/core/components';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  infoAboutMe : any;
  title = "Authenticated"

  searchVal: IonSearchbar;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      //Get info 
      /*
      this.apiService.getUserMe().subscribe((data: any)=>{
        if (data["status"]=="OK"){
          this.infoAboutMe = data;
        }
        else{
          this.title ="Unauthenticated"
          this.infoAboutMe=null;
        }
      
      })*/
    }
  
    search(val: string | null | undefined) {
      if (typeof val === 'string'){
        let navigationExtras: NavigationExtras = {
          state: { search: val},
          relativeTo: this.activatedRoute
        };
        this.router.navigate(['view-search'], navigationExtras)
    }
      
  }

}
