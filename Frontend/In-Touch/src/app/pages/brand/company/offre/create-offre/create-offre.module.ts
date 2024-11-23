import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { CreateOffrePageRoutingModule } from './create-offre-routing.module';

import { CreateOffrePage } from './create-offre.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CreateOffrePageRoutingModule
  ],
  declarations: [CreateOffrePage]
})
export class CreateOffrePageModule {}
