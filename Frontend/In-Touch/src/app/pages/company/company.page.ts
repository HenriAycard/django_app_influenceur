import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnInit {

  lstCompanys = []

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

  public showDetail(id: any, nameCompany: string){
    
    let navigationExtras: NavigationExtras = {
      state: {
          id: id,
          nameCompany: nameCompany
      },
      relativeTo: this.activatedRoute
    };
    console.log(id)

    this.router.navigate(['view-activity'], navigationExtras)
  }

  async createCompanyBtn() {
    const alert = await this.alertController.create({
      header: "Please enter a company name",
      inputs: [
        {
          name: 'nameCompany',
          type: 'text',
          placeholder: 'Company name'
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
             
          }
        }, {
          text: "Confirm",
          handler: (data) => {
            if (data["nameCompany"]){
              this.apiService.showLoading().then(()=>{
                this.apiService.createCompany(data["nameCompany"]).subscribe(()=>{
                  this.apiService.stopLoading()
                  this.apiService.showMessage("Thanks","A new company has been save")
                })
              })
            }
          }
        }
      ]
    });

    await alert.present();
  }


}
