
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonItem, IonLabel, IonTextarea } from "@ionic/angular/standalone";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-description',
    templateUrl: './venue-description.component.html',
    styleUrls: ['../venue.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonButton, IonItem, IonLabel, IonTextarea]
})
export class VenueDescriptionPage implements OnInit {
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