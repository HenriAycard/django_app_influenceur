import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewOffrePage } from './view-offre.page';

const routes: Routes = [
  {
    path: '',
    component: ViewOffrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewOffrePageRoutingModule {}
