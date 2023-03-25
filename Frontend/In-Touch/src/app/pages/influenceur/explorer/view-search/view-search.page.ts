import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CompanyDto, MainCompanyDto, OfferDto } from 'src/app/models/activity-model';
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
  public datas: Array<MainCompanyDto> = new Array<MainCompanyDto>();

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
      this.findCompanyBySearch();
    }

    public async findCompanyBySearch(){
      await this.apiService.findCompanyBySearch(this.parameters.search).subscribe({
        next: (response: django_pagination) => {
          this.datas = response.results as Array<MainCompanyDto>
        },
        error: (err: HttpErrorResponse) => {
          console.log(err)
        },
        complete: () => {
          console.log("Complete findCompanyBySearch")
        }
      })
    }

    public showDetail(companySearch: MainCompanyDto){ 
      console.log("[showDetail] - navigationExtras: NavigationExtras")
      let navigationExtras: NavigationExtras = {
        state: {
          id: companySearch.id
        },
        relativeTo: this.activatedRoute
      };
      this.router.navigate(['contract'], navigationExtras)
      
    }

  

}
