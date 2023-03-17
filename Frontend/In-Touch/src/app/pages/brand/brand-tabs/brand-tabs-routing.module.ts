import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrandTabsPage } from './brand-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: BrandTabsPage,
    children: [
      {
        path: 'company',
        loadChildren: () => import('../company/company.module').then(m => m.CompanyPageModule)
      },
      {
        path: 'agenda',
        loadChildren: () => import('../agenda/agenda.module').then(m => m.AgendaPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/brand/company',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrandTabsPageRoutingModule {}
