import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonItem, IonLabel, IonTextarea } from "@ionic/angular/standalone";

@Component({
    selector: 'app-company-description',
    templateUrl: './company-description.component.html',
    styleUrls: ['../company.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonItem, IonLabel, IonTextarea]
})
export class CompanyDescriptionPage implements OnInit {
    @Input() descriptionEdit!: string;
    @Output() description = new EventEmitter<string>();

    public descriptionForm: FormGroup;

    constructor(
        private fb: FormBuilder,
    ) {
        this.descriptionForm = this.fb.group({
            description: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.descriptionForm.setValue({
            description: this.descriptionEdit
        })
    }

    addNewDescription() {
        this.description.emit(this.descriptionForm.value.description)
    }
    
}