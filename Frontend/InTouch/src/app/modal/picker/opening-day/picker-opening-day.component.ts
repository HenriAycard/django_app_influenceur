import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { IonButton, IonButtons, IonContent, IonItem, IonLabel, IonPicker, IonPickerColumn, IonPickerColumnOption, IonRadio, IonToolbar, ModalController } from "@ionic/angular/standalone";

@Component({
    selector: 'app-picker-opening-day',
    templateUrl: './picker-opening-day.component.html',
    styleUrls: ['./picker-opening-day.component.scss'],
    standalone: true,
    imports: [CommonModule, IonButton, IonButtons, IonPicker, IonPickerColumn, IonToolbar, IonPickerColumnOption]
})
export class PickerOpeningDay implements OnInit {
    optionHours: any[] = [];
    optionMinutes: any[] = [];
    selectedHours: string = '00';
    selectedMinutes: string = '00';
    selectedClock: string = 'AM'; // Default is AM

    @Input() openingEdit: string | undefined = `${this.selectedHours}:${this.selectedMinutes} ${this.selectedClock}`;
    @Input() value: string = '';
    @Output() opening = new EventEmitter<Map<string, string>>();

    ngOnInit(): void {
        if (typeof this.openingEdit === 'string' && this.openingEdit != '') {
            // Split the string by space to separate time and clock
            let [time, clock] = this.openingEdit.split(' ');

            // Split the time part by colon to separate hours and minutes
            let [hours, minutes] = time.split(':');

            this.selectedHours = hours;
            this.selectedMinutes = minutes;
            this.selectedClock = clock;
        } else {
            this.openingEdit = `${this.selectedHours}:${this.selectedMinutes} ${this.selectedClock}`
        }
        
    }

    constructor(
        private modalController: ModalController
    ) {
        this.generateOptions();
    }

    generateOptions() {
        // Values for Hours
        for (let i = 0; i <= 12; i++) {
            let hour = i < 10 ? '0' + i.toString() : i.toString();
            this.optionHours.push({
                value: hour,
                text: hour
            });
        }

        // Values for Minutes
        for (let i = 0; i <= 59; i++) {
            let minute = i < 10 ? '0' + i.toString() : i.toString();
            this.optionMinutes.push({
                value: minute,
                text: minute
            });
        }
    }

    onIonChange(event: any, type: string) {
        if (type === 'Hours') {
            this.selectedHours = event.detail.value;
        } else if (type === 'Minutes') {
            this.selectedMinutes = event.detail.value;
        } else if (type === 'Clock') {
            this.selectedClock = event.detail.value;
        }
    }

    handleTimeSelection() {
        // Construct the selected time string based on the selected values
        const selectedTime = `${this.selectedHours}:${this.selectedMinutes} ${this.selectedClock}`;

        // Création d'une Map avec la clé et la valeur correspondante
        const timeMap = new Map<string, string>();
        timeMap.set(this.value, selectedTime);

        // Émission de la Map vers le composant parent
        this.opening.emit(timeMap);

        this.closeModalIfOpen()
    }

    cancel() { 
        this.closeModalIfOpen()
    }

    async closeModalIfOpen() {
        // Check if there is a modal open
        const topModal = await this.modalController.getTop();
        if (topModal) {
            // If a modal is open, dismiss it
            await this.modalController.dismiss();
        }
    }

}
