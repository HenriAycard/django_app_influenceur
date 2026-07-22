
import { ChangeDetectionStrategy, Component, computed, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertController, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonItem, IonLabel, IonRefresher, IonRefresherContent, LoadingController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownCircle, close, closeOutline, createOutline, eyeOutline, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube, statsChartOutline, trashOutline } from 'ionicons/icons';
import { VenueMainViewPage } from 'src/app/modal/venue/main-view/venue-main-view.component';
import { VenueSkeletonComponent } from 'src/app/modal/venue/skeleton/venue-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { ActionPayload } from 'src/app/shared/models';
import { VenueStore } from 'src/app/features/venues/venue.store';
import { VenueReviewsComponent } from 'src/app/features/reviews/ui/venue-reviews/venue-reviews.component';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-view',
    templateUrl: './venue-view.page.html',
    styleUrls: ['./venue-view.page.scss'],
    standalone: true,
    imports: [IonContent, IonLabel, IonItem, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabList, IonFabButton, RouterModule, OfferCardComponent, IonButton, VenueMainViewPage, VenueSkeletonComponent, VenueReviewsComponent]
})
export class VenueViewPage {
  @Input() venueId!: number;

  protected readonly store = inject(VenueStore);
  private loadingController = inject(LoadingController);
  private alertController = inject(AlertController);
  private toast = inject(ToastService);

  protected readonly activeOffers = computed(() => this.store.offers().filter(o => !o.archivedAt));
  protected readonly archivedOffers = computed(() => this.store.offers().filter(o => !!o.archivedAt));

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
        addIcons({createOutline, trashOutline, statsChartOutline, close, chevronDownCircle, locationOutline, logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, closeOutline});
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
      this.editOffer(data);
    } else if (action === 'archive') {
      this.confirmArchive(data);
    } else if (action === 'duplicate') {
      this.duplicateOffer(data);
    }
  }

  // Frozen terms can't be edited in place: offer the duplicate path instead.
  private async editOffer(id: number) {
    const offer = this.store.offers().find(o => o.id === id);
    if (offer?.isEditable === false) {
      const alert = await this.alertController.create({
        header: 'Terms are frozen',
        message: 'Influencers have applied to this offer, so the agreed terms cannot change. Duplicate it to edit a fresh copy.',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          { text: 'Duplicate', handler: () => this.duplicateOffer(id) },
        ],
      });
      await alert.present();
      return;
    }
    this.router.navigate(['offer', id, 'edit'], { relativeTo: this.route });
  }

  // The point of duplicating is editing the copy: go there directly.
  duplicateOffer(id: number) {
    this.store.duplicateOffer(id).subscribe({
      next: (offer) => this.router.navigate(['offer', offer.id, 'edit'], { relativeTo: this.route }),
      error: () => this.toast.toastDanger('Duplicate failed', 'Something went wrong. Please try again.'),
    })
  }

  // Archiving is one-way (no unarchive endpoint): confirm before committing.
  private async confirmArchive(id: number) {
    const alert = await this.alertController.create({
      header: 'Archive this offer?',
      message: 'Influencers will no longer see it or apply to it. Ongoing collaborations are not affected. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Archive', role: 'destructive', handler: () => this.archiveOffer(id) },
      ],
    });
    await alert.present();
  }

  archiveOffer(id: number) {
    this.store.archiveOffer(id).subscribe({
      complete: () => this.load(),
      error: () => this.toast.toastDanger('Archive failed', 'Something went wrong. Please try again.'),
    })
  }

  public editVenue() {
    this.router.navigate(['edit'], { relativeTo: this.route})
  }

  public viewAnalytics() {
    this.router.navigate(['analytics'], { relativeTo: this.route })
  }

  public back() {
    this.router.navigate(['/brand/home'])
  }
}
