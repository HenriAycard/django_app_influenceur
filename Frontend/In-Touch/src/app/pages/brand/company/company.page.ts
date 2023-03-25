import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { MainCompanyDto } from 'src/app/models/activity-model';


@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnInit {

  lstCompanys: Array<MainCompanyDto> = []

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      //Get info 
      this.apiService.findCompany().subscribe((data: any)=>{
        this.lstCompanys = data.results
        console.log(this.lstCompanys)
    })
  }

  ngOnInit() {
  }

  public showDetail(companySearch: MainCompanyDto){ 
    console.log("[showDetail] - navigationExtras: NavigationExtras")
    let navigationExtras: NavigationExtras = {
      state: {
          id: companySearch.id,
          nameCompany: companySearch.nameCompany
      },
      relativeTo: this.activatedRoute
    };
    console.log(navigationExtras)

    this.router.navigate(['view-offre'], navigationExtras)
    
  }




}
