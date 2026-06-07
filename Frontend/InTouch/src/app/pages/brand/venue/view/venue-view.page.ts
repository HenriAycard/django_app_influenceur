
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonItem, IonLabel, IonRefresher, IonRefresherContent, LoadingController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownCircle, close, closeOutline, createOutline, eyeOutline, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube, trashOutline } from 'ionicons/icons';
import { VenueMainViewPage } from 'src/app/modal/venue/main-view/venue-main-view.component';
import { VenueSkeletonComponent } from 'src/app/modal/venue/skeleton/venue-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { ActionPayload } from 'src/app/shared/models';
import { VenueStore } from 'src/app/features/venues/venue.store';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-view',
    templateUrl: './venue-view.page.html',
    styleUrls: ['./venue-view.page.scss'],
    standalone: true,
    imports: [IonContent, IonLabel, IonItem, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabList, IonFabButton, RouterModule, OfferCardComponent, IonButton, VenueMainViewPage, VenueSkeletonComponent]
})
export class VenueViewPage {
  @Input() venueId!: number;

  protected readonly store = inject(VenueStore);
  private loadingController = inject(LoadingController);

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
        addIcons({createOutline, trashOutline, close, chevronDownCircle, locationOutline, logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, closeOutline});
    }

  // Reloads on every entry (incl. returning from the edit/offer pages).
  ionViewWillEnter() {
    this.load();
  }

  public handleRefresh($event: RefresherCustomEvent) {
    this.load(() => $event.target.complete());
  }

  private async load(onDone?: () => void){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    this.store.load(this.venueId).subscribe({
      complete: () => { loading.dismiss(); onDone?.(); },
      error: () => { loading.dismiss(); onDone?.(); },
    });
  }

  onActionPerformed(payload: ActionPayload<number>) {
    const { action, data } = payload;

    if (action === 'view') {
      this.router.navigate(['offer', data], { relativeTo: this.route });
    } else if (action === 'edit') {
      this.router.navigate(['offer', data, 'edit'], { relativeTo: this.route })
    } else if (action === 'delete') {
      this.deleteOffer(data);
    }
  }

  deleteOffer(id: number) {
    this.store.deleteOffer(id).subscribe({
      complete: () => this.load(),
    })
  }

  public editVenue() {
    this.router.navigate(['edit'], { relativeTo: this.route})
  }

  public back() {
    this.router.navigate(['/brand/home'])
  }
}
