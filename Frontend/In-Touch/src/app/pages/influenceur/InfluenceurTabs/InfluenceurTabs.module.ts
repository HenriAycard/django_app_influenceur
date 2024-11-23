import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { InfluenceurTabsPageRoutingModule } from './InfluenceurTabs-routing.module';

import { InfluenceurTabs } from './InfluenceurTabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InfluenceurTabsPageRoutingModule
  ],
  declarations: [InfluenceurTabs]
})
export class InfluenceurTabsPageModule {}
