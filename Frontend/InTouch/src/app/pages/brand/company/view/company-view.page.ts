import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonButton, IonCard, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownCircle, close, closeOutline, createOutline, eyeOutline, locationOutline, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube, trashOutline } from 'ionicons/icons';
import { combineLatest } from 'rxjs';
import { CompanyMainViewPage } from 'src/app/modal/company/main-view/company-main-view.component';
import { CompanySkeletonComponent } from 'src/app/modal/company/skeleton/company-skeleton.component';
import { ContractCardComponent } from 'src/app/modal/contract/card/contract-card.component';
import { Company } from 'src/app/models/company';
import { Deal } from 'src/app/models/deal';
import { ActionPayload } from 'src/app/models/role';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { ApiDealService } from 'src/app/services/api/api-deal.service';
import { ReloadService } from 'src/app/services/reload.service';


@Component({
    selector: 'app-company-view',
    templateUrl: './company-view.page.html',
    styleUrls: ['./company-view.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule, IonLabel, IonItem, IonIcon, IonRefresher, IonRefresherContent, IonFab, IonFabList, IonFabButton, RouterModule, ContractCardComponent, IonButton, CompanyMainViewPage, CompanySkeletonComponent]
})
export class CompanyViewPage implements OnInit {
  @Input() companyId!: number;
  
  public company: Company = {} as Company;
  public deals: Deal[] = [];
  public loaded : boolean = false;

  private apiCompany = inject(ApiCompanyService)
  private apiDeal = inject(ApiDealService)
  private reloadService = inject(ReloadService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController) {
        addIcons({createOutline, trashOutline, close, chevronDownCircle, locationOutline, logoInstagram, logoYoutube, logoTiktok, logoTwitter, logoFacebook, closeOutline});
    }

  ngOnInit() {
    // Event to reload data
    this.reloadService.reload$.subscribe(() => {
      this.reloadData();
    });

    this.callApiService()
  }

  public reloadData() {
    this.callApiService();
  }

  public async callApiService(){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait ...',
      duration: 2000
    });
    loading.present();

    combineLatest([
        this.apiCompany.findCompanyById(this.companyId),
        this.apiDeal.findDealByCompanyId(this.companyId)
      ]).subscribe({
        next: ([company, deals]) => {
            this.company = company as Company
            this.company.openings.sort((a, b) => a.idDay - b.idDay);
            this.deals = deals as Deal[];
            this.loaded = true
        },
        complete: () => {
            loading.dismiss();
        }
    });
  }

  public handleRefresh($event: any){
    setTimeout(() => {
        this.reloadData()
        $event.target.complete();        
      }, 2000);
  }

  onActionPerformed(payload: ActionPayload<number>) {
    const { action, data } = payload;

    if (action === 'view') {
      this.router.navigate(['contract', data], { relativeTo: this.route });
    } else if (action === 'edit') {
      this.router.navigate(['contract', data, 'edit'], { relativeTo: this.route })
    } else if (action === 'delete') {
      this.deleteDeal(data);
    }
  }

  deleteDeal(id: number) {
    this.apiDeal.deleteDeal(id).subscribe({
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