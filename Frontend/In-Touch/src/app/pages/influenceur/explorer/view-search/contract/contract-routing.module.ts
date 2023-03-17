import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ContractPage } from './contract.page';

const routes: Routes = [
  {
    path: '',
    component: ContractPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), IonicModule],
  exports: [RouterModule],
})
export class ContractPageRoutingModule {}
