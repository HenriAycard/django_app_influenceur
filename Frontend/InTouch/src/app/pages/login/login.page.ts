import { ChangeDetectionStrategy, Component, OnInit, forwardRef, inject } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LoginParam } from 'src/app/shared/models';
import { AuthService } from 'src/app/services/auth.service';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, FormsModule, IonButton, IonItem, ReactiveFormsModule, IonInput],
})
export class LoginPage implements OnInit {

  public form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)])
  });

  public authService = inject(AuthService)
  private apiAuth = inject(ApiAuthService)
  private toast = inject(ToastService)

  constructor(
    public router:Router,
    public alertController:AlertController) { }

    ngOnInit() {
      // Session is already restored at bootstrap; if the user is authenticated,
      // send them straight to their home instead of showing the login screen.
      if (this.authService.isAuth()) {
        this.authService.redirection();
      }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    async onSubmit(){

      // stop here if form is invalid
      if (this.form.invalid) {
        return;
      }

      // Request notification permission here — must be inside a user gesture handler
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Emails are case-insensitive; mobile keyboards love to auto-capitalize the
      // first letter (and slip in a trailing space), which the backend lookup
      // treats as a different — non-existent — account and rejects with a 401.
      // Normalize here so "Lorena@…" / " lorena@… " still sign in.
      let params: LoginParam = {
        "email": (this.f['email'].value ?? '').trim().toLowerCase(),
        "password": this.f['password'].value,
      }

      this.authService.login(params)

  }
 

  goNext(){
    this.router.navigateByUrl("/login")
  }
 
  signup(){
    this.authService.logout()
    this.router.navigateByUrl("/register")
  }

  async forgetPwd() {
    const alert = await this.alertController.create({
      header: "Please enter an email",
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
             
          }
        }, {
          text: "Confirm",
          handler: (data) => {
            const email = (data["email"] || '').trim();
            if (!email) return;
            // Same message either way: don't leak whether the email exists.
            const done = () => this.toast.toastSuccess(
              'Check your inbox',
              "If this email matches an account, you'll receive a link to reset your password. Don't forget to check your spam folder!"
            );
            this.apiAuth.requestPasswordReset(email).subscribe({ next: done, error: done });
          }
        }
      ]
    });

    await alert.present();
  }
  
  
  displayWrongLogin(){
    //this.apiService.showError(this.translateService.instant("Unable to authenticate. Please check your email/password"))
  }
 

}
