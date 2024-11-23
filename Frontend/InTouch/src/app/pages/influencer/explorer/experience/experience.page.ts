import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxCustomEvent, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonRefresher, IonRefresherContent, IonSkeletonText, IonThumbnail, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';
import { Params, Router, RouterLink } from '@angular/router';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ToastService } from 'src/app/services/toast.service';
import { combineLatest } from 'rxjs';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiDealService } from 'src/app/services/api/api-deal.service';
import { Company } from 'src/app/models/company';
import { Deal } from 'src/app/models/deal';
import { ModalNewReservationComponent } from 'src/app/modal/modal-new-reservation.component';
import { addIcons } from 'ionicons';
import { logoInstagram, close, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.page.html',
  styleUrls: ['./experience.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSkeletonText, IonLabel, IonCard, IonCardContent, IonThumbnail, IonItem, IonListHeader, IonList, IonCheckbox, IonButton, IonButtons, IonModal, IonCardSubtitle, IonCardTitle, IonCardHeader, IonChip, IonIcon, IonFab, IonFabButton, IonRefresher, IonRefresherContent, RouterLink, ReactiveFormsModule, ModalNewReservationComponent]
})
export class ExperiencePage implements OnInit {

  public parameters!: Params
  public datas!: Company
  public datasOffer!: Deal[];
  public canDismiss = false;
  public isModalOpen = false;
  public resaDay: any;
  public loaded : boolean = false;
  public idOffer : number = 0;

  public presentingElement: Element | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  private alertCtrlService = inject(AlertControllerService);
  private toastService = inject(ToastService)
  private apiCompany = inject(ApiCompanyService)
  private apiDeal = inject(ApiDealService)

  constructor(
    public router:Router,
    private location: Location,
    ) {
      addIcons({logoInstagram, close, locationOutline})
    }

  ngOnInit() {
    // Get query params
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extractedUrl.queryParams as Params
    this.callApiService()
    this.presentingElement = document.querySelector('.ion-page');
  }

  public async callApiService(){
    this.alertCtrlService.showLoading()

    combineLatest([
      this.apiCompany.findCompanyById(this.parameters['id']),
      this.apiDeal.findDealById(this.parameters['id'])
    ]).subscribe({
      next: ([first, second]) => {
        this.datas = first as Company
        this.datasOffer = second as Deal[]
        this.loaded = true
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.toastDanger(
          'Error',
          'Sorry we are currently experiencing an error in our system, please try later'
        )
      },
      complete: () => this.alertCtrlService.stopLoading()
    })   
  }


  public handleRefresh($event: any){
    setTimeout(() => {
        this.callApiService()
        $event.target.complete();
      }, 2000);
  }

  setOpen(id: number) {
    this.idOffer = id
    this.isModalOpen = true;
  }

  onDismissChange(canDismiss: boolean) {
    this.canDismiss = canDismiss
    this.isModalOpen = false
  }

  public returnPreviousPage(): void{
    this.location.historyGo(-1)
  }

}
