
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonModal, IonRefresher, IonRefresherContent, RefresherCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube } from 'ionicons/icons';
import { VenueMainViewPage } from 'src/app/modal/venue/main-view/venue-main-view.component';
import { VenueSkeletonComponent } from 'src/app/modal/venue/skeleton/venue-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { Application, Offer, ActionPayload } from 'src/app/shared/models';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ToastService } from 'src/app/services/toast.service';
import { VenueStore } from 'src/app/features/venues/venue.store';
import { VenueReviewsComponent } from 'src/app/features/reviews/ui/venue-reviews/venue-reviews.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-venue',
  templateUrl: './venue.page.html',
  styleUrls: ['./venue.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonItem, IonIcon, IonFab, IonFabButton, IonRefresher, IonRefresherContent, ReactiveFormsModule, VenueMainViewPage, VenueSkeletonComponent, OfferCardComponent, VenueReviewsComponent]
})
export class VenuePage implements OnInit {
  @Input() venueId!: number;

  protected readonly store = inject(VenueStore);

  public canDismiss = false;
  public isModalOpen = false;
  public resaDay: Application | null = null;
  public idOffer : number = 0;
  public presentingElement: Element | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  private alertCtrlService = inject(AlertControllerService);
  private toastService = inject(ToastService)
  private router = inject(Router)
  private location = inject(Location)
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
    this.store.load(this.venueId).subscribe({
      error: () => this.toastService.toastDanger(
        'Error',
        'Sorry we are currently experiencing an error in our system, please try later'
      ),
      complete: () => { this.alertCtrlService.stopLoading(); onDone?.(); },
    })
  }

  public handleRefresh($event: RefresherCustomEvent) {
    this.load(() => $event.target.complete());
  }

  onActionPerformed(payload: ActionPayload<number>) {
    const { action, data } = payload;
    if (action === 'view') {
      this.router.navigate(['offer', data], { relativeTo: this.activatedRoute });
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
    // History-based pop: returns to wherever we came from (home feed OR search),
    // and avoids the Ionic nav-stack desync that looped back into the offer.
    this.location.back()
  }

}
