import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActivityDto, OfferDto } from 'src/app/models/activity-model';
import { django_pagination } from './contract/contract.page';
import { HttpErrorResponse } from '@angular/common/http';

export interface queryParamsDto {
  search: string;
}

@Component({
  selector: 'app-view-search',
  templateUrl: './view-search.page.html',
  styleUrls: ['./view-search.page.scss'],
})
export class ViewSearchPage implements OnInit {

  public parameters: queryParamsDto
  public datas: Array<ActivityDto> = new Array<ActivityDto>();

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) { 
      
    }
  
    ngOnInit() {
      const navigation = this.router.getCurrentNavigation();
      this.parameters = navigation?.extras.state as queryParamsDto
      this.findActivityBySearch();
    }

    public async findActivityBySearch(){
      this.apiService.showLoading();
      await this.apiService.findActivityBySearch(this.parameters.search).subscribe({
        next: (response: django_pagination) => {
          this.datas = response.results as Array<ActivityDto>
        },
        error: (err: HttpErrorResponse) => {
          console.log(err)
        },
        complete: () => {
          this.apiService.stopLoading();
        }
      })
    }

    public showDetail(activityId: any, name: any){ 
      console.log("[showDetail] - navigationExtras: NavigationExtras")
      let navigationExtras: NavigationExtras = {
        state: {
          nameActivity: name,
          idActivity: activityId
        },
        relativeTo: this.activatedRoute
      };
      this.router.navigate(['contract'], navigationExtras)
      
    }

  

}
