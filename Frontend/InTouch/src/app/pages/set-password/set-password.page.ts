import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { IonButton, IonContent, IonIcon, IonInput, IonToggle } from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { lockClosedOutline } from "ionicons/icons";
import { ApiAuthService } from "src/app/services/api/api-auth.service";
import { ToastService } from "src/app/services/toast.service";

/** Group-level validator: the confirmation must equal the new password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const next = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return next && confirm && next !== confirm ? { mismatch: true } : null;
}

/**
 * Public landing page for emailed uid+token links. Used by both flows:
 * the set-password invitation a freshly approved account receives, and
 * the regular "forgot password" reset.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-set-password',
    templateUrl: './set-password.page.html',
    styleUrls: ['./set-password.page.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonContent, IonInput, IonButton, IonIcon, IonToggle]
})
export class SetPasswordPage {

    public form: FormGroup;
    public showPasswords = false;
    readonly submitting = signal(false);
    readonly linkValid = signal(true);

    private uid = '';
    private token = '';

    private fb = inject(FormBuilder);
    private apiAuth = inject(ApiAuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    constructor() {
        addIcons({ lockClosedOutline });
        this.form = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
        }, { validators: passwordsMatch });

        const params = this.route.snapshot.queryParamMap;
        this.uid = params.get('uid') ?? '';
        this.token = params.get('token') ?? '';
        this.linkValid.set(!!(this.uid && this.token));
    }

    public submit(): void {
        if (this.form.invalid || this.submitting()) return;
        this.submitting.set(true);
        this.apiAuth.confirmPassword(this.uid, this.token, this.form.value.newPassword).subscribe({
            next: () => {
                this.submitting.set(false);
                this.toast.toastSuccess('Password saved', 'Your account is ready — you can now sign in.');
                this.router.navigateByUrl('/login');
            },
            error: (err: HttpErrorResponse) => {
                this.submitting.set(false);
                // An invalid/expired uid+token pair means the whole link is dead.
                const body = err?.error;
                if (body && (body.uid || body.token)) {
                    this.linkValid.set(false);
                    return;
                }
                this.toast.toastDanger('Could not save password', this.readError(err));
            },
        });
    }

    public goLogin(): void {
        this.router.navigateByUrl('/login');
    }

    /** Flattens Djoser's `{ field: [messages] }` 400 body into one readable line. */
    private readError(err: HttpErrorResponse): string {
        const body = err?.error;
        if (body && typeof body === 'object') {
            const messages: string[] = [];
            for (const value of Object.values(body)) {
                if (Array.isArray(value)) messages.push(...value.map(String));
                else if (value != null) messages.push(String(value));
            }
            if (messages.length) return messages.join(' ');
        }
        return 'Something went wrong. Please try again.';
    }
}
