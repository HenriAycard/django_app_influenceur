import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonList, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, create, logoInstagram, logoTiktok, logoYoutube } from 'ionicons/icons';
import { Application } from 'src/app/shared/models';
import { RatingStarsComponent } from 'src/app/features/reviews/ui/rating-stars/rating-stars.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html',
  styleUrls: ['./booking-view.component.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonCardContent, IonCard, IonCardHeader, IonCardTitle, DatePipe, IonIcon, CommonModule, IonChip, IonText, IonItem, IonList, RatingStarsComponent]
})
export class BookingViewPage {
  @Input() reservation!: Application;

  private router = inject(Router)
  private activatedRoute = inject(ActivatedRoute)

  constructor() {
    addIcons({ logoInstagram, logoTiktok, logoYoutube, checkmarkCircle, create, closeCircle });
  }

  navToOffer() {
    this.router.navigate(['offer', this.reservation.offer.id], { relativeTo: this.activatedRoute });
  }

  navToVenue() {
    this.router.navigate(['influencer/home/search/venue', this.reservation.offer.venue.id]);
  }
}