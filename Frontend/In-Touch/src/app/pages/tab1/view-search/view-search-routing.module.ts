import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSearchPage } from './view-search.page';

const routes: Routes = [
  {
    path: '',
    component: ViewSearchPage
  },
  {
    path: 'contract',
    loadChildren: () => import('./contract/contract.module').then( m => m.ContractPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewSearchPageRoutingModule {}
