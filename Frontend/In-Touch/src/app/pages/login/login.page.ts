import { Component, OnInit, forwardRef } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { TranslateService } from '@ngx-translate/core';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { User } from 'src/app/services/entities';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form!: FormGroup;

  constructor(public apiService:ApiserviceService,
    public router:Router,
    public alertController:AlertController,
    public translateService: TranslateService,
    public authentificationService:AuthenticationService,
    public userManager:UserManagerProviderService) { }

    ngOnInit() {
      this.form = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6)])
      });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit(){

      // stop here if form is invalid
      if (this.form.invalid) {
        return;
      }
      
      
      this.apiService.showLoading();
      // Check email
      let params = {
        "email": this.f['email'].value,
        "password": this.f['password'].value,
      }

      this.authentificationService.login(params).subscribe({
        next: (value: any) => {
          this.authentificationService.fetchCurrentUser()
          .subscribe({
            next: (response: Array<User>) => {
              console.log("[LoginPage] - login - login")
              if (response.length === 1) {
                console.log("[LoginPage] - login - User is retrieved")
                this.authentificationService.user$.next(response[0])
                this.authentificationService.isAuthenticated.next(true)
                this.apiService.stopLoading();
                if (response[0].is_influencer) {
                  this.router.navigate(['/influenceur']);
                } else {
                  this.router.navigate(['/brand']);
                }
              } else {
                this.router.navigate(['/login']);
              }
            },
            error: (err: HttpErrorResponse) => {
              this.apiService.stopLoading();
            this.displayWrongLogin()
            }
          })
        },
          error: (err: HttpErrorResponse) => {
            this.apiService.stopLoading();
            this.displayWrongLogin()
          }
      
      })
  }
 

  goNext(){
    this.router.navigateByUrl("/login")
  }
 
  signup(){
    this.router.navigateByUrl("/register")
  }

  async forgetPwd() {
    const alert = await this.alertController.create({
      header: this.translateService.instant("Please enter an email"),
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: this.translateService.instant("Cancel"),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
             
          }
        }, {
          text: this.translateService.instant("Confirm"),
          handler: (data) => {
            if (data["email"]){
              this.apiService.showLoading().then(()=>{
                this.apiService.sendResetPasswordLink(data["email"]).subscribe(()=>{
                  this.apiService.stopLoading()
                  this.apiService.showMessage(this.translateService.instant("Thanks"),this.translateService.instant("If this email exists on our platform, a reset link will be sent. Please don't forget to check your spams!"))
                })
              })
            
            }
            
          }
        }
      ]
    });

    await alert.present();
  }
  
  
  displayWrongLogin(){
    this.apiService.showError(this.translateService.instant("Unable to authenticate. Please check your email/password"))
  }
 

}
