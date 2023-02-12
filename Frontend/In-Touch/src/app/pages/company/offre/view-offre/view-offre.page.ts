import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { catchError, retry, BehaviorSubject } from 'rxjs';
import { ActivityDto, OfferDto } from 'src/app/models/activity-model';


export interface queryParamsDto {
  id: number;
  nameCompany: string;
  idActivity: number;
}

export interface django_pagination {
  count: number;
  next: any;
  previous: any;
  results: Array<Object>
}

@Component({
  selector: 'app-view-offre',
  templateUrl: './view-offre.page.html',
  styleUrls: ['./view-offre.page.scss'],
})
export class ViewOffrePage implements OnInit {

  public parameters: queryParamsDto
  //public datas$: BehaviorSubject<ActivityDto> = new BehaviorSubject<ActivityDto>(new ActivityDto());
  public datas: ActivityDto = new ActivityDto();
  public datasOffer: Array<OfferDto> = Array<OfferDto>(new OfferDto);;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) {
    
  }

  ngOnInit() {
    // Get query params
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extras.state as queryParamsDto
    this.findActivityByIdActivity()
    this.findOffreByIdActivity()
    
  }

  public async findActivityByIdActivity(){
    this.apiService.findActivityById(this.parameters.idActivity).subscribe(
      data => {
        this.datas = data as ActivityDto
      }
    )
  }

  public async findOffreByIdActivity(){
    this.apiService.findOfferById(this.parameters.idActivity).subscribe(
      (data: django_pagination) => {
        this.datasOffer = data.results as OfferDto[]
      })
  }

  public newOffer(){
    console.log("[newOffer] - navigationExtras: NavigationExtras")
    let navigationExtras: NavigationExtras = {
      state: this.parameters,
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['../create-offre'], navigationExtras)
  }



  public handleRefresh($event: any){
    setTimeout(() => {
        this.findActivityByIdActivity()
        this.findOffreByIdActivity()
        $event.target.complete();
      
        
      }, 2000);
  }

}
