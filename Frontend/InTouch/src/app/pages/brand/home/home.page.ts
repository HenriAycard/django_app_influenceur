import { Component, inject, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonListHeader, IonRefresher, IonRefresherContent, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router, ActivatedRoute, NavigationExtras, RouterModule } from '@angular/router';
import { CompanySortDto, ImgCompanyDto } from 'src/app/models/company';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { addCircleOutline, flash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonCard, IonCardContent, IonChip, IonCardTitle, IonCardSubtitle, IonCardHeader, IonIcon, IonButton, IonLabel, IonRefresher, IonRefresherContent, RouterModule, SlicePipe]
})
export class HomePage implements OnInit{

  lstCompanys: CompanySortDto[] = []

  private apiCompany = inject(ApiCompanyService);

  constructor(
    public router:Router,
    public activatedRoute: ActivatedRoute) {
      addIcons({addCircleOutline, flash});
  }

  public ngOnInit(): void {
    this.callApiService()
  }

  public handleRefresh($event: any): void{
    setTimeout(() => {
        this.callApiService()
        $event.target.complete();  
      }, 2000);
  }

  public callApiService(): void {
    //Get info 
    this.apiCompany.findCompany().subscribe({
      next: (data: CompanySortDto[]) => {
        this.lstCompanys = data
      }
    });
  }

  getPrincipalImage(company: any): string | null {
    if (!company?.imgCompany?.length) {
      return null; // No images
    }
  
    const principalImage = company.imgCompany.find((img: ImgCompanyDto) => img.isPrincipal);
    return principalImage?.file || null; // Return file or null if not found
  }

}
