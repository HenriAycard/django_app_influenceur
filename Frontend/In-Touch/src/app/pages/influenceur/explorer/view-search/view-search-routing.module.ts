import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewSearchPage } from './view-search.page';

const routes: Routes = [
  {
    path: '',
    component: ViewSearchPage,
  },
  {
    path: 'experience',
    loadChildren: () => import('./experience/experience.module').then( m => m.ExperiencePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewSearchPageRoutingModule {}
