import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfluenceurTabs } from './InfluenceurTabs.page';

const routes: Routes = [
  {
    path: '',
    component: InfluenceurTabs,
    children: [
      {
        path: 'explorer',
        loadChildren: () => import('../explorer/explorer.module').then(m => m.ExplorerPageModule)
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
        redirectTo: '/influenceur/explorer',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfluenceurTabsPageRoutingModule {}
