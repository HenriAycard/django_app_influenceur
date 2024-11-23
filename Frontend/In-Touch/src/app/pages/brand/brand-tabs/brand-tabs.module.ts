import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { BrandTabsPageRoutingModule } from './brand-tabs-routing.module';

import { BrandTabsPage } from './brand-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrandTabsPageRoutingModule
  ],
  declarations: [BrandTabsPage]
})
export class BrandTabsPageModule {}
