import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewOffrePageRoutingModule } from './view-offre-routing.module';

import { ViewOffrePage } from './view-offre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewOffrePageRoutingModule
  ],
  declarations: [ViewOffrePage]
})
export class ViewOffrePageModule {}
