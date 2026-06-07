
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonToggle, SelectCustomEvent } from "@ionic/angular/standalone";
import { CompanyMainDto, typeCompanyDto } from "src/app/shared/models";
import { ApiCompanyTypeService } from "src/app/services/api/api-company-type.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-company-main',
    templateUrl: './company-main.component.html',
    styleUrls: ['../company.component.scss'],
    standalone: true,
    imports: [FormsModule, IonButton, IonItem, IonList, IonSelectOption, IonSelect, ReactiveFormsModule, FormsModule, IonInput, IonToggle]
})
export class CompanyMainPage implements OnInit {

    public mainForm: FormGroup;
    readonly typeCompany = signal<typeCompanyDto[]>([]);

    @Input() companyEdit!: Partial<CompanyMainDto>;
    @Output() companyData = new EventEmitter<Partial<CompanyMainDto>>();

    private apiCompanyType = inject(ApiCompanyTypeService);

    constructor(
        private fb: FormBuilder,
    ) {
        this.mainForm = this.fb.group({
            nameCompany: ['', [Validators.required]],
            isOnsit: [false, [Validators.required]],
            isTakeaway: [false, [Validators.required]],
            typeCompany: [null, [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.apiCompanyType.findTypeCompany().subscribe({
            next: (response: typeCompanyDto[]) => {
                this.typeCompany.set(response as typeCompanyDto[]);
            },
            complete: () => this.initializeData()
        });
    }

    public initializeData() {
        this.mainForm.patchValue({
            nameCompany: this.companyEdit.nameCompany,
            isOnsit: this.companyEdit.isOnsit,
            isTakeaway: this.companyEdit.isTakeaway,
            typeCompany: this.typeCompany().find((value) => value.id === this.companyEdit.typeCompany?.id) || null
        })
    }

    public compareWith(o1: typeCompanyDto, o2: typeCompanyDto) {
        return o1 && o2 ? o1.id === o2.id : o1 === o2;
    }

    public handleChange(event: SelectCustomEvent<typeCompanyDto>): void {
        const selectedType = event.detail.value; // The selected value from the ion-select

        // Update the form control value if needed
        this.mainForm.patchValue({
            typeCompany: selectedType,
        });
    }

    public addNewCompany() {
        const values: Partial<CompanyMainDto> = {
            ...this.mainForm.value
        }
        this.companyData.emit(values)
    }
}