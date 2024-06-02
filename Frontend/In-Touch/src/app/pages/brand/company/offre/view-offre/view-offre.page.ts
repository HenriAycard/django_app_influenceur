import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CompanyDto, OfferDto } from 'src/app/models/activity-model';
import { combineLatest } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';


export interface queryParamsDto {
  id: number;
  nameCompany: string;
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
  public datas: CompanyDto = {} as CompanyDto;
  public datasOffer: Array<OfferDto> = Array<OfferDto>(new OfferDto);
  public loaded : boolean = false;


  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    private location: Location,
    private loadingController: LoadingController) {
    
  }

  ngOnInit() {
    // Get query params
    console.log("[VIEW-OFFRE] - Initialization page")
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extractedUrl.queryParams as queryParamsDto
    this.callApiService()
  }

  public async callApiService(){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    combineLatest([
      this.apiService.findCompanyById(this.parameters.id),
      this.apiService.findOfferById(this.parameters.id)
    ]).subscribe({
      next: ([first, second]) => {
        this.datas = first as CompanyDto
        this.datasOffer = second as OfferDto[]
        loading.dismiss();
        this.loaded = true
      },
      error: (err: HttpErrorResponse) => {
        console.log(err)
      },
      complete: () => {
        console.log("[VIEW-OFFRE][HTTP] Complete findCompanyById & findOfferById")
      } 
    })     
  }

  public handleRefresh($event: any){
    setTimeout(() => {
        this.callApiService()
        $event.target.complete();        
      }, 2000);
  }


  public returnPreviousPage(): void{
    this.location.back();
  }

}
