import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { catchError, retry, BehaviorSubject } from 'rxjs';
import { CreateOfferDto } from 'src/app/models/activity-model';

export interface queryParamsDto {
  id: number;
  nameCompany: string;
  idActivity: number;
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
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // Get query params
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extras.state as queryParamsDto
  }

  async saveOffer(newOffer: CreateOfferDto){
      this.apiService.showLoading();
      this.apiService.createOffer(newOffer).subscribe({
        next: (value: any) => {
          console.log("[CREATE-OFFER] - saveOffer - end OK")
          this.apiService.stopLoading();
        },
        error: (err: any) => {
            console.error("[CREATE-OFFER] - saveOffer - end KO")
            console.log(err);// Error getting the data
        },
        complete: () => {
          console.info('Complete')
        },
      })
    
  }

  register(form: any) {
    let newOffer: CreateOfferDto = {
      nameOffer: form.value.nameOffer,
      descriptionOffer: form.value.descriptionOffer,
      descriptionCondition: form.value.descriptionCondition,
      activity: this.parameters.idActivity
    }
    this.saveOffer(newOffer);

    let navigationExtras: NavigationExtras = {
      state: this.parameters,
      relativeTo: this.activatedRoute
    };
    this.router.navigate(['../view-offre'], navigationExtras)
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }
}
