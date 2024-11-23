import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ExperiencePageRoutingModule } from './experience-routing.module';

import { ExperiencePage } from './experience.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExperiencePageRoutingModule
  ],
  declarations: [ExperiencePage]
})
export class ExperiencePageModule {}
