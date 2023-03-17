import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AlertController } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { catchError, retry, BehaviorSubject } from 'rxjs';
import { ActivityDto, OfferDto, CreateReservationDto } from 'src/app/models/activity-model';
import { CheckboxCustomEvent } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

export interface queryParamsDto {
  nameActivity: string,
  idActivity: number
}

export interface django_pagination {
  count: number;
  next: any;
  previous: any;
  results: Array<Object>
}

@Component({
  selector: 'app-contract',
  templateUrl: './contract.page.html',
  styleUrls: ['./contract.page.scss'],
})
export class ContractPage implements OnInit {

  public parameters: queryParamsDto
  public datas: ActivityDto = new ActivityDto();
  public datasOffer: Array<OfferDto> = Array<OfferDto>(new OfferDto);
  public canDismiss = false;
  public isModalOpen = false;
  public resaDay: any;
  public newResa: CreateReservationDto = {} as CreateReservationDto

  presentingElement: Element | null = null;

  @ViewChild(IonModal) modal: IonModal;

  constructor(
    public userManager:UserManagerProviderService,
    public apiService:ApiserviceService,
    public alertController: AlertController,
    public router:Router,
    public activatedRoute: ActivatedRoute) {
    
  }

  ngOnInit() {
    // Get query params
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extras.state as queryParamsDto
    this.findActivityByIdActivity()
    this.findOffreByIdActivity()
    this.presentingElement = document.querySelector('.ion-page');
  }

  public async findActivityByIdActivity(){
    this.apiService.findActivityById(this.parameters.idActivity).subscribe(
      data => {
        this.datas = data as ActivityDto
      }
    )
  }

  public async findOffreByIdActivity(){
    this.apiService.findOfferById(this.parameters.idActivity).subscribe(
      (data: django_pagination) => {
        console.log(data)
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
        this.findActivityByIdActivity()
        this.findOffreByIdActivity()
        $event.target.complete();
      
        
      }, 2000);
  }

  public addContrat(){
    console.log("[addContrat] - Debut " + this.newResa)
    this.saveReservation(this.newResa);
    
  }

  async saveReservation(newResa: CreateReservationDto) {
    this.apiService.showLoading();
    this.apiService.createReservation(newResa).subscribe({
      next: (value: any) => {
        console.log("[CREATE-RESA] - saveReservation - end OK")
      },
      error: (err: any) => {
          console.error("[CREATE-RESA] - saveReservation - end KO")
          console.log(err);// Error getting the data
      },
      complete: () => {
        console.info('Complete')
        this.apiService.stopLoading();
      },
    })
  }

  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string;

  setOpen(offer: number) {
    this.newResa.offer = offer
    this.isModalOpen = true;
  }

  cancel() {
    console.log("canc")
    this.canDismiss = true
    this.modal.dismiss(null, 'cancel')
      .then(val => {
        this.canDismiss = false
        this.isModalOpen = false
      })
  }

  confirm() {
    this.addContrat()
    this.modal.dismiss(null, 'confirm')
      .then(val => {
        this.canDismiss = false
        this.isModalOpen = false
      })
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    console.log(ev.detail.role)
    if (ev.detail.role === "confirm") {
      this.addContrat()
    }
  }

  onTermsChanged(event: Event) {
    const ev = event as CheckboxCustomEvent;
    this.canDismiss = ev.detail.checked;
  }



}
