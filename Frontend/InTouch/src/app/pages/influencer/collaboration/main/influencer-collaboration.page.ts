
import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, closeCircleOutline } from 'ionicons/icons';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { ApplicationStore } from 'src/app/features/applications/application.store';
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
  imports: [IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonSpinner, BookingViewPage, ReviewSectionComponent]
})
export class InfluencerCollaborationPage implements OnInit {

  @Input() bookingId!: number;

  readonly reservation = signal<Application>({} as Application)
  readonly isLoad = signal(false)
  public readonly ApplicationStatus = ApplicationStatus;

  private store = inject(ApplicationStore)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private navCtrl = inject(NavController)

  constructor() {
    addIcons({ arrowBack, closeCircleOutline });
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

}
