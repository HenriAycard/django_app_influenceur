import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonRow,  IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, create, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube } from 'ionicons/icons';
import { Application, ApplicationStatus } from 'src/app/shared/models';
import { ApiApplicationService } from 'src/app/features/applications/api-application.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { ReloadService } from 'src/app/services/reload.service';
import { ModalEditReservationComponent } from 'src/app/modal/reservation/edit/modal-edit-reservation.component';
import { BookingViewPage } from 'src/app/modal/booking/booking-view.component';


@Component({
  selector: 'app-influencer-collaboration',
  templateUrl: './influencer-collaboration.page.html',
  styleUrls: ['./influencer-collaboration.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonButtons, IonContent, IonBackButton, IonTitle, IonHeader, IonToolbar, IonIcon, BookingViewPage]
})
export class InfluencerCollaborationPage implements OnInit {

  @Input() bookingId!: number;

  public reservation: Application = {} as Application
  public isLoad: boolean = false
  public readonly ApplicationStatus = ApplicationStatus;

  private apiApplication = inject(ApiApplicationService)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private reloadService = inject(ReloadService);

  constructor() {
    addIcons({ logoInstagram, logoTiktok, logoYoutube, logoTwitter, logoFacebook, checkmarkCircle, create, closeCircle });
  }

  ngOnInit(): void {
    this.loadData()
  }

  public loadData(): void {
    this.apiApplication.findApplication(this.bookingId).subscribe({
      next: (value: Application) => {
        this.reservation = value
        this.isLoad = true
      }
    })
  }


  public cancelReservation() {
    const reservation: Partial<Application> = {
      status: ApplicationStatus.Declined
    };
    this.updateReservationStatus(reservation, 'Reservation cancelled!', `The reservation of ${this.reservation.user.firstname} ${this.reservation.user.lastname} is cancelled`)
  }

  private updateReservationStatus(reservation: Partial<Application>, successTitle: string, successMessage: string) {
    this.apiApplication.updateApplication(this.reservation.id, reservation).subscribe({
      next: (value: any) => {
        this.toastService.toastSuccess(successTitle, successMessage);
      },
      error: (err: any) => {
        this.toastService.toastDanger('Error', 'Sorry, we are having some issues at the moment. Please try again later.');
      },
      complete: () => {
        this.router.navigate(['influencer/calendar']).then(() => {
          this.reloadService.triggerReload();
        });
      }
    });
  }

  public isPastReservation(): boolean {
    if (this.reservation.status === ApplicationStatus.Accepted) {
      const today = new Date();
      //const reservationDate = new Date(reservation.dateReservation);
      return this.reservation.dateReservation < today; // true if date is before today
    }
    return false;
  }

}
