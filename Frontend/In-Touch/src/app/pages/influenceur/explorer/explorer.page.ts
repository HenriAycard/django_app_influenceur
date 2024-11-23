import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, UrlCreationOptions } from '@angular/router';
import { IonSearchbar } from '@ionic/angular/standalone';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.page.html',
  styleUrls: ['./explorer.page.scss'],
})
export class ExplorerPage implements OnInit {

  infoAboutMe : any;
  title = "Authenticated"

  searchVal: IonSearchbar;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public router:Router,
    public activatedRoute: ActivatedRoute) {

    }

    ngOnInit(): void {
      
    }
  
    search(event: any, val: string | null | undefined) {
      console.log(event)
      if (event.key === 'Enter' && typeof val === 'string'){
        
        let navigationExtras: NavigationExtras = {
          queryParams: { search: val},
          relativeTo: this.activatedRoute
        };
        console.log("[EXPLORER] - search - " + val)
        this.router.navigate(['view-search'], navigationExtras)
    }
      
  }

}
