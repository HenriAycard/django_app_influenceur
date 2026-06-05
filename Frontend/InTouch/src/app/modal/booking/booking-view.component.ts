import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonList, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, create, logoInstagram, logoTiktok, logoYoutube } from 'ionicons/icons';
import { BookingBrand } from 'src/app/models/booking';
import { NavigationHistoryService } from 'src/app/services/navigation-history.service';

@Component({
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html',
  styleUrls: ['./booking-view.component.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonCardContent, IonCard, IonCardHeader, IonCardTitle, DatePipe, IonIcon, CommonModule, IonChip, IonText, IonItem, IonList]
})
export class BookingViewPage {
  @Input() reservation!: BookingBrand;

  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)
  private navHistoService = inject(NavigationHistoryService)

  constructor() {
    addIcons({ logoInstagram, logoTiktok, logoYoutube, checkmarkCircle, create, closeCircle });
  }

  navToContract() {
    this.router.navigate(['contract', this.reservation.offer.id], { relativeTo: this.activatedRoute });
  }

  navToCompany() {
    this.navHistoService.addToHistory(this.router.url);
    this.router.navigate(['influencer/home/search/company', this.reservation.offer.company.id]);
  }
}