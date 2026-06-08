
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { logoInstagram, logoTiktok, logoYoutube } from "ionicons/icons";
import { User } from "src/app/shared/models";
import { ApiAuthService } from "src/app/services/api/api-auth.service";

/** Networks rendered in the edit form: [handle control, follower control]. */
const NETWORKS: ReadonlyArray<[string, string]> = [
    ['instagram', 'instagramFollowers'],
    ['tiktok', 'tiktokFollowers'],
    ['youtube', 'youtubeFollowers'],
];

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.page.html',
    styleUrls: ['./profile-edit.page.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonInput, IonButton, IonIcon]
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
        addIcons({ logoInstagram, logoTiktok, logoYoutube });
        this.profileForm = this.fb.group({
            firstname: ['', [Validators.required]],
            lastname: ['', [Validators.required]],
            instagram: [''],
            tiktok: [''],
            youtube: [''],
            instagramFollowers: [null],
            tiktokFollowers: [null],
            youtubeFollowers: [null],
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
        // A follower count is meaningless without its handle: drop it when the
        // handle is empty (per the per-network rule).
        for (const [handle, followers] of NETWORKS) {
            if (!this.profileForm.get(handle)?.value) {
                this.profileForm.patchValue({ [followers]: null });
            }
        }
        const values: Partial<User> = {
            ...this.profileForm.value
        }
        this.apiAuth.update(this.userId, values).subscribe({
            complete: () => {
                this.router.navigate(['..'], { relativeTo: this.route })
            }
        })
    }
}
