import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

const routes: Routes = [
  /*{
    path: 'brand',
    loadChildren: () => import('./pages/brand/brand-tabs/brand-tabs.module').then(m => m.BrandTabsPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'influenceur',
    loadChildren: () => import('./pages/influenceur/InfluenceurTabs/InfluenceurTabs.module').then(m => m.InfluenceurTabsPageModule),
    canActivate: [authGuard]
  },*/
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
