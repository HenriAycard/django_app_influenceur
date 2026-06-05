import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonContent, IonItem, IonTextarea, IonButton, IonInput, IonCol, IonTitle, IonGrid, IonRow, IonButtons, IonToolbar, IonHeader, IonBackButton, IonToggle, IonAccordion, IonAccordionGroup, IonDatetime, IonDatetimeButton, IonIcon, IonList, IonModal, IonSelect, IonSelectOption, IonToast } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { informationCircleOutline } from "ionicons/icons";
import { Deal } from "src/app/models/deal";


@Component({
    selector: 'app-contract-form',
    templateUrl: './contract-form.component.html',
    styleUrls: ['./contract-form.component.scss'],
    standalone: true,
    imports: [RouterModule, ReactiveFormsModule, FormsModule, IonItem, IonTextarea, IonInput, IonCol, IonRow, IonButton, IonRow, IonCol, IonToggle, IonDatetime, IonList, CommonModule, IonDatetimeButton, IonModal, IonAccordionGroup, IonAccordion, IonSelectOption, IonSelect, IonIcon, IonToast]
})
export class ContractFormComponent implements OnInit {

    @Input() contractEdit!: Partial<Deal>;
    @Output() contract = new EventEmitter<Partial<Deal>>();

    public form: FormGroup;
    public today: Date = new Date()
    public todayToString: string = this.today.toISOString();

    public noEndDate: boolean = true;
    public isPaymentTerms: boolean = false;
    public isExclusivityClause: boolean = false;
    public isApprovalRequired: boolean = false;

    public infoType: string | null = null;
    public exclusivityType: string = '';

    constructor(
        private fb: FormBuilder) {

        addIcons({ informationCircleOutline });

        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
            startDate: [this.todayToString, Validators.required],
            endDate: [null],
            content: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
            conditions: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
            quantity: [null, [Validators.maxLength(4)]],
            tags: ['', [Validators.required, Validators.maxLength(100)]],
            publishingDeadline: [null, [Validators.maxLength(4)]],
            contactApprover: [null, [Validators.maxLength(100)]],
            paymentAmount: [null, [Validators.maxLength(18)]],
            paymentTerms: [null],
            cancellationPolicy: [null, Validators.maxLength(1000)],
            specialInstructions: [null, Validators.maxLength(1000)],
            exclusivityDuration: [null, [Validators.maxLength(4)]],
            restrictedCompetitors: [null, Validators.maxLength(200)],
            scopeExclusivity: [null, Validators.maxLength(500)],
            exclusivityType: [null],
            exclusivitySpecification: [null, Validators.maxLength(500)]
        });
    }

    ngOnInit(): void {
        this.form.patchValue(this.contractEdit)
        if (this.contractEdit) {
            if (this.contractEdit.endDate) this.noEndDate = false
            if (this.contractEdit.paymentAmount ||
                this.contractEdit.paymentTerms) this.isPaymentTerms = true
            if (this.contractEdit.exclusivityDuration ||
                this.contractEdit.restrictedCompetitors ||
                this.contractEdit.scopeExclusivity ||
                this.contractEdit.exclusivityType ||
                this.contractEdit.exclusivitySpecification) this.isExclusivityClause = true
            if (this.contractEdit.contactApprover) this.isApprovalRequired = true
        }

    }

    toggleEndDate() {
        if (this.noEndDate) {
            this.form.patchValue({ endDate: null });
        } else {
            this.form.patchValue({ endDate: this.form.get('startDate')?.value })
        }
    }

    togglePaymentTerms() {
        if (!this.isPaymentTerms) {
            this.form.patchValue({
                paymentAmount: null,
                paymentTerms: null
            })
        }
    }

    toggleExclusivityClause() {
        if (!this.isExclusivityClause) {
            this.form.patchValue({
                exclusivityDuration: null,
                restrictedCompetitors: null,
                scopeExclusivity: null,
                exclusivityType: null,
                exclusivitySpecification: null
            })
        }
    }

    toggleApprovalRequired() {
        if (!this.isApprovalRequired) {
            this.form.patchValue({ contactApprover: null })
        }
    }

    save(form: FormGroup) {

        if (form.get('quantity')?.value === '') {
            form.patchValue({ quantity: null })
        }
        if (form.get('exclusivityDuration')?.value === '') {
            form.patchValue({ exclusivityDuration: null })
        }
        if (form.get('paymentAmount')?.value === '') {
            form.patchValue({ paymentAmount: null })
        }
        if (form.get('publishingDeadline')?.value === '') {
            form.patchValue({ publishingDeadline: null })
        }
        if (form.get('startDate')?.value) {
            const formattedDate = form.get('startDate')?.value.split('T')[0]; // Extracts "YYYY-MM-DD"
            form.patchValue({ startDate: formattedDate });
        }
        if (form.get('endDate')?.value) {
            const formattedDate = form.get('endDate')?.value.split('T')[0]; // Extracts "YYYY-MM-DD"
            form.patchValue({ endDate: formattedDate });
        }

        const deal: Partial<Deal> = {
            ...form.value
        }

        this.contract.emit(deal);
    }

    customCounterFormatter(inputLength: number, maxLength: number) {
        return `${maxLength - inputLength} characters remaining`;
    }

    showInfo(type: string) {
        this.infoType = type;
    }

    dismissInfo() {
        this.infoType = null
    }

}