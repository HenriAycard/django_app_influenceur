import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonRow,  IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, create, logoFacebook, logoInstagram, logoTiktok, logoTwitter, logoYoutube } from 'ionicons/icons';
import { BookingBrand } from 'src/app/models/booking';
import { ApiBookingService } from 'src/app/services/api/api-booking.service';
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

  public reservation: BookingBrand = {} as BookingBrand
  public isLoad: boolean = false

  private apiBooking = inject(ApiBookingService)
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
    this.apiBooking.findBooking(this.bookingId).subscribe({
      next: (value: BookingBrand) => {
        this.reservation = value
        this.isLoad = true
      }
    })
  }


  public cancelReservation() {
    const reservation: Partial<BookingBrand> = {
      status: 2
    };
    this.updateReservationStatus(reservation, 'Reservation cancelled!', `The reservation of ${this.reservation.user.firstname} ${this.reservation.user.lastname} is cancelled`)
  }

  private updateReservationStatus(reservation: Partial<BookingBrand>, successTitle: string, successMessage: string) {
    this.apiBooking.updateBooking(this.reservation.id, reservation).subscribe({
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
    if (this.reservation.status === 1) {
      const today = new Date();
      //const reservationDate = new Date(reservation.dateReservation);
      return this.reservation.dateReservation < today; // true if date is before today
    }
    return false;
  }

}
