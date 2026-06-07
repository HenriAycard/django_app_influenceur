
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from "@ionic/angular/standalone";
import { VenueMainDto, typeVenueDto, User } from "src/app/shared/models";
import { ApiAuthService } from "src/app/services/api/api-auth.service";
import { ApiVenueTypeService } from "src/app/services/api/api-venue-type.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.page.html',
    styleUrls: ['./profile-edit.page.scss'],
    standalone: true,
    imports: [FormsModule, IonButton, IonItem, ReactiveFormsModule, FormsModule, IonInput, IonContent, IonTitle, IonBackButton, IonButtons, IonToolbar, IonHeader]
})
export class ProfileEditPage implements OnInit {

    public profileForm: FormGroup;
    public userId: string = '';
    readonly isInfluencer = signal(false);

    private apiAuth = inject(ApiAuthService);

    constructor(
        private fb: FormBuilder,
        private router: Router, 
        private route: ActivatedRoute,
    ) {
        this.profileForm = this.fb.group({
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            instagram: [''],
            tiktok: [''],
            youtube: [''],
        });
    }

    ngOnInit(): void {
        this.apiAuth.findUser().subscribe({
            next: (response: User) => {
                this.userId = response.id
                this.isInfluencer.set(response.isInfluencer)
                this.profileForm.patchValue(response)
            }
        });
    }

    public onSubmit(): void {
        const values: Partial<User> = {
            ...this.profileForm.value
        }
        this.apiAuth.update(this.userId, values).subscribe({
            complete: () => {
                this.router.navigate(['..'], { relativeTo: this.route})
            }
        })
    }
}