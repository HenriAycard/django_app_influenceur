import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSearchPage } from './view-search.page';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: ViewSearchPage,
  },
  {
    path: 'contract',
    loadChildren: () => import('./contract/contract.module').then( m => m.ContractPageModule)
  },
  {
    path: '',
    redirectTo: '/influenceur/explorer/view-search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), IonicModule],
  exports: [RouterModule],
})
export class ViewSearchPageRoutingModule {}
