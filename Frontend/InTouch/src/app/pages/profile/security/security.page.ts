import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToggle, IonToolbar } from "@ionic/angular/standalone";
import { ApiAuthService } from "src/app/services/api/api-auth.service";
import { ToastService } from "src/app/services/toast.service";

/** Group-level validator: the confirmation must equal the new password. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const next = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return next && confirm && next !== confirm ? { mismatch: true } : null;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-security',
    templateUrl: './security.page.html',
    styleUrls: ['./security.page.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonItem, IonInput, IonButton, IonToggle]
})
export class SecurityPage {

    public form: FormGroup;
    public showPasswords = false;
    readonly submitting = signal(false);

    private fb = inject(FormBuilder);
    private apiAuth = inject(ApiAuthService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    constructor() {
        this.form = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
        }, { validators: passwordsMatch });
    }

    public submit(): void {
        if (this.form.invalid || this.submitting()) return;
        this.submitting.set(true);
        this.apiAuth.changePassword({
            current_password: this.form.value.currentPassword,
            new_password: this.form.value.newPassword,
        }).subscribe({
            next: () => {
                this.submitting.set(false);
                this.toast.toastSuccess('Password updated', 'Your password has been changed successfully.');
                this.router.navigate(['..'], { relativeTo: this.route });
            },
            error: (err: HttpErrorResponse) => {
                this.submitting.set(false);
                this.toast.toastDanger('Could not update password', this.readError(err));
            },
        });
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
        return 'Please check your current password and try again.';
    }
}
