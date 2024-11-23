import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ViewActivityPageRoutingModule } from './view-activity-routing.module';

import { ViewActivityPage } from './view-activity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ViewActivityPageRoutingModule
  ],
  declarations: [ViewActivityPage]
})
export class ViewActivityPageModule {}
