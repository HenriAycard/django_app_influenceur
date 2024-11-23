import { Component, OnInit, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonButton, IonContent, IonHeader, IonInput, IonItem, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LoginParam } from 'src/app/models/users';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonItem, ReactiveFormsModule, IonInput],
})
export class LoginPage implements OnInit {

  public form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(6)])
  });

  public authService = inject(AuthService)

  constructor(
    public router:Router,
    public alertController:AlertController) { }

    ngOnInit() { 
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    async onSubmit(){

      // stop here if form is invalid
      if (this.form.invalid) {
        return;
      }
      
      
      //this.apiService.showLoading();
      // Check email
      let params: LoginParam = {
        "email": this.f['email'].value,
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
            if (data["email"]){
              /*
              this.apiService.showLoading().then(()=>{
                this.apiService.sendResetPasswordLink(data["email"]).subscribe(()=>{
                  this.apiService.stopLoading()
                  this.apiService.showMessage(this.translateService.instant("Thanks"),this.translateService.instant("If this email exists on our platform, a reset link will be sent. Please don't forget to check your spams!"))
                })
              })*/
            
            }
            
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
