import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
//import { CreateActivityPageModule } from '../create-activity/create-activity.module'

@Component({
  selector: 'app-view-activity',
  templateUrl: './view-activity.page.html',
  styleUrls: ['./view-activity.page.scss'],
})
export class ViewActivityPage implements OnInit {
  id: any;
  nameCompany: string = ""
  lstActivity = []
  //component = CreateActivityPageModule;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      //Get info 
      
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {id: number, nameCompany: string}
    this.id = state.id
    this.nameCompany = state.nameCompany
    this.findActivityByCompanyId()

  }

  public findActivityByCompanyId(){
    /*
    this.apiService.findActivityByCompanyId(this.id).subscribe((data: any)=>{
      this.lstActivity = data.results
      console.log("[ngOnInit] - findActivityByCompanyId - subscribe - data.results")
      console.log(this.lstActivity)
    })
    */
  }

  public showDetail(activityId: any){ 
    console.log("[showDetail] - navigationExtras: NavigationExtras")
    let navigationExtras: NavigationExtras = {
      state: {
        id: this.id,
        nameCompany: this.nameCompany,
        idActivity: activityId
      },
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['../view-offre'], navigationExtras)
    
  }

  public newActivity(){
    console.log("[newActivity] - navigationExtras: NavigationExtras")
    let navigationExtras: NavigationExtras = {
      state: {
        id: this.id,
        nameCompany: this.nameCompany
      },
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['../create-activity'], navigationExtras)
  }

  public handleRefresh($event: any){
    setTimeout(() => {
      this.findActivityByCompanyId()
      $event.target.complete();
      }, 2000);
  }


}
