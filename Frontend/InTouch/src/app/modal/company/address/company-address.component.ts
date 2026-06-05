import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem } from "@ionic/angular/standalone";
import { Address, AddressDto } from "src/app/models/address";

@Component({
    selector: 'app-company-address',
    templateUrl: './company-address.component.html',
    styleUrls: ['../company.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonItem, IonInput]
})
export class CompanyAddressPage implements OnInit {
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