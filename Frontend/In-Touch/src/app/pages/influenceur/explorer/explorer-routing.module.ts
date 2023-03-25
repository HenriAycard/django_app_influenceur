import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExplorerPage } from './explorer.page';

const routes: Routes = [
  {
    path: '',
    component: ExplorerPage,
  },
  {
    path: 'view-search',
    loadChildren: () => import('./view-search/view-search.module').then( m => m.ViewSearchPageModule)
  },
  {
    path: '',
    redirectTo: '/influenceur/explorer',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExplorerPageRoutingModule {}
