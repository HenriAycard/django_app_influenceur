import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonModal, IonRefresher, IonRefresherContent, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube } from 'ionicons/icons';
import { CompanyMainViewPage } from 'src/app/modal/company/main-view/company-main-view.component';
import { CompanySkeletonComponent } from 'src/app/modal/company/skeleton/company-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { Offer } from 'src/app/shared/models';
import { ActionPayload } from 'src/app/models/role';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ToastService } from 'src/app/services/toast.service';
import { VenueStore } from 'src/app/features/venues/venue.store';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonIcon, IonFab, IonFabButton, IonRefresher, IonRefresherContent, ReactiveFormsModule, CompanyMainViewPage, CompanySkeletonComponent, OfferCardComponent]
})
export class CompanyPage implements OnInit {
  @Input() companyId!: number;

  protected readonly store = inject(VenueStore);

  public canDismiss = false;
  public isModalOpen = false;
  public resaDay: any;
  public idOffer : number = 0;
  public presentingElement: Element | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  private alertCtrlService = inject(AlertControllerService);
  private toastService = inject(ToastService)
  private router = inject(Router)
  private navCtrl = inject(NavController)
  private activatedRoute = inject(ActivatedRoute)

  constructor() {
    addIcons({ logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, close, locationOutline })
  }

  ngOnInit() {
    this.load()
    this.presentingElement = document.querySelector('.ion-page');
  }

  private load(onDone?: () => void) {
    this.alertCtrlService.showLoading()
    this.store.load(this.companyId).subscribe({
      error: () => this.toastService.toastDanger(
        'Error',
        'Sorry we are currently experiencing an error in our system, please try later'
      ),
      complete: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
    })
  }

  public handleRefresh($event: any){
    this.load(() => $event.target.complete());
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
