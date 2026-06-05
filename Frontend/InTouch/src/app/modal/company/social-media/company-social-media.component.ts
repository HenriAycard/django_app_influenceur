import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonToggle } from "@ionic/angular/standalone";
import { CompanyMainDto, SocialMedia, typeCompanyDto } from "src/app/models/company";
import { ApiCompanyTypeService } from "src/app/services/api/api-company-type.service";

@Component({
    selector: 'app-company-social-media',
    templateUrl: './company-social-media.component.html',
    styleUrls: ['../company.component.scss', './company-social-media.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonButton, IonItem, ReactiveFormsModule, IonInput]
})
export class CompanySocialMediaComponent implements OnInit {

    public socialMediaForm: FormGroup;

    @Input() socialMediaEdit!: SocialMedia;
    @Output() socialMedia = new EventEmitter<SocialMedia>();

    constructor(
        private fb: FormBuilder,
    ) {
        this.socialMediaForm = this.fb.group({
            instagram: [''],
            tiktok: [''],
            youtube: [''],
            facebook: [''],
            twitter: [''],
        });
    }

    ngOnInit(): void {
        this.socialMediaForm.patchValue(this.socialMediaEdit)
    }

    public onSubmit(): void {
        const values: SocialMedia = {
            ...this.socialMediaForm.value
        }
        this.socialMedia.emit(values)
    }

}