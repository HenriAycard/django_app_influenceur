import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserParam } from 'src/app/models/users';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonButton, IonInput, ReactiveFormsModule]
})
export class RegisterPage {

  private authService = inject(AuthService)
  private alertCtrlService = inject(AlertControllerService)

  public passwordType = "password"
  public passwordIcon = "eye-outline"

  public validations_form: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.compose([
      Validators.required
    ])),
    lastName: new FormControl('', Validators.compose([
      Validators.required
    ])),
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])),
    password: new FormControl('', Validators.compose([
      Validators.minLength(6),
      Validators.required,
    ])),
    confirmpassword: new FormControl('', Validators.compose([
      Validators.minLength(6),
      Validators.required,
    ])),
  });

  constructor(private router: Router) {}

  goNext() {
    this.alertCtrlService.showMessage("Thanks", "Account created.")
    this.router.navigateByUrl("/home")
  }
  
  createAccount(params: UserParam) {
    this.alertCtrlService.loadingPresent();
    // Création du compte.
    this.authService.registerUser(params).subscribe({
      next: (response: any) => {
        this.alertCtrlService.stopLoading();
        this.alertCtrlService.showMessage("Thanks", "Account created.")
        this.router.navigateByUrl("/login")
      },
      error: (err: HttpErrorResponse) => {
        this.alertCtrlService.stopLoading();
        this.alertCtrlService.showError("A technical error occured. Account creation impossible")
      }
    })
  }

  signin() {
    this.router.navigateByUrl("/login")
  }

  register() {
    
    let email = this.validations_form.get("email")?.value
    let password = this.validations_form.get("password")?.value
    let confirmpassword = this.validations_form.get("confirmpassword")?.value 
    let firstName = this.validations_form.get("firstName")?.value 
    let lastName = this.validations_form.get("lastName")?.value

    if (!email) {
      this.alertCtrlService.showError("Please enter an email")
      return
    }
    if (confirmpassword != password) {
      this.alertCtrlService.showError("Passwords doesn't match")
      return
    }
    
    let params: UserParam = {
      "email": email,
      "password": password,
      "first_name": firstName,
      "last_name": lastName
    }
    this.createAccount(params)
    
  }

}
