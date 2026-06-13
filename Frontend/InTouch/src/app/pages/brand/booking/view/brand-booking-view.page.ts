
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonModal, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, arrowBack, calendarOutline, chatbubbleEllipsesOutline, checkmarkCircle, checkmarkCircleOutline, closeCircleOutline, createOutline, documentTextOutline, linkOutline, timeOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { ApplicationStore } from 'src/app/features/applications/application.store';
import { MessagingStore } from 'src/app/features/messaging/messaging.store';
import { saveBlob } from 'src/app/shared/util/download.util';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { ModalEditReservationComponent } from 'src/app/modal/reservation/edit/modal-edit-reservation.component';
import { BookingViewPage } from 'src/app/modal/booking/booking-view.component';
import { ReviewSectionComponent } from 'src/app/features/reviews/ui/review-section/review-section.component';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-brand-booking-view',
  templateUrl: './brand-booking-view.page.html',
  styleUrls: ['./brand-booking-view.page.scss'],
  standalone: true,
  imports: [DatePipe, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonModal, IonSpinner, ModalEditReservationComponent, BookingViewPage, ReviewSectionComponent]
})
export class BrandBookingViewPage implements OnInit {

  @Input() bookingId!: number;
  @ViewChild(IonModal) modal!: IonModal;

  readonly reservation = signal<Application>({} as Application)
  readonly isLoad = signal(false)
  public isModalOpen = false;
  public presentingElement: Element | null = null;
  public readonly ApplicationStatus = ApplicationStatus;

  private store = inject(ApplicationStore)
  private messaging = inject(MessagingStore)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private navCtrl = inject(NavController)

  constructor() {
    addIcons({ alertCircleOutline, arrowBack, calendarOutline, chatbubbleEllipsesOutline, checkmarkCircle, checkmarkCircleOutline, createOutline, closeCircleOutline, documentTextOutline, linkOutline, timeOutline });
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

  public messageInfluencer(): void {
    const r = this.reservation();
    // Brand side: thread is scoped to this venue, with the applying influencer.
    this.messaging.open(r.offer.venue.id, r.user.id).subscribe({
      next: (conv) => {
        const base = this.router.url.split('/').slice(0, 2).join('/'); // '/brand'
        this.navCtrl.navigateForward([`${base}/messages/${conv.id}`], {
          queryParams: { name: `${r.user.firstname} ${r.user.lastname}`.trim() },
        });
      },
      error: () => this.toastService.toastDanger('Messaging', 'Could not open the conversation.'),
    });
  }

  goBack(): void {
    // Deterministic: this page is always reached from the calendar.
    this.navCtrl.navigateBack('/brand/calendar');
  }

  ngOnInit(): void {
    this.loadData()
  }

  public loadData(): void {
    this.store.findOne(this.bookingId).subscribe({
      next: (value: Application) => {
        this.reservation.set(value)
        this.isLoad.set(true)
      }
    })
  }

  public acceptReservation() {
    this.applyStatusChange(
      this.store.accept(this.reservation().id),
      'Reservation confirmed!',
      `The reservation of ${this.reservation().user.firstname} ${this.reservation().user.lastname} is confirmed`
    )
  }

  public cancelReservation() {
    this.applyStatusChange(
      this.store.decline(this.reservation().id),
      'Reservation cancelled!',
      `The reservation of ${this.reservation().user.firstname} ${this.reservation().user.lastname} is cancelled`
    )
  }

  /** Confirm the date the influencer proposed on a direct invitation (4 → 1). */
  public confirmProposedDate() {
    this.applyStatusChange(
      this.store.confirmDate(this.reservation().id),
      'Collaboration confirmed!',
      `The date proposed by ${this.reservation().user.firstname} ${this.reservation().user.lastname} is confirmed`
    )
  }

  async editReservation() {
    await this.modal.present()
  }

  async onDismissChange(isUpdated: boolean) {
    await this.modal.dismiss()
    if (isUpdated) {
      // The calendar reloads itself on ionViewWillEnter once we navigate to it.
      this.router.navigate(['brand/calendar']);
    }
  }

  private applyStatusChange(change$: Observable<unknown>, successTitle: string, successMessage: string) {
    change$.subscribe({
      next: () => {
        this.toastService.toastSuccess(successTitle, successMessage);
      },
      error: () => {
        this.toastService.toastDanger('Error', 'Sorry, we are having some issues at the moment. Please try again later.');
      },
      complete: () => {
        this.router.navigate(['brand/calendar']);
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

  readonly lifecycleBusy = signal(false);

  public validateCollaboration(): void {
    if (this.lifecycleBusy()) return;
    this.lifecycleBusy.set(true);
    this.store.complete(this.reservation().id).subscribe({
      next: (updated) => {
        this.lifecycleBusy.set(false);
        this.reservation.set(updated);
        this.toastService.toastSuccess('Collaboration validated', 'The influencer has been notified.');
      },
      error: (err) => {
        this.lifecycleBusy.set(false);
        this.toastService.toastDanger('Validation', err?.error?.detail ?? 'Could not validate. Please try again.');
      },
    });
  }

  public reportNoShow(): void {
    if (this.lifecycleBusy()) return;
    this.lifecycleBusy.set(true);
    this.store.reportNoShow(this.reservation().id).subscribe({
      next: (updated) => {
        this.lifecycleBusy.set(false);
        this.reservation.set(updated);
        this.toastService.toastSuccess('No-show reported', 'This collaboration is marked as a no-show.');
      },
      error: (err) => {
        this.lifecycleBusy.set(false);
        this.toastService.toastDanger('No-show', err?.error?.detail ?? 'Could not report the no-show. Please try again.');
      },
    });
  }

}
