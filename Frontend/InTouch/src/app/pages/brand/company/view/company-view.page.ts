import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonButton, IonCard, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownCircle, close, closeOutline, createOutline, eyeOutline, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube, trashOutline } from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { CompanyMainViewPage } from 'src/app/modal/company/main-view/company-main-view.component';
import { CompanySkeletonComponent } from 'src/app/modal/company/skeleton/company-skeleton.component';
import { OfferCardComponent } from 'src/app/features/offers/ui/offer-card/offer-card.component';
import { Company } from 'src/app/models/company';
import { Offer } from 'src/app/shared/models';
import { ActionPayload } from 'src/app/models/role';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiOfferService } from 'src/app/features/offers/api-offer.service';


@Component({
    selector: 'app-company-view',
    templateUrl: './company-view.page.html',
    styleUrls: ['./company-view.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule, IonLabel, IonItem, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabList, IonFabButton, RouterModule, OfferCardComponent, IonButton, CompanyMainViewPage, CompanySkeletonComponent]
})
export class CompanyViewPage {
  @Input() companyId!: number;

  public company: Company = {} as Company;
  public deals: Offer[] = [];
  public loaded : boolean = false;

  private apiCompany = inject(ApiCompanyService)
  private apiOffer = inject(ApiOfferService)

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController) {
        addIcons({createOutline, trashOutline, close, chevronDownCircle, locationOutline, logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, closeOutline});
    }

  // Reloads on every entry (incl. returning from the edit/offer pages), which
  // replaces the old ReloadService refresh coupling.
  ionViewWillEnter() {
    this.callApiService();
  }

  public reloadData() {
    this.callApiService();
  }

  public async callApiService(onDone?: () => void){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    combineLatest([
        this.apiCompany.findCompanyById(this.companyId),
        this.apiOffer.findOffersByCompanyId(this.companyId)
      ]).subscribe({
        next: ([company, deals]) => {
            this.company = company as Company
            this.company.openings.sort((a, b) => a.idDay - b.idDay);
            this.deals = deals as Offer[];
            this.loaded = true
        },
        complete: () => {
            loading.dismiss();
            onDone?.();
        }
    });
  }

  public handleRefresh($event: any){
    this.callApiService(() => $event.target.complete());
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
    this.apiOffer.deleteOffer(id).subscribe({
      complete: () => {
          this.reloadData();
      }
    })
  }

  public editCompany() {
    this.router.navigate(['edit'], { relativeTo: this.route})
  }

  public back() {
    this.router.navigate(['/brand/home'])
  }
}
