import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ExplorerPageRoutingModule } from './explorer-routing.module';

import { ExplorerPage } from './explorer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExplorerPageRoutingModule
  ],
  declarations: [ExplorerPage]
})
export class ExplorerPageModule {}
