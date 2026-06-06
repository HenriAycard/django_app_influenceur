import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonItem, IonLabel, IonRefresher, IonRefresherContent, LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownCircle, close, closeOutline, createOutline, eyeOutline, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube, trashOutline } from 'ionicons/icons';
import { CompanyMainViewPage } from 'src/app/modal/company/main-view/company-main-view.component';
import { CompanySkeletonComponent } from 'src/app/modal/company/skeleton/company-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { ActionPayload } from 'src/app/models/role';
import { VenueStore } from 'src/app/features/venues/venue.store';


@Component({
    selector: 'app-company-view',
    templateUrl: './company-view.page.html',
    styleUrls: ['./company-view.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule, IonLabel, IonItem, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabList, IonFabButton, RouterModule, OfferCardComponent, IonButton, CompanyMainViewPage, CompanySkeletonComponent]
})
export class CompanyViewPage {
  @Input() companyId!: number;

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

  public handleRefresh($event: any){
    this.load(() => $event.target.complete());
  }

  private async load(onDone?: () => void){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    this.store.load(this.companyId).subscribe({
      complete: () => { loading.dismiss(); onDone?.(); },
      error: () => { loading.dismiss(); onDone?.(); },
    });
  }

  onActionPerformed(payload: ActionPayload<number>) {
    const { action, data } = payload;

    if (action === 'view') {
      this.router.navigate(['contract', data], { relativeTo: this.route });
    } else if (action === 'edit') {
      this.router.navigate(['contract', data, 'edit'], { relativeTo: this.route })
    } else if (action === 'delete') {
      this.deleteOffer(data);
    }
  }

  deleteOffer(id: number) {
    this.store.deleteOffer(id).subscribe({
      complete: () => this.load(),
    })
  }

  public editCompany() {
    this.router.navigate(['edit'], { relativeTo: this.route})
  }

  public back() {
    this.router.navigate(['/brand/home'])
  }
}
