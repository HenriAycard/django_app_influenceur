
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonModal, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, checkmarkCircleOutline, closeCircleOutline, createOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { ApplicationStore } from 'src/app/features/applications/application.store';
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
  imports: [IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonModal, IonSpinner, ModalEditReservationComponent, BookingViewPage, ReviewSectionComponent]
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
  private toastService = inject(ToastService)
  private router = inject(Router)
  private navCtrl = inject(NavController)

  constructor() {
    addIcons({ arrowBack, checkmarkCircleOutline, createOutline, closeCircleOutline });
  }

  goBack(): void {
    this.navCtrl.back();
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

}
