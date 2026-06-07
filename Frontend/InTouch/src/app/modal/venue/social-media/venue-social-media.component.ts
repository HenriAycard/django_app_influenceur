
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { IonButton, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonToggle } from "@ionic/angular/standalone";
import { VenueMainDto, SocialMedia, typeVenueDto } from "src/app/shared/models";
import { ApiVenueTypeService } from "src/app/services/api/api-venue-type.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-social-media',
    templateUrl: './venue-social-media.component.html',
    styleUrls: ['../venue.component.scss', './venue-social-media.component.scss'],
    standalone: true,
    imports: [FormsModule, IonButton, IonItem, ReactiveFormsModule, IonInput]
})
export class VenueSocialMediaComponent implements OnInit {

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