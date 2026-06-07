
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem } from "@ionic/angular/standalone";
import { Address, AddressDto } from "src/app/shared/models";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-address',
    templateUrl: './venue-address.component.html',
    styleUrls: ['../venue.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonButton, IonItem, IonInput]
})
export class VenueAddressPage implements OnInit {
    @Input() addressEdit!: Partial<Address>;
    @Output() address = new EventEmitter<Partial<Address>>();

    public addressForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {
        this.addressForm = this.fb.group({
            addressPrincipal: ['', [Validators.required]],
            addressSecondary: [''],
            city: ['', [Validators.required]],
            state: ['', [Validators.required]],
            country: ['', [Validators.required]],
            zipCode: ['', [Validators.required]]
        })
    }

    ngOnInit(): void {
        this.addressForm.patchValue(this.addressEdit)
    }

    addNewAddress() {
        const values: Partial<AddressDto> = {
            ...this.addressEdit,
            ...this.addressForm.value
        }
        this.address.emit(values)
    }
    
}