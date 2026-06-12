import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircle, calendarOutline, cashOutline, chevronForward, checkmarkCircle, mailOutline, timeOutline,
  closeCircle, documentTextOutline, listOutline, logoInstagram, logoTiktok, logoYoutube,
} from 'ionicons/icons';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { RatingBadgeComponent } from 'src/app/features/reviews/ui/rating-badge/rating-badge.component';

type StatusMeta = { label: string; cls: string; icon: string };

/**
 * Premium collaboration detail view (shared by the influencer + brand pages).
 * A full-bleed venue hero with a gradient scrim flows into a rounded content
 * sheet: status, the offer, and the counterparty. Presentational only.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html',
  styleUrls: ['./booking-view.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, IonIcon, RatingBadgeComponent],
})
export class BookingViewPage {
  @Input() reservation!: Application;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    addIcons({
      alertCircle, calendarOutline, cashOutline, chevronForward, checkmarkCircle, mailOutline, timeOutline,
      closeCircle, documentTextOutline, listOutline, logoInstagram, logoTiktok, logoYoutube,
    });
  }

  /** Display status derived from the raw lifecycle + whether the date has passed. */
  get status(): StatusMeta {
    const s = this.reservation?.status;
    if (s === ApplicationStatus.Declined) return { label: 'Declined', cls: 'is-declined', icon: 'close-circle' };
    if (s === ApplicationStatus.Invited) return { label: 'Invited', cls: 'is-pending', icon: 'mail-outline' };
    if (s === ApplicationStatus.Pending) return { label: 'Pending', cls: 'is-pending', icon: 'time-outline' };
    const past = !!this.reservation?.dateReservation && new Date(this.reservation.dateReservation) < new Date();
    return past
      ? { label: 'Completed', cls: 'is-completed', icon: 'checkmark-circle' }
      : { label: 'Confirmed', cls: 'is-confirmed', icon: 'checkmark-circle' };
  }

  get heroImage(): string {
    return this.reservation?.offer?.venue?.imgVenue?.[0]?.file || 'assets/profile/default-profile.png';
  }

  get initials(): string {
    const u = this.reservation?.user;
    return ((u?.firstname?.[0] ?? '') + (u?.lastname?.[0] ?? '')) || '?';
  }

  navToOffer() {
    this.router.navigate(['offer', this.reservation.offer.id], { relativeTo: this.activatedRoute });
  }

  navToVenue() {
    this.router.navigate(['influencer/home/search/venue', this.reservation.offer.venue.id]);
  }
}
