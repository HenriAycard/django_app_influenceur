import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { catchError, retry, BehaviorSubject, map } from 'rxjs';
import { CompanyDto, OfferDto } from 'src/app/models/activity-model';
import { NavigationService } from 'src/app/services/navigation.service';


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
  //public datas$: BehaviorSubject<CompanyDto> = new BehaviorSubject<CompanyDto>(new CompanyDto());
  public datas: CompanyDto = new CompanyDto();
  public datasOffer: Array<OfferDto> = Array<OfferDto>(new OfferDto);;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute,
    private navigation: NavigationService) {
    
  }

  ngOnInit() {
    // Get query params
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extras.state as queryParamsDto
    this.findCompanyByIdCompany()
    this.findOffreByIdActivity()
    
  }

  public async findCompanyByIdCompany(){
    this.apiService.findCompanyById(this.parameters.id).subscribe(
      (data: CompanyDto)  => {
        this.datas = data as CompanyDto
      }
    )
  }

  public async findOffreByIdActivity(){
    this.apiService.findOfferById(this.parameters.id).subscribe(
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
        this.findCompanyByIdCompany()
        this.findOffreByIdActivity()
        $event.target.complete();
      
        
      }, 2000);
  }


  public returnPreviousPage(): void{
    this.router.navigate(['../brand'])
  }

}
