import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, UrlCreationOptions } from '@angular/router';
import { CompanyDto, MainCompanyDto, OfferDto } from 'src/app/models/activity-model';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';

export interface queryParamsDto {
  search: string;
  navigationId?: number;
}
export interface django_pagination {
  count: number;
  next: any;
  previous: any;
  results: Array<Object>
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
    public activatedRoute: ActivatedRoute,
    private location: Location) { 
      
    }
  
    ngOnInit() {
      console.log("[VIEW-SEARCH] - Initialization page")
      const navigation = this.router.getCurrentNavigation();
      this.parameters = navigation?.extractedUrl.queryParams as queryParamsDto
      this.findCompanyBySearch();
    }

    public async findCompanyBySearch(){
      await this.apiService.findCompanyBySearch(this.parameters.search).subscribe({
        next: (response: Array<MainCompanyDto>) => {
          this.datas = response as Array<MainCompanyDto>;
          console.log(this.datas)
        },
        error: (err: HttpErrorResponse) => {
          console.log(err)
        },
        complete: () => {
          console.log("[VIEW-SEARCH][HTTP] Complete findCompanyBySearch")
        }
      })
    }
}
