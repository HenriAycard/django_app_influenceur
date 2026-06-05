import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButton, IonButtons, IonBackButton, IonLabel } from '@ionic/angular/standalone';
import { CompanySortDto } from 'src/app/models/company';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiCompanyService } from 'src/app/services/api/api-company.service';
import { NavigationHistoryService } from 'src/app/services/navigation-history.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardTitle, IonChip, IonCardContent, IonCardSubtitle, IonCardHeader, IonButtons, IonBackButton, IonLabel]
})
export class SearchPage implements OnInit {

  public parameters: Params | undefined
  public datas: Array<CompanySortDto> = new Array<CompanySortDto>();

  private apiCompany = inject(ApiCompanyService)
  private navHistoService = inject(NavigationHistoryService)
  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)

  constructor() { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.parameters = navigation?.extractedUrl.queryParams
    this.findCompanyBySearch();
  }

  public findCompanyBySearch() {
    this.apiCompany.findCompanyBySearch(this.parameters?.['search']).subscribe({
      next: (response: CompanySortDto[]) => {
        this.datas = response as CompanySortDto[];
      }
    })
  }

  navToCompany(id: number) {
    this.navHistoService.addToHistory(this.router.url);
    this.router.navigate(['company', id], { relativeTo: this.activatedRoute });
  }
}
