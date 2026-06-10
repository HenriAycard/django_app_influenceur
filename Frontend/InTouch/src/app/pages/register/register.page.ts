import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, checkmarkCircle, logoInstagram, logoTiktok, logoYoutube, megaphoneOutline, storefrontOutline } from 'ionicons/icons';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { RegisterRequest } from 'src/app/shared/models';

type Step = 'role' | 'form' | 'done';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonIcon, IonInput, ReactiveFormsModule]
})
export class RegisterPage {

  private authService = inject(AuthService)
  private alertCtrlService = inject(AlertControllerService)
  private router = inject(Router)

  readonly step = signal<Step>('role');
  readonly role = signal<'influencer' | 'venue'>('influencer');
  readonly submitting = signal(false);

  public form: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
    ]),
    instagram: new FormControl(''),
    tiktok: new FormControl(''),
    youtube: new FormControl(''),
  });

  constructor() {
    addIcons({ arrowBack, checkmarkCircle, logoInstagram, logoTiktok, logoYoutube, megaphoneOutline, storefrontOutline });
  }

  chooseRole(role: 'influencer' | 'venue') {
    this.role.set(role);
    this.step.set('form');
  }

  back() {
    if (this.step() === 'form') {
      this.step.set('role');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  /** Influencers must declare at least one social handle. */
  private missingSocial(): boolean {
    if (this.role() !== 'influencer') return false;
    const v = this.form.value;
    return !(v.instagram?.trim() || v.tiktok?.trim() || v.youtube?.trim());
  }

  canSubmit(): boolean {
    return this.form.valid && !this.missingSocial() && !this.submitting();
  }

  submit() {
    if (!this.canSubmit()) return;
    const v = this.form.value;
    const params: RegisterRequest = {
      firstname: v.firstName,
      lastname: v.lastName,
      email: v.email,
      role: this.role(),
      instagram: v.instagram?.trim() || undefined,
      tiktok: v.tiktok?.trim() || undefined,
      youtube: v.youtube?.trim() || undefined,
    };

    this.submitting.set(true);
    this.authService.registerUser(params).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('done');
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const detail = err.error?.detail
          ?? 'A technical error occurred. Please try again later.';
        this.alertCtrlService.showError(detail);
      },
    });
  }

  signin() {
    this.router.navigateByUrl('/login');
  }

}
