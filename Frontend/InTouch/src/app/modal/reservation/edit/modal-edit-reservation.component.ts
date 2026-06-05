import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CheckboxCustomEvent, IonButton, IonButtons, IonCheckbox, IonContent, IonDatetime, IonHeader, IonItem, IonLabel, IonList, IonModal, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { AlertControllerService } from "../../../services/alert-controller.service";
import { ToastService } from "../../../services/toast.service";
import { BookingBrand } from "../../../models/booking";
import { ApiBookingService } from "../../../services/api/api-booking.service";


@Component({
    selector: 'app-modal-edit-reservation',
    templateUrl: './modal-edit-reservation.component.html',
    styleUrls: ['./modal-edit-reservation.component.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonCheckbox, IonButton, IonButtons, ReactiveFormsModule, IonDatetime, IonList],
})
export class ModalEditReservationComponent implements OnInit {

    @Input() reservation!: BookingBrand;
    @Output() dismissChange = new EventEmitter<boolean>();

    public canDismiss = false;
    public today: Date = new Date()
    public todayToString: string = this.today.toISOString();
    public minDate: string = this.todayToString;
    public maxDate: string = this.todayToString;
    public dateReservation: string = this.todayToString;

    private toastService = inject(ToastService)
    private apiBooking = inject(ApiBookingService)

    ngOnInit(): void {
        // Calcul max date
        var datePlusMonths: Date = this.today;
        datePlusMonths.setMonth(datePlusMonths.getMonth() + 1);
        this.maxDate = datePlusMonths.toISOString();

        if (this.reservation) {
            this.today = this.reservation.dateReservation;
            this.todayToString = this.today.toISOString();
            this.dateReservation = this.todayToString
        }
    }

    confirm() {
        if (this.canDismiss && this.dateReservation != null) {
            this.updateReservation()
        } else if (!this.canDismiss) {
            this.toastService.toastWarn('Please complete all details', 'You forgot to accept the terms and conditions')
        } else {
            this.toastService.toastWarn('Please complete all details', 'You forgot to select a date and time')
        }
    }

    cancel() {
        this.dismissChange.emit(false)
    }

    onTermsChanged(event: Event) {
        const ev = event as CheckboxCustomEvent;
        this.canDismiss = ev.detail.checked;
    }

    private updateReservation() {

        const params: Partial<BookingBrand> = {
            dateReservation: new Date(this.dateReservation)
        };

        this.apiBooking.updateBooking(this.reservation.id, params).subscribe({
            next: (value: any) => {
                this.toastService.toastSuccess('New reservation !', 'A new reservation has been added to your calendar, please wait the brand confirm')
                this.dismissChange.emit(true)
            },
            error: (err: any) => {
                this.toastService.toastDanger('We have a little problem', 'Sorry your reservation failed')
                this.dismissChange.emit(false)
            }
        })
    }

}