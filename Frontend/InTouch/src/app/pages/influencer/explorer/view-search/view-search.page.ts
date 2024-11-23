import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { CompanySortDto } from 'src/app/models/company';
import { Params, Router, RouterLink } from '@angular/router';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';

@Component({
  selector: 'app-view-search',
  templateUrl: './view-search.page.html',
  styleUrls: ['./view-search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButtons, IonBackButton, RouterLink]
})
export class ViewSearchPage implements OnInit {

  public parameters: Params | undefined
  public datas: Array<CompanySortDto> = new Array<CompanySortDto>();
  private apiCompany = inject(ApiCompanyService)

  constructor(
    public router:Router,
  ) { }
  
    ngOnInit() {
      const navigation = this.router.getCurrentNavigation();
      this.parameters = navigation?.extractedUrl.queryParams
      this.findCompanyBySearch();
    }

    public findCompanyBySearch(){
      this.apiCompany.findCompanyBySearch(this.parameters?.['search']).subscribe({
        next: (response: CompanySortDto[]) => {
          this.datas = response as CompanySortDto[];
        }
      })
    }
}
