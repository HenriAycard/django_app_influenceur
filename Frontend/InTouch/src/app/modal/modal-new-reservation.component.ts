import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CheckboxCustomEvent, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonRefresher, IonRefresherContent, IonSkeletonText, IonThumbnail, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { AlertControllerService } from "../services/alert-controller.service";
import { ToastService } from "../services/toast.service";
import { BookingCreateParam } from "../models/booking";
import { ApiBookingService } from "../services/api/api-booking.service";


@Component({
    selector: 'app-modal-new-reservation',
    templateUrl: './modal-new-reservation.component.html',
    styleUrls: ['./modal-new-reservation.component.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSkeletonText, IonLabel, IonCard, IonCardContent, IonThumbnail, IonItem, IonListHeader, IonList, IonCheckbox, IonButton, IonButtons, IonModal, IonCardSubtitle, IonCardTitle, IonCardHeader, IonChip, IonIcon, IonFab, IonFabButton, IonRefresher, IonRefresherContent, RouterLink, ReactiveFormsModule, IonDatetime, IonDatetimeButton],
  })
  export class ModalNewReservationComponent implements OnInit {

    @Input() modal!: IonModal;
    @Input() idOffer!: number;
    @Output() dismissChange = new EventEmitter<boolean>();

    public canDismiss = false;
    public today: Date = new Date()
    public todayToString: string = this.today.toISOString();
    public minDate: string = this.todayToString;
    public maxDate: string = this.todayToString;
    public dateReservation: string = this.todayToString;
    

    private alertCtrlService = inject(AlertControllerService);
    private apiBooking = inject(ApiBookingService)
    private toastService = inject(ToastService)

    ngOnInit(): void {
      var datePlusMonths: Date = this.today;
      datePlusMonths.setMonth(datePlusMonths.getMonth()+1);
      this.maxDate = datePlusMonths.toISOString();

      console.log(this.idOffer)
    }

    
    async saveReservation() {
      console.log("New reservation on going ...")
      this.alertCtrlService.showLoading()

      let newResa: BookingCreateParam = {
        offer: this.idOffer,
        dateReservation: this.dateReservation
      };
  
      this.apiBooking.createBooking(newResa).subscribe({
        next: (value: any) => {
          this.toastService.toastSuccess(
            'New reservation !',
            'A new reservation has been added to your calendar, please wait the brand confirm'
          )
        },
        error: (err: any) => {
            this.toastService.toastDanger(
              'We have a little problem',
              'Sorry your reservation failed'
            )
        },
        complete: () => this.alertCtrlService.stopLoading()
      })
    }

    confirm() {
      if(this.canDismiss && this.dateReservation != null){
        this.saveReservation()
      } else if (!this.canDismiss) {
        this.toastService.toastWarn(
          'Please complete all details',
          'You forgot to accept the terms and conditions'
        )
      } else {
        this.toastService.toastWarn(
          'Please complete all details',
          'You forgot to select a date and time'
        )
      }
      this.modal.dismiss(null, 'confirm')
        .then(() => {
          this.dismissChange.emit(true)
        })
    }

    cancel() {
      this.modal.dismiss(null, 'cancel')
        .then(() => {
          this.dismissChange.emit(true)
        })
    }

    onTermsChanged(event: Event) {
      const ev = event as CheckboxCustomEvent;
      this.canDismiss = ev.detail.checked;
    }
  }