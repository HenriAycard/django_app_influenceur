import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import {TranslateModule} from '@ngx-translate/core';
import { IonButton, IonContent, IonItem, IonRouterLink } from '@ionic/angular/standalone';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonButton,
    IonRouterLink,
    LoginPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
