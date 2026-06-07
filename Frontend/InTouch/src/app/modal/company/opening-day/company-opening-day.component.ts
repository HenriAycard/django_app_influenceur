
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonButton, IonButtons, IonChip, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonModal, IonText, IonTitle, IonToggle, IonToolbar } from "@ionic/angular/standalone";
import { OpeningDate, OpeningDayEnum } from "src/app/shared/models";
import { PickerOpeningDay } from "../../picker/opening-day/picker-opening-day.component";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-company-opening-day',
    templateUrl: './company-opening-day.component.html',
    styleUrls: ['../company.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonButton, IonItem, IonLabel, IonItemOption, IonItemSliding, IonList, IonToggle, IonChip, IonText, IonContent, IonItemOptions, IonButtons, IonTitle, IonToolbar, IonIcon, IonHeader, IonModal, PickerOpeningDay]
})
export class CompanyOpeningDayPage implements OnInit {
    @ViewChild(IonModal) modal!: IonModal;

    @Input() openingDayEdit!: OpeningDate[];
    @Output() openingDay = new EventEmitter<OpeningDate[]>();

    public days: {id: number, name: string}[] = [{ id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }, { id: 3, name: 'Wednesday' }, { id: 4, name: 'Thursday' }, { id: 5, name: 'Friday' }, { id: 6, name: 'Saturday' }, { id: 7, name: 'Sunday' }]
    public daysChip: {id: number, name: string}[] = []
    public tagDefaultColor = Array(this.daysChip.length).fill("medium");
    public daysSelected: number[] = []
    public isBreak: boolean = false;
    public opening = new Map<string, string>();
    public openingDayEnum = OpeningDayEnum;
    public openingDefault = "00:00 AM"

    ngOnInit(): void {
        this.openingDayEdit.sort((a, b) => a.idDay - b.idDay);
    }

    setDayChip() {
        this.daysChip = this.days.filter(day => this.openingDayEdit.some(item => item.idDay === day.id && !item.isOpen))
        this.daysChip.sort(((a: { id: number; name: string; }, b: { id: number; name: string; }) => a.id - b.id))
        this.tagDefaultColor = Array(this.daysChip.length).fill("medium");
    }

    addNewOpeningDay() {
        this.openingDay.emit(this.openingDayEdit)
    }

    onTimeSelected(timeMap: Map<string, string>) {
        // Récupérer la clé et la valeur de la Map
        const key = Array.from(timeMap.keys())[0];
        const selectedTime = timeMap.get(key);
        this.opening.set(key, `${selectedTime}`);
    }

    onWillPresent() {
        this.daysSelected = []
        this.setDayChip()
        this.opening.set(OpeningDayEnum.START_DATE, this.openingDefault);
        this.opening.set(OpeningDayEnum.END_DATE, this.openingDefault);
    }

    resetModal() {
        this.tagDefaultColor = Array(this.daysChip.length).fill("medium");
        this.daysSelected = []
        this.opening = new Map<string, string>();
        this.isBreak = false
        this.modal.dismiss();
    }

    cancel() {
        this.resetModal()
    }

    confirm() {

        this.openingDayEdit = this.openingDayEdit.filter(item => !this.daysSelected.some(day => day === item.idDay))

        this.daysSelected.forEach((item: number) => {
            let newOpeningDay: OpeningDate = {} as OpeningDate;

            this.days.forEach(value => {
                if (value.id === item) {
                    newOpeningDay.day = value.name
                }
            })

            newOpeningDay.openHour = this.opening.get(OpeningDayEnum.START_DATE)!;
            newOpeningDay.closeHour = this.opening.get(OpeningDayEnum.END_DATE)!;

            if (this.isBreak) {
                newOpeningDay.breakStart = this.opening.get(OpeningDayEnum.PAUSE_START)!;
                newOpeningDay.breakEnd = this.opening.get(OpeningDayEnum.PAUSE_END)!;
            }

            newOpeningDay.isOpen = true
            newOpeningDay.idDay = item

            this.openingDayEdit.push(newOpeningDay)
        })

        this.openingDayEdit.sort((a, b) => a.idDay - b.idDay);

        this.resetModal()
        this.modal.dismiss();
    }

    public deleteOpeningDate(isOrderBy: number) {
        var resetOpeningDay: OpeningDate = {} as OpeningDate;

        resetOpeningDay.isOpen = false
        resetOpeningDay.openHour = ""
        resetOpeningDay.closeHour = ""
        resetOpeningDay.breakStart = ""
        resetOpeningDay.breakEnd = ""

        this.openingDayEdit.forEach(item => {
            if (item.idDay === isOrderBy) {
                resetOpeningDay.id = item.id;
                resetOpeningDay.idDay = item.idDay
                resetOpeningDay.company = item.company
                resetOpeningDay.day = item.day
            }
        })

        // Step 1: Remove the item with the specified id
        this.openingDayEdit = this.openingDayEdit.filter(item => item.idDay !== isOrderBy);

        // Step 2: Push the updated data back into the array
        this.openingDayEdit.push(resetOpeningDay);

        // Optional: Sort the array by id
        this.openingDayEdit.sort((a, b) => a.idDay - b.idDay);
    }

    changeTagColor(i: number) {
        if (this.tagDefaultColor[i] === "medium") {
            this.tagDefaultColor[i] = "success"
            this.daysSelected.push(this.daysChip[i].id)
        } else {
            this.tagDefaultColor[i] = "medium"
            this.daysSelected = this.daysSelected.filter(item => item !== this.daysChip[i].id)
        }
    }

    setBreak() {
        if (this.isBreak) {
            this.opening.set(OpeningDayEnum.PAUSE_START, this.openingDefault);
            this.opening.set(OpeningDayEnum.PAUSE_END, this.openingDefault);
        } else {
            this.opening.delete(OpeningDayEnum.PAUSE_START);
            this.opening.delete(OpeningDayEnum.PAUSE_END);
        }
    }

}