import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { Platform, AlertController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UserManagerProviderService } from 'src/app/services/user-manager-provider.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  validations_form: FormGroup;
  isIOS: boolean = false;
  passwordType = "password"
  passwordIcon = "eye-outline"
  constructor(public apiService: ApiserviceService,
    public formBuilder: FormBuilder,
    public platform: Platform,
    public router: Router,
    public alertController: AlertController,
    public authentificationService: AuthenticationService,

    public userManager: UserManagerProviderService) {

    if (this.platform.is("ios")) {
      this.isIOS = true;
    }

    this.validations_form = this.formBuilder.group({
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
  }
  

  goNext() {
    this.apiService.showMessage("Thanks", "Account created.")
    this.router.navigateByUrl("/home")
  }
 

  createAccount(params: any) {
      // Création du compte.
      this.apiService.registerUser(params).subscribe((resultat: any) => {
        let status = resultat["status"];
        if (status=="OK") {
          let data = resultat["data"]
          console.log("data")
          console.log(data)
          //this.userManager.setItem(data)
            // create a token
              // Check email
          let paramsToLogin = {
            "email": params.email,
            "password": params.password,
          }
          this.authentificationService.login(paramsToLogin).subscribe({
            next: (value: any) => {
              this.apiService.stopLoading();
              this.router.navigateByUrl("/tabs")
            },
            error: (err: any) => {
              this.apiService.showError("A technical error occured. Account creation impossible")
            }
          }) 
        } else {
          this.apiService.stopLoading();
          let error = resultat["error"]
          if (error.status==400){
            this.apiService.showError("An account already exists with this email. Please login !")
          }
          else{
            this.apiService.showError("A technical error occured. Account creation impossible")
          }
         
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
      this.apiService.showError("Please enter an email")
      return
    }
    if (confirmpassword != password) {
      this.apiService.showError("Passwords doesn't match")
      return
    }
    
      let params = {
        "email": email,
        "password": password,
        "first_name": firstName,
        "last_name": lastName
      }
      this.createAccount(params)
    
  }
  ngOnInit() {
  }


}
