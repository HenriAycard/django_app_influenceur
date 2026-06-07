
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonToggle, SelectCustomEvent } from "@ionic/angular/standalone";
import { VenueMainDto, typeVenueDto } from "src/app/shared/models";
import { ApiVenueTypeService } from "src/app/services/api/api-venue-type.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-main',
    templateUrl: './venue-main.component.html',
    styleUrls: ['../venue.component.scss'],
    standalone: true,
    imports: [FormsModule, IonButton, IonItem, IonList, IonSelectOption, IonSelect, ReactiveFormsModule, FormsModule, IonInput, IonToggle]
})
export class VenueMainPage implements OnInit {

    public mainForm: FormGroup;
    readonly typeVenue = signal<typeVenueDto[]>([]);

    @Input() venueEdit!: Partial<VenueMainDto>;
    @Output() venueData = new EventEmitter<Partial<VenueMainDto>>();

    private apiVenueType = inject(ApiVenueTypeService);

    constructor(
        private fb: FormBuilder,
    ) {
        this.mainForm = this.fb.group({
            nameVenue: ['', [Validators.required]],
            isOnsit: [false, [Validators.required]],
            isTakeaway: [false, [Validators.required]],
            typeVenue: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.apiVenueType.findTypeVenue().subscribe({
            next: (response: typeVenueDto[]) => {
                this.typeVenue.set(response as typeVenueDto[]);
            },
            complete: () => this.initializeData()
        });
    }

    public initializeData() {
        this.mainForm.patchValue({
            nameVenue: this.venueEdit.nameVenue,
            isOnsit: this.venueEdit.isOnsit,
            isTakeaway: this.venueEdit.isTakeaway,
            typeVenue: this.typeVenue().find((value) => value.id === this.venueEdit.typeVenue?.id) || null
        })
    }

    public compareWith(o1: typeVenueDto, o2: typeVenueDto) {
        return o1 && o2 ? o1.id === o2.id : o1 === o2;
    }

    public handleChange(event: SelectCustomEvent<typeVenueDto>): void {
        const selectedType = event.detail.value; // The selected value from the ion-select

        // Update the form control value if needed
        this.mainForm.patchValue({
            typeVenue: selectedType,
        });
    }

    public addNewVenue() {
        const values: Partial<VenueMainDto> = {
            ...this.mainForm.value
        }
        this.venueData.emit(values)
    }
}