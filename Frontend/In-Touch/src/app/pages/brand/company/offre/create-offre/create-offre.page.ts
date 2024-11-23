import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { Router } from '@angular/router';
import { CreateOfferDto } from 'src/app/models/activity-model';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

export interface queryParamsDto {
  id: number;
  nameCompany: string;
}



@Component({
  selector: 'app-create-offre',
  templateUrl: './create-offre.page.html',
  styleUrls: ['./create-offre.page.scss'],
})
export class CreateOffrePage implements OnInit {
  public parameters: queryParamsDto

  constructor(public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public router:Router,
    private location: Location,
    private loadingController: LoadingController,
    public toastController: ToastController
    ) { }

  ngOnInit() {
    // Get query params
    console.log("[CREATE-OFFRE] - Initialization page")
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extractedUrl.queryParams as queryParamsDto
  }

  async saveOffer(newOffer: CreateOfferDto){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    this.apiService.createOffer(newOffer).subscribe({
      next: (value: any) => {
        console.log("[CREATE-OFFER] - saveOffer - OK")
        this.presentToast(
          'New Contract !',
          'The new contract has been created !',
          'top',
          'success'
        )
      },
      error: (err: any) => {
          console.error("[CREATE-OFFER] - saveOffer - KO")
          console.log(err);// Error getting the data
          this.presentToast(
            'Error',
            'Sorry we are currently experiencing an error in our system, please try later',
            'top',
            'danger'
          )
      },
      complete: () => {
        console.info('[CREATE-OFFER][HTTP] Complete')
        loading.dismiss();
        this.location.back();
      },
    })
    
  }

  register(form: any) {
    let newOffer: CreateOfferDto = {
      nameOffer: form.value.nameOffer,
      descriptionOffer: form.value.descriptionOffer,
      descriptionCondition: form.value.descriptionCondition,
      company: this.parameters.id
    }
    this.saveOffer(newOffer);
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }

  async presentToast(header: string, message: string, position: 'top' | 'middle' | 'bottom', color: string){
    try {
      this.toastController.dismiss().then(() => {
      }).catch(() => {
      }).finally(() => {
      });
    } catch(e) {}
    
    this.toastController.create({
      header: header,
      message: message,
      position: position,
      duration: 10000,
      buttons: [{text: 'Dismiss',role: 'cancel'}],
      color: color
    }).then((toast) => {
      toast.present();
    });
  }
}
