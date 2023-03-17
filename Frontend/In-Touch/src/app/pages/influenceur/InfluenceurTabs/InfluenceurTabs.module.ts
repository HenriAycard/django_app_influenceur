import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfluenceurTabsPageRoutingModule } from './InfluenceurTabs-routing.module';

import { InfluenceurTabs } from './InfluenceurTabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfluenceurTabsPageRoutingModule
  ],
  declarations: [InfluenceurTabs]
})
export class InfluenceurTabsPageModule {}
