import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateOffrePage } from './create-offre.page';

const routes: Routes = [
  {
    path: '',
    component: CreateOffrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateOffrePageRoutingModule {}
