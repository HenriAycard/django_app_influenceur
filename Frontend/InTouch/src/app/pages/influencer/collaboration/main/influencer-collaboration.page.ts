
import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonInput, IonModal, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBack, calendarOutline, chatbubbleEllipsesOutline, checkmarkCircle, checkmarkCircleOutline, closeCircleOutline, documentTextOutline, linkOutline, timeOutline } from 'ionicons/icons';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';
import { saveBlob } from 'src/app/shared/util/download.util';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { BookingViewPage } from 'src/app/modal/booking/booking-view.component';
import { ReviewSectionComponent } from 'src/app/features/reviews/ui/review-section/review-section.component';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-influencer-collaboration',
  templateUrl: './influencer-collaboration.page.html',
  styleUrls: ['./influencer-collaboration.page.scss'],
  standalone: true,
  imports: [DatePipe, FormsModule, IonButton, IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonInput, IonModal, IonSpinner, BookingViewPage, ReviewSectionComponent]
})
export class InfluencerCollaborationPage {

  @Input() bookingId!: number;

  readonly reservation = signal<Application>({} as Application)
  readonly isLoad = signal(false)
  public readonly ApplicationStatus = ApplicationStatus;

  private store = inject(ApplicationStore)
  private messaging = inject(MessagingStore)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private navCtrl = inject(NavController)

  // ---- Propose-a-date flow (answer a brand invitation) ----
  readonly proposeOpen = signal(false);
  readonly proposing = signal(false);
  readonly minDate = new Date().toISOString();
  proposedDate: string = new Date().toISOString();

  constructor() {
    addIcons({ alertCircleOutline, arrowBack, calendarOutline, chatbubbleEllipsesOutline, checkmarkCircle, checkmarkCircleOutline, closeCircleOutline, documentTextOutline, linkOutline, timeOutline });
  }

  public openPropose(): void {
    this.proposedDate = new Date().toISOString();
    this.proposeOpen.set(true);
  }

  public submitProposal(): void {
    if (this.proposing()) return;
    this.proposing.set(true);
    this.store.proposeDate(this.reservation().id, new Date(this.proposedDate)).subscribe({
      next: () => {
        this.proposing.set(false);
        this.proposeOpen.set(false);
        this.toastService.toastSuccess('Date proposed', 'The venue has been notified and will confirm your date.');
        this.ionViewWillEnter();
      },
      error: (err) => {
        this.proposing.set(false);
        this.toastService.toastDanger('Proposal', err?.error?.detail ?? 'Could not propose this date. Please try again.');
      },
    });
  }

  public downloadContract(): void {
    this.store.downloadContract(this.reservation().id).subscribe({
      next: (blob) => saveBlob(blob, `intouch-contract-${this.reservation().id}.pdf`),
      error: () => this.toastService.toastDanger('Contract', 'Could not download the contract. Please try again.'),
    });
  }

  public addToCalendar(): void {
    this.store.downloadCalendar(this.reservation().id).subscribe({
      next: (blob) => saveBlob(blob, `intouch-collab-${this.reservation().id}.ics`),
      error: () => this.toastService.toastDanger('Calendar', 'Could not generate the calendar file. Please try again.'),
    });
  }

  public messageBrand(): void {
    const venue = this.reservation().offer.venue;
    // Influencer side: thread is scoped to this venue (the caller is the influencer).
    this.messaging.open(venue.id).subscribe({
      next: (conv) => {
        const base = this.router.url.split('/').slice(0, 2).join('/'); // '/influencer'
        this.navCtrl.navigateForward([`${base}/messages/${conv.id}`], {
          queryParams: { name: venue.nameVenue },
        });
      },
      error: () => this.toastService.toastDanger('Messaging', 'Could not open the conversation.'),
    });
  }

  goBack(): void {
    // Deterministic: this page is always reached from the calendar, so go there
    // directly (avoids a polluted history looping back into the offer detail).
    this.navCtrl.navigateBack('/influencer/calendar');
  }

  ionViewWillEnter(): void {
    this.store.findOne(this.bookingId).subscribe({
      next: (value: Application) => {
        this.reservation.set(value);
        this.isLoad.set(true);
      },
      error: () => this.isLoad.set(true),
    });
  }

  public cancelReservation() {
    this.store.decline(this.reservation().id).subscribe({
      next: () => {
        this.toastService.toastSuccess(
          'Reservation cancelled!',
          `The reservation of ${this.reservation().user.firstname} ${this.reservation().user.lastname} is cancelled`
        );
      },
      error: () => {
        this.toastService.toastDanger('Error', 'Sorry, we are having some issues at the moment. Please try again later.');
      },
      complete: () => {
        // The calendar reloads itself on ionViewWillEnter once we navigate to it.
        this.router.navigate(['influencer/calendar']);
      }
    });
  }

  /** True when the reservation date is still in the future (actions allowed). */
  public isFuture(): boolean {
    const d = this.reservation().dateReservation;
    return !!d && new Date(d) > new Date();
  }

  /** Lifecycle zone shows once the accepted visit has happened. */
  public isPastAccepted(): boolean {
    const r = this.reservation();
    return r.status === ApplicationStatus.Accepted && !this.isFuture();
  }

  public postUrl = '';
  readonly submittingPost = signal(false);

  public submitPost(): void {
    const url = this.postUrl.trim();
    if (!url || this.submittingPost()) return;
    this.submittingPost.set(true);
    this.store.submitPostLink(this.reservation().id, url).subscribe({
      next: (updated) => {
        this.submittingPost.set(false);
        this.reservation.set(updated);
        this.toastService.toastSuccess('Post shared', 'The venue has been notified. Thank you!');
      },
      error: (err) => {
        this.submittingPost.set(false);
        const detail = err?.error?.url ?? err?.error?.detail ?? 'Could not submit your link. Please try again.';
        this.toastService.toastDanger('Post link', Array.isArray(detail) ? detail.join(' ') : detail);
      },
    });
  }

}
