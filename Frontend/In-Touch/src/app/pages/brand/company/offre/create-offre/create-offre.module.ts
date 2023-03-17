import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateOffrePageRoutingModule } from './create-offre-routing.module';

import { CreateOffrePage } from './create-offre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateOffrePageRoutingModule
  ],
  declarations: [CreateOffrePage]
})
export class CreateOffrePageModule {}
