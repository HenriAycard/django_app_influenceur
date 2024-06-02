import { Component, OnInit, ViewChild } from '@angular/core';
import { CompanyDto, OfferDto, CreateReservationDto } from 'src/app/models/activity-model';
import { CheckboxCustomEvent, LoadingController } from '@ionic/angular';
import { IonModal, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Location } from '@angular/common';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


export interface queryParamsDto {
  id: number
}

export interface django_pagination {
  count: number;
  next: any;
  previous: any;
  results: Array<Object>
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.page.html',
  styleUrls: ['./experience.page.scss'],
})
export class ExperiencePage implements OnInit {

  public parameters: queryParamsDto
  public datas: CompanyDto = {} as CompanyDto
  public datasOffer: Array<OfferDto> = Array<OfferDto>(new OfferDto);
  public canDismiss = false;
  public isModalOpen = false;
  public resaDay: any;
  public newResa: CreateReservationDto = {} as CreateReservationDto;
  public loaded : boolean = false;

  presentingElement: Element | null = null;

  @ViewChild(IonModal) modal: IonModal;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public router:Router,
    private location: Location,
    private loadingController: LoadingController,
    public toastController: ToastController) {
    
  }

  ngOnInit() {
    // Get query params
    console.log("[EXPERIENCE] - Initialization page")
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extractedUrl.queryParams as queryParamsDto
    this.callApiService()
    this.presentingElement = document.querySelector('.ion-page');
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
      },
      error: (err: HttpErrorResponse) => {
        console.log(err)
        this.presentToast(
          'Error',
          'Sorry we are currently experiencing an error in our system, please try later',
          'top',
          'danger'
        )
      },
      complete: () => {
        loading.dismiss();
        this.loaded = true
        console.log("[EXPERIENCE][HTTP] Complete findCompanyById & findOfferById")
      } 
    })     
  }


  public handleRefresh($event: any){
    setTimeout(() => {
        this.callApiService()
        $event.target.complete();
      }, 2000);
  }

  async saveReservation() {
    console.log("[EXPERIENCE] - saveReservation - Debut - " + this.newResa.dateReservation)

    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    this.apiService.createReservation(this.newResa).subscribe({
      next: (value: any) => {
        console.log("[EXPERIENCE] - saveReservation - OK")
        this.presentToast(
          'New reservation !',
          'A new reservation has been added to your calendar, please wait the brand confirm',
          'top',
          'success'
        )
      },
      error: (err: any) => {
          console.error("[EXPERIENCE] - saveReservation - KO")
          console.log(err);// Error getting the data
          this.presentToast(
            'We have a little problem',
            'Sorry your reservation failed',
            'top',
            'danger'
          )
      },
      complete: () => {
        console.info('[EXPERIENCE] - saveReservation - Complete')
        loading.dismiss();
      },
    })
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

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;

  setOpen(offer: number) {
    this.newResa.offer = offer
    this.isModalOpen = true;
  }

  cancel() {
    console.log("[EXPERIENCE][MODAL] - cancel - start")
    this.canDismiss = true
    console.log("[EXPERIENCE][MODAL] - cancel - canDismiss = true")
    this.modal.dismiss(null, 'cancel')
      .then(() => {
        this.canDismiss = false
        this.isModalOpen = false
      })
  }

  confirm() {
    console.log("[EXPERIENCE][MODAL] - confirm - start")
    if(this.canDismiss && this.newResa.dateReservation != null){
      this.saveReservation()
    } else if (!this.canDismiss) {
      this.presentToast(
        'Please complete all details',
        'You forgot to accept the terms and conditions',
        'top',
        'warning'
      )
    } else {
      this.presentToast(
        'Please complete all details',
        'You forgot to select a date and time',
        'top',
        'warning'
      )
    }
    this.modal.dismiss(null, 'confirm')
      .then(() => {
        this.canDismiss = false
        this.isModalOpen = false
      })
  }

  onTermsChanged(event: Event) {
    const ev = event as CheckboxCustomEvent;
    this.canDismiss = ev.detail.checked;
  }

  public returnPreviousPage(): void{
    this.location.back()
  }

}
