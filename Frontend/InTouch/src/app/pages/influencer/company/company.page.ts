import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { IonBackButton, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonModal, IonRefresher, IonRefresherContent, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube } from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { CompanyMainViewPage } from 'src/app/modal/company/main-view/company-main-view.component';
import { CompanySkeletonComponent } from 'src/app/modal/company/skeleton/company-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { ModalNewReservationComponent } from 'src/app/modal/reservation/new/modal-new-reservation.component';
import { Company } from 'src/app/models/company';
import { Offer } from 'src/app/shared/models';
import { ActionPayload } from 'src/app/models/role';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonIcon, IonFab, IonFabButton, IonRefresher, IonRefresherContent, ReactiveFormsModule, CompanyMainViewPage, CompanySkeletonComponent, OfferCardComponent]
})
export class CompanyPage implements OnInit {
  @Input() companyId!: number;

  public company!: Company
  public deals!: Offer[];
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
  private apiOffer = inject(ApiOfferService)
  private router = inject(Router)
  private navCtrl = inject(NavController)
  private activatedRoute = inject(ActivatedRoute)

  constructor(
      private location: Location) {
      addIcons({logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, close, locationOutline})
    }

  ngOnInit() {
    // Get query params
    this.callApiService()
    this.presentingElement = document.querySelector('.ion-page');
  }

  public async callApiService(){
    this.alertCtrlService.showLoading()

    combineLatest([
      this.apiCompany.findCompanyById(this.companyId),
      this.apiOffer.findOffersByCompanyId(this.companyId)
    ]).subscribe({
      next: ([first, second]) => {
        this.company = first as Company
        this.company.openings.sort((a, b) => a.idDay - b.idDay);

        this.deals = second as Offer[]
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

  onActionPerformed(payload: ActionPayload<number>) {
    const { action, data } = payload;
    if (action === 'view') {
      this.router.navigate(['contract', data], { relativeTo: this.activatedRoute });
    }
  }

  setOpen(deal: Offer) {
    if (deal.id) {
      this.idOffer = deal.id
      this.isModalOpen = true;
      this.canDismiss = false;
    }
  }

  onDismissChange(canDismiss: boolean) {
    this.canDismiss = canDismiss
    this.isModalOpen = false
  }

  goBack() {
    this.navCtrl.back()
  }

  

}
