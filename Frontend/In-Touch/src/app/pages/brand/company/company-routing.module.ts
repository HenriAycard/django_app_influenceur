import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyPage } from './company.page';

const routes: Routes = [
  {
    path: '',
    component: CompanyPage
  },
  {
    path: 'view-activity',
    loadChildren: () => import('./activity/view-activity/view-activity.module').then( m => m.ViewActivityPageModule)
  },
  {
    path: 'view-offre',
    loadChildren: () => import('./offre/view-offre/view-offre.module').then( m => m.ViewOffrePageModule)
  },
  {
    path: 'create-offre',
    loadChildren: () => import('./offre/create-offre/create-offre.module').then( m => m.CreateOffrePageModule)
  },
  {
    path: 'create-company',
    loadChildren: () => import('./create-company/create-company.module').then( m => m.CreateCompanyPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyPageRoutingModule {}
